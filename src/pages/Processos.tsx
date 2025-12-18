import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useTickets } from "@/contexts/TicketContext";
import { differenceInHours, parseISO, format } from "date-fns";

const Processos = () => {
  const { tickets } = useTickets();
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  // Processar dados reais dos tickets
  const processosData = useMemo(() => {
    const processoMap = new Map<string, {
      total: number;
      abertos: number;
      fechados: number;
      tempos: number[];
      prioridade_alta: number;
    }>();

    tickets.forEach(ticket => {
      const processo = ticket.processo || "Sem Processo";
      
      if (!processoMap.has(processo)) {
        processoMap.set(processo, {
          total: 0,
          abertos: 0,
          fechados: 0,
          tempos: [],
          prioridade_alta: 0
        });
      }

      const data = processoMap.get(processo)!;
      data.total++;
      
      if (ticket.status.toLowerCase() === "aberto" || ticket.status.toLowerCase() === "em andamento") {
        data.abertos++;
      } else if (ticket.status.toLowerCase() === "fechado" || ticket.status.toLowerCase() === "resolvido") {
        data.fechados++;
        
        // Calcular tempo de resolução
        try {
          const criacao = parseISO(ticket.horaCriacao);
          const atualizacao = parseISO(ticket.horaUltimaAtualizacao);
          const horas = differenceInHours(atualizacao, criacao);
          if (horas >= 0) {
            data.tempos.push(horas);
          }
        } catch (e) {
          // Ignorar erros de parse
        }
      }

      if (ticket.prioridade.toLowerCase() === "alta" || ticket.prioridade.toLowerCase() === "urgente") {
        data.prioridade_alta++;
      }
    });

    return Array.from(processoMap.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      abertos: data.abertos,
      fechados: data.fechados,
      media: data.tempos.length > 0 
        ? Math.round(data.tempos.reduce((a, b) => a + b, 0) / data.tempos.length)
        : 0,
      prioridade_alta: data.prioridade_alta
    })).sort((a, b) => b.total - a.total);
  }, [tickets]);

  // Gerar dados de evolução mensal
  const evolutionData = useMemo(() => {
    const monthMap = new Map<string, Record<string, number>>();

    tickets.forEach(ticket => {
      try {
        const data = parseISO(ticket.horaCriacao);
        const mes = format(data, "MMM/yy");
        const processo = ticket.processo || "Sem Processo";

        if (!monthMap.has(mes)) {
          monthMap.set(mes, {});
        }

        const monthData = monthMap.get(mes)!;
        monthData[processo] = (monthData[processo] || 0) + 1;
      } catch (e) {
        // Ignorar erros de parse
      }
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([mes, processos]) => ({
        mes,
        ...processos
      }));
  }, [tickets]);

  // Top 3 processos para o gráfico de evolução
  const topProcessos = useMemo(() => {
    return processosData.slice(0, 3).map(p => p.name);
  }, [processosData]);

  // Insights inteligentes
  const insights = useMemo(() => {
    if (processosData.length === 0) return [];

    const totalTickets = tickets.length;
    const insights: Array<{ type: 'warning' | 'success', title: string, description: string }> = [];

    // Insight 1: Processo com mais tickets
    const topProcesso = processosData[0];
    if (topProcesso && totalTickets > 0) {
      const percentage = Math.round((topProcesso.total / totalTickets) * 100);
      if (percentage > 30) {
        insights.push({
          type: 'warning',
          title: `${topProcesso.name} requer atenção`,
          description: `O processo concentra ${percentage}% dos tickets totais e possui ${topProcesso.prioridade_alta} tickets de alta prioridade. Considere alocar recursos adicionais.`
        });
      }
    }

    // Insight 2: Processo com maior tempo de resolução
    const slowProcesso = [...processosData].sort((a, b) => b.media - a.media)[0];
    if (slowProcesso && slowProcesso.media > 0) {
      insights.push({
        type: 'warning',
        title: `${slowProcesso.name} tem resolução lenta`,
        description: `Tempo médio de ${slowProcesso.media}h está acima da média. Avalie os gargalos e processos de atendimento.`
      });
    }

    // Insight 3: Processo com melhor desempenho
    const bestProcesso = processosData.find(p => p.fechados > p.abertos && p.media > 0 && p.media < 10);
    if (bestProcesso) {
      insights.push({
        type: 'success',
        title: `${bestProcesso.name} está performando bem`,
        description: `Mantém ${bestProcesso.fechados} tickets resolvidos com tempo médio de ${bestProcesso.media}h. Práticas podem ser replicadas.`
      });
    }

    return insights;
  }, [processosData, tickets]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Análise por Processos
            </h1>
            <p className="text-muted-foreground">
              Visão detalhada do comportamento de cada processo operacional
            </p>
          </div>

          {/* Cards de Processos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processosData.map((processo, index) => (
              <Card 
                key={processo.name}
                className={`shadow-lg border-none bg-gradient-card cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                  selectedProcess === processo.name ? 'ring-2 ring-primary shadow-glow' : ''
                }`}
                onClick={() => setSelectedProcess(processo.name)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-lg bg-gradient-primary">
                        <Package className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-foreground">{processo.total}</p>
                        <p className="text-xs text-muted-foreground">tickets</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{processo.name}</h3>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Em aberto</span>
                          <span className="font-semibold text-accent">{processo.abertos}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tempo médio</span>
                          <span className="font-semibold text-foreground">{processo.media}h</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Alta prioridade</span>
                          <span className="font-semibold text-destructive">{processo.prioridade_alta}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-none bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Comparativo de Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processosData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="abertos" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Tempo Médio de Resolução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processosData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="media" fill="hsl(var(--chart-3))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Evolução */}
          <Card className="shadow-lg border-none bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Evolução Mensal por Processo
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  {topProcessos.map((processo, index) => (
                    <Line 
                      key={processo}
                      type="monotone" 
                      dataKey={processo} 
                      stroke={index === 0 ? "hsl(var(--chart-1))" : index === 1 ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))"} 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights Inteligentes */}
          {insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <Card 
                  key={index}
                  className={`border-l-4 ${
                    insight.type === 'warning' ? 'border-l-primary' : 'border-l-accent'
                  } shadow-md bg-gradient-card`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {insight.type === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                      )}
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{insight.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tickets.length === 0 && (
            <Card className="shadow-lg border-none bg-gradient-card">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">Nenhum ticket encontrado</p>
                <p className="text-sm text-muted-foreground">Faça upload de um arquivo Excel para visualizar a análise por processos.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Processos;
