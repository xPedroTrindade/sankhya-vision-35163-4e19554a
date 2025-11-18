import { Ticket, TicketStats, ChartData, CompanyData } from "@/types/ticket";

export const processTicketData = (tickets: Ticket[]): TicketStats => {
  const totalTickets = tickets.length;
  const ticketsAbertos = tickets.filter(t => t.status.toLowerCase().includes('aberto')).length;
  const ticketsFechados = tickets.filter(t => t.status.toLowerCase().includes('fechado')).length;
  const ticketsPendentes = tickets.filter(t => t.status.toLowerCase().includes('pendente')).length;
  const prioridadeAlta = tickets.filter(t => t.prioridade.toLowerCase().includes('alta')).length;

  // Calculate average resolution time
  let totalResolucao = 0;
  let ticketsResolvidos = 0;

  tickets.forEach(ticket => {
    if (ticket.status.toLowerCase().includes('fechado')) {
      const criacao = new Date(ticket.horaCriacao);
      const atualizacao = new Date(ticket.horaUltimaAtualizacao);
      const diff = atualizacao.getTime() - criacao.getTime();
      if (!isNaN(diff) && diff > 0) {
        totalResolucao += diff;
        ticketsResolvidos++;
      }
    }
  });

  const tempoMedioResolucao = ticketsResolvidos > 0 
    ? Math.round((totalResolucao / ticketsResolvidos) / (1000 * 60 * 60)) // hours
    : 0;

  return {
    totalTickets,
    ticketsAbertos,
    ticketsFechados,
    ticketsPendentes,
    prioridadeAlta,
    tempoMedioResolucao
  };
};

export const getStatusChartData = (tickets: Ticket[]): ChartData[] => {
  const statusMap: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    const status = ticket.status || 'Não definido';
    statusMap[status] = (statusMap[status] || 0) + 1;
  });

  return Object.entries(statusMap).map(([name, value]) => ({
    name,
    value
  }));
};

export const getPriorityChartData = (tickets: Ticket[]): ChartData[] => {
  const priorityMap: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    const priority = ticket.prioridade || 'Não definida';
    priorityMap[priority] = (priorityMap[priority] || 0) + 1;
  });

  return Object.entries(priorityMap).map(([name, value]) => ({
    name,
    value
  }));
};

export const getProcessChartData = (tickets: Ticket[]): ChartData[] => {
  const processMap: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    const process = ticket.processo || 'Não definido';
    processMap[process] = (processMap[process] || 0) + 1;
  });

  return Object.entries(processMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({
      name,
      value
    }));
};

export const getTypeChartData = (tickets: Ticket[]): ChartData[] => {
  const typeMap: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    const type = ticket.tipo || 'Não definido';
    typeMap[type] = (typeMap[type] || 0) + 1;
  });

  return Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({
      name,
      value
    }));
};

export const getTopRequesters = (tickets: Ticket[]): ChartData[] => {
  const requesterMap: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    const name = ticket.nomeSolicitante || 'Não identificado';
    requesterMap[name] = (requesterMap[name] || 0) + 1;
  });

  return Object.entries(requesterMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name,
      value
    }));
};

export const getCompanyData = (tickets: Ticket[]): CompanyData[] => {
  const companyMap: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    const email = ticket.emailSolicitante || '';
    const domain = email.split('@')[1] || 'unknown';
    companyMap[domain] = (companyMap[domain] || 0) + 1;
  });

  return Object.entries(companyMap)
    .map(([domain, ticketCount]) => ({
      domain,
      name: domain.split('.')[0]?.toUpperCase() || domain,
      ticketCount
    }))
    .sort((a, b) => b.ticketCount - a.ticketCount);
};

