export interface Ticket {
  id: string;
  assunto: string;
  descricao: string;
  status: string;
  prioridade: string;
  tipo: string;
  nomeSolicitante: string;
  emailSolicitante: string;
  horaCriacao: string;
  horaUltimaAtualizacao: string;
  processo: string;
  empresa?: string;
  avaliacao?: string;
}

export interface TicketStats {
  totalTickets: number;
  ticketsAbertos: number;
  ticketsFechados: number;
  ticketsPendentes: number;
  prioridadeAlta: number;
  tempoMedioResolucao: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CompanyData {
  domain: string;
  name: string;
  ticketCount: number;
}
