import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, TrendingUp, Clock, Award, FileX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useTickets } from "@/contexts/TicketContext";
import { parseISO, differenceInHours } from "date-fns";

const Solicitantes = () => {
  const { tickets } = useTickets();
  const [searchTerm, setSearchTerm] = useState("");

  // Process tickets to get requester statistics
  const solicitantesData = useMemo(() => {
    const requesterMap = new Map();

    tickets.forEach(ticket => {
      const key = ticket.emailSolicitante;
      if (!requesterMap.has(key)) {
        requesterMap.set(key, {
          nome: ticket.nomeSolicitante,
          email: ticket.emailSolicitante,
          empresa: ticket.emailSolicitante.split('@')[1]?.split('.')[0] || 'N/A',
          total: 0,
          abertos: 0,
          fechados: 0,
          prioridade_alta: 0,
          tipos: new Map(),
          tempoTotal: 0,
          ticketsComTempo: 0
        });
      }

      const stats = requesterMap.get(key);
      stats.total++;
      
      if (ticket.status.toLowerCase() === 'aberto') stats.abertos++;
      if (ticket.status.toLowerCase() === 'fechado') stats.fechados++;
      if (ticket.prioridade.toLowerCase() === 'alta') stats.prioridade_alta++;
      
      // Count ticket types
      const tipoCount = stats.tipos.get(ticket.tipo) || 0;
      stats.tipos.set(ticket.tipo, tipoCount + 1);

      // Calculate resolution time
      try {
        const created = parseISO(ticket.horaCriacao);
        const updated = parseISO(ticket.horaUltimaAtualizacao);
        const hours = differenceInHours(updated, created);
        if (hours > 0) {
          stats.tempoTotal += hours;
          stats.ticketsComTempo++;
        }
      } catch {}
    });

    return Array.from(requesterMap.values()).map(stats => ({
      nome: stats.nome,
      email: stats.email,
      empresa: stats.empresa.charAt(0).toUpperCase() + stats.empresa.slice(1),
      total: stats.total,
      abertos: stats.abertos,
      fechados: stats.fechados,
      media: stats.ticketsComTempo > 0 ? Math.round(stats.tempoTotal / stats.ticketsComTempo) : 0,
      prioridade_alta: stats.prioridade_alta,
      tipo_mais_comum: stats.tipos.size > 0 
        ? Array.from(stats.tipos.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A'
    })).sort((a, b) => b.total - a.total);
  }, [tickets]);

  const chartData = solicitantesData.slice(0, 10).map(s => ({
    nome: s.nome.split(' ')[0],
    Abertos: s.abertos,
    Fechados: s.fechados
  }));

  const filteredData = solicitantesData.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.empresa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topByActivity = solicitantesData[0];
  const topByResolutionTime = [...solicitantesData].sort((a, b) => b.media - a.media)[0];
  const topByUrgency = [...solicitantesData].sort((a, b) => b.prioridade_alta - a.prioridade_alta)[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Análise por Solicitantes
            </h1>
            <p className="text-muted-foreground">
              Identificação de usuários mais ativos e padrões de comportamento
            </p>
          </div>

          {/* Search */}
          <Card className="shadow-lg border-none bg-gradient-card">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-background border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          {solicitantesData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg border-none bg-gradient-success overflow-hidden">
                <CardContent className="p-6 text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Mais Ativo</p>
                      <p className="text-2xl font-bold">{topByActivity?.nome || 'N/A'}</p>
                      <p className="text-sm opacity-75 mt-1">{topByActivity?.total || 0} tickets</p>
                    </div>
                    <Award className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-none bg-gradient-secondary overflow-hidden">
                <CardContent className="p-6 text-secondary-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Maior Média</p>
                      <p className="text-2xl font-bold">{topByResolutionTime?.nome || 'N/A'}</p>
                      <p className="text-sm opacity-75 mt-1">{topByResolutionTime?.media || 0}h resolução</p>
                    </div>
                    <Clock className="h-12 w-12 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-none bg-gradient-card border-l-4 border-l-destructive">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Mais Urgentes</p>
                      <p className="text-2xl font-bold text-foreground">{topByUrgency?.nome || 'N/A'}</p>
                      <p className="text-sm text-destructive mt-1">{topByUrgency?.prioridade_alta || 0} alta prioridade</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Solicitantes */}
          <div className="space-y-4">
            {filteredData.length === 0 ? (
              <div className="py-12 text-center">
                <FileX className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Nenhum solicitante encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {tickets.length === 0 
                    ? "Importe um arquivo na página inicial para começar" 
                    : "Tente ajustar os filtros para ver mais resultados"}
                </p>
              </div>
            ) : (
              filteredData.map((solicitante, index) => (
                <Card 
                  key={solicitante.email}
                  className="shadow-lg border-none bg-gradient-card hover:shadow-xl transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-gradient-primary">
                            <Users className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{solicitante.nome}</h3>
                            <p className="text-sm text-muted-foreground">{solicitante.email}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {solicitante.empresa}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{solicitante.total}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-accent">{solicitante.abertos}</p>
                          <p className="text-xs text-muted-foreground">Abertos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{solicitante.media}h</p>
                          <p className="text-xs text-muted-foreground">Tempo Médio</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-destructive">{solicitante.prioridade_alta}</p>
                          <p className="text-xs text-muted-foreground">Alta Prior.</p>
                        </div>
                        <div className="text-center">
                          <Badge className="mt-1">{solicitante.tipo_mais_comum}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Gráfico Comparativo */}
          {chartData.length > 0 && (
            <Card className="shadow-lg border-none bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Comparativo: Tickets Abertos vs Fechados (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="nome" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="Abertos" stackId="a" fill="hsl(var(--accent))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Fechados" stackId="a" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Solicitantes;