export const getTimelineData = (tickets: Ticket[]): ChartData[] => {
  const dateMap: { [key: string]: number } = {};
  
  tickets.forEach(ticket => {
    try {
      const date = new Date(ticket.horaCriacao);
      const dateStr = date.toLocaleDateString('pt-BR');
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
    } catch (e) {
      // ignore invalid dates
    }
  });

  return Object.entries(dateMap)
    .sort((a, b) => {
      const dateA = new Date(a[0].split('/').reverse().join('-'));
      const dateB = new Date(b[0].split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-30) // last 30 days
    .map(([name, value]) => ({
      name,
      value
    }));
};

export const generateInsights = (tickets: Ticket[], stats: TicketStats): string[] => {
  const insights: string[] = [];

  // High priority tickets with urgency
  if (stats.prioridadeAlta > 0) {
    const urgentOpen = tickets.filter(t => 
      t.prioridade.toLowerCase().includes('alta') && 
      t.status.toLowerCase().includes('aberto')
    ).length;
    
    if (urgentOpen > 0) {
      insights.push(`⚠️ Atenção: ${urgentOpen} tickets de prioridade alta estão em aberto e requerem ação imediata.`);
    }
  }

  // Average resolution time comparison
  if (stats.tempoMedioResolucao > 0) {
    const benchmark = 12; // hours
    const diff = stats.tempoMedioResolucao - benchmark;
    if (diff > 0) {
      insights.push(`⏱️ O tempo médio de resolução (${stats.tempoMedioResolucao}h) está ${Math.round(diff)}h acima do benchmark ideal. Oportunidade de otimização identificada.`);
    } else {
      insights.push(`✅ Excelente! O tempo médio de resolução (${stats.tempoMedioResolucao}h) está dentro do padrão ideal.`);
    }
  }

  // Open tickets percentage with context
  const openPercentage = Math.round((stats.ticketsAbertos / stats.totalTickets) * 100);
  const closedPercentage = Math.round((stats.ticketsFechados / stats.totalTickets) * 100);
  
  if (openPercentage > 60) {
    insights.push(`📊 ${openPercentage}% dos tickets estão em aberto. Recomendação: Revisar alocação de recursos e considerar automação de processos repetitivos.`);
  } else if (closedPercentage > 80) {
    insights.push(`🎯 Taxa de fechamento de ${closedPercentage}% demonstra alta eficiência operacional do time de suporte!`);
  }

  // Most common process with actionable insight
  const processData = getProcessChartData(tickets);
  if (processData.length > 0) {
    const topProcess = processData[0];
    const percentage = Math.round((topProcess.value / stats.totalTickets) * 100);
    
    if (percentage > 35) {
      insights.push(`🏭 O processo "${topProcess.name}" concentra ${percentage}% dos chamados. Sugestão: Criar base de conhecimento específica e treinar usuários neste módulo.`);
    }
    
    // Second most common for comparison
    if (processData.length > 1) {
      const secondProcess = processData[1];
      const growth = Math.round(((topProcess.value - secondProcess.value) / secondProcess.value) * 100);
      if (growth > 50) {
        insights.push(`📈 "${topProcess.name}" tem ${growth}% mais tickets que "${secondProcess.name}". Avaliar se há problemas sistêmicos no módulo.`);
      }
    }
  }

  // Top requester with pattern analysis
  const topRequesters = getTopRequesters(tickets);
  if (topRequesters.length > 0) {
    const top = topRequesters[0];
    const userTickets = tickets.filter(t => t.nomeSolicitante === top.name);
    const openCount = userTickets.filter(t => t.status.toLowerCase().includes('aberto')).length;
    
    if (top.value > 10) {
      insights.push(`👤 ${top.name} é o usuário mais ativo com ${top.value} tickets (${openCount} em aberto). Considerar treinamento personalizado ou verificar problemas recorrentes.`);
    }
  }

  // Type pattern analysis
  const typeData = getTypeChartData(tickets);
  if (typeData.length > 0 && typeData[0].value > stats.totalTickets * 0.3) {
    insights.push(`🔍 ${Math.round((typeData[0].value / stats.totalTickets) * 100)}% dos tickets são do tipo "${typeData[0].name}". Oportunidade para criar automação ou documentação preventiva.`);
  }

  return insights;
};
