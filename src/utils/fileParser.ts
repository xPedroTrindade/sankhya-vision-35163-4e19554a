import * as XLSX from 'xlsx';
import { Ticket } from '@/types/ticket';

const columnMapping: { [key: string]: keyof Ticket } = {
  'ID do ticket': 'id',
  'Assunto': 'assunto',
  'Descrição': 'descricao',
  'Status': 'status',
  'Prioridade': 'prioridade',
  'Tipo': 'tipo',
  'Nome do solicitante': 'nomeSolicitante',
  'E-mail do solicitante': 'emailSolicitante',
  'Hora da criação': 'horaCriacao',
  'Hora da última atualização': 'horaUltimaAtualizacao',
  'Processo': 'processo'
};

export const parseFile = async (file: File): Promise<Ticket[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Formato de arquivo não suportado. Use .csv, .xlsx ou .xls');
  }
};

const parseCSV = async (file: File): Promise<Ticket[]> => {
  const text = await file.text();
  const workbook = XLSX.read(text, { type: 'string' });
  return parseWorkbook(workbook);
};

const parseExcel = async (file: File): Promise<Ticket[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  return parseWorkbook(workbook);
};

const parseWorkbook = (workbook: XLSX.WorkBook): Ticket[] => {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
  
  return jsonData.map((row: any, index) => {
    const ticket: any = {};
    
    Object.entries(columnMapping).forEach(([csvColumn, ticketKey]) => {
      ticket[ticketKey] = row[csvColumn] || '';
    });
    
    // Ensure ID exists
    if (!ticket.id) {
      ticket.id = `TICKET-${index + 1}`;
    }
    
    return ticket as Ticket;
  });
};

export const validateTickets = (tickets: Ticket[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (tickets.length === 0) {
    errors.push('Arquivo não contém dados válidos');
    return { valid: false, errors };
  }
  
  const requiredFields: (keyof Ticket)[] = ['id', 'assunto', 'status'];
  const firstTicket = tickets[0];
  
  requiredFields.forEach(field => {
    if (!firstTicket[field]) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  });
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, errors: [] };
};
