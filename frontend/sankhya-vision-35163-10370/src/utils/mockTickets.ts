import { Ticket } from "@/types/ticket";
import { COMPANIES } from "@/contexts/CompanyContext";

// Gerar tickets fictícios para Setembro e Outubro 2025
export const generateMockTickets = (): Ticket[] => {
  const tickets: Ticket[] = [];
  
  // Configurações
  const meses = [
    { mes: 9, ano: 2025, nome: 'Setembro', totalTickets: 40 },
    { mes: 10, ano: 2025, nome: 'Outubro', totalTickets: 35 }
  ];
  
  const status = ['Aberto', 'Em Andamento', 'Concluído', 'Fechado'];
  const prioridades = ['Baixa', 'Média', 'Alta', 'Urgente'];
  const tipos = ['Incidente', 'Solicitação', 'Problema', 'Mudança'];
  const avaliacoes = ['satisfeito', 'neutro', 'insatisfeito'];
  const processos = [
    'Financeiro',
    'Compras',
    'Estoque',
    'Faturamento',
    'Vendas',
    'CRM',
    'Relatórios',
    'Integração'
  ];
  
  const solicitantes = [
    { nome: 'João Silva', email: 'joao.silva@empresa.com' },
    { nome: 'Maria Santos', email: 'maria.santos@empresa.com' },
    { nome: 'Pedro Oliveira', email: 'pedro.oliveira@empresa.com' },
    { nome: 'Ana Costa', email: 'ana.costa@empresa.com' },
    { nome: 'Carlos Ferreira', email: 'carlos.ferreira@empresa.com' },
    { nome: 'Julia Almeida', email: 'julia.almeida@empresa.com' },
    { nome: 'Roberto Souza', email: 'roberto.souza@empresa.com' },
    { nome: 'Fernanda Lima', email: 'fernanda.lima@empresa.com' }
  ];
  
  const assuntos = [
    'Erro ao gerar nota fiscal',
    'Integração com sistema externo',
    'Relatório não carrega dados',
    'Problema no cadastro de produtos',
    'Alteração de permissões de usuário',
    'Lentidão no sistema',
    'Erro ao fechar pedido',
    'Dúvida sobre funcionalidade',
    'Solicitação de novo campo customizado',
    'Erro ao importar planilha',
    'Problema com impressão de relatórios',
    'Falha na sincronização de estoque',
    'Erro ao calcular impostos',
    'Problema no módulo financeiro',
    'Solicitação de treinamento',
    'Erro ao acessar dashboard',
    'Problema com backup de dados',
    'Dúvida sobre processo de compras',
    'Erro ao gerar boleto',
    'Falha no envio de e-mails'
  ];
  
  let ticketId = 1;
  
  meses.forEach(({ mes, ano, totalTickets }) => {
    for (let i = 0; i < totalTickets; i++) {
      const dia = Math.floor(Math.random() * 28) + 1;
      const hora = Math.floor(Math.random() * 24);
      const minuto = Math.floor(Math.random() * 60);
      
      const dataCriacao = new Date(ano, mes - 1, dia, hora, minuto);
      const diasResolucao = Math.floor(Math.random() * 10) + 1;
      const dataAtualizacao = new Date(dataCriacao);
      dataAtualizacao.setDate(dataAtualizacao.getDate() + diasResolucao);
      
      const solicitante = solicitantes[Math.floor(Math.random() * solicitantes.length)];
      const assunto = assuntos[Math.floor(Math.random() * assuntos.length)];
      
      // Determinar status baseado na data
      let ticketStatus = status[Math.floor(Math.random() * status.length)];
      if (mes === 9) {
        // Setembro: maioria dos tickets fechados
        ticketStatus = Math.random() > 0.2 ? 'Fechado' : ticketStatus;
      }
      
      tickets.push({
        id: `TICKET-${String(ticketId).padStart(5, '0')}`,
        assunto: assunto,
        descricao: `Descrição detalhada do ticket: ${assunto}. Cliente reportou o problema e solicitou atendimento.`,
        status: ticketStatus,
        prioridade: prioridades[Math.floor(Math.random() * prioridades.length)],
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        nomeSolicitante: solicitante.nome,
        emailSolicitante: solicitante.email,
        horaCriacao: dataCriacao.toISOString(),
        horaUltimaAtualizacao: dataAtualizacao.toISOString(),
        processo: processos[Math.floor(Math.random() * processos.length)],
        empresa: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
        avaliacao: ticketStatus === 'Fechado' ? avaliacoes[Math.floor(Math.random() * avaliacoes.length)] : undefined
      });
      
      ticketId++;
    }
  });
  
  return tickets.sort((a, b) => {
    const dateA = new Date(a.horaCriacao);
    const dateB = new Date(b.horaCriacao);
    return dateB.getTime() - dateA.getTime();
  });
};
