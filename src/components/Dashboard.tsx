import { Ticket } from "@/types/ticket";
import { KPICard } from "./KPICard";
import { InsightCard } from "./InsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterOptions } from "./FilterSection";
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from "recharts";
import { 
  TicketCheck, Clock, AlertTriangle, CheckCircle2,
  TrendingUp, Users, Package
} from "lucide-react";
import {
  processTicketData,
  getStatusChartData,
  getPriorityChartData,
  getProcessChartData,
  getTypeChartData,
  getTopRequesters,
  getTimelineData,
  generateInsights,
  getCompanyData
} from "@/utils/dataProcessor";

interface DashboardProps {
  tickets: Ticket[];
  selectedCompany?: string;
  filters?: FilterOptions;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))', // Azul escuro
  'hsl(var(--chart-2))', // Azul claro
  'hsl(var(--chart-3))', // Verde
  'hsl(var(--chart-4))', // Verde claro
  'hsl(var(--chart-5))', // Amarelo
  'hsl(var(--chart-6))', // Azul vibrante
  'hsl(var(--chart-7))', // Azul médio
  'hsl(var(--chart-8))', // Verde claro
];

export const Dashboard = ({ tickets, selectedCompany, filters = {} }: DashboardProps) => {
  let filteredTickets = selectedCompany
    ? tickets.filter(t => t.emailSolicitante.includes(selectedCompany))
    : tickets;

  // Apply additional filters
  if (filters.status) {
    filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
  }
  if (filters.priority) {
    filteredTickets = filteredTickets.filter(ticket => ticket.prioridade === filters.priority);
  }
  if (filters.process) {
    filteredTickets = filteredTickets.filter(ticket => ticket.processo === filters.process);
  }
  if (filters.requester) {
    filteredTickets = filteredTickets.filter(ticket => ticket.nomeSolicitante === filters.requester);
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredTickets = filteredTickets.filter(ticket => 
      ticket.assunto?.toLowerCase().includes(searchLower) ||
      ticket.descricao?.toLowerCase().includes(searchLower)
    );
  }

  const stats = processTicketData(filteredTickets);
  const insights = generateInsights(filteredTickets, stats);
  const companies = getCompanyData(tickets);

  const statusData = getStatusChartData(filteredTickets);
  const priorityData = getPriorityChartData(filteredTickets);
  const processData = getProcessChartData(filteredTickets);
  const typeData = getTypeChartData(filteredTickets);
  const requesterData = getTopRequesters(filteredTickets);
  const timelineData = getTimelineData(filteredTickets);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Dashboard de Suporte Técnico
        </h1>
        <p className="text-muted-foreground">
          Análise inteligente e insights automáticos • {filteredTickets.length} tickets
          {selectedCompany && ` • ${selectedCompany.toUpperCase()}`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Tickets"
          value={stats.totalTickets}
          icon={TicketCheck}
        />
        <KPICard
          title="Tickets Abertos"
          value={stats.ticketsAbertos}
          icon={AlertTriangle}
          trend={`${Math.round((stats.ticketsAbertos / stats.totalTickets) * 100)}%`}
        />
        <KPICard
          title="Prioridade Alta"
          value={stats.prioridadeAlta}
          icon={TrendingUp}
        />
        <KPICard
          title="Tempo Médio (horas)"
          value={stats.tempoMedioResolucao}
          icon={Clock}
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Insights Automáticos</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <Card className="shadow-lg border-none bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Chart */}
        <Card className="shadow-lg border-none bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
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
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Process Chart */}
        <Card className="shadow-lg border-none bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Tickets por Processo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processData} layout="vertical">
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
                <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Requesters */}
        <Card className="shadow-lg border-none bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Solicitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requesterData.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-6))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="shadow-lg border-none bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução de Tickets (Últimos 30 Dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
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
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={3}
                name="Tickets Criados"
                dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Companies Table */}
      {!selectedCompany && companies.length > 1 && (
        <Card className="shadow-lg border-none bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Tickets por Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {companies.map((company, index) => (
                <div 
                  key={company.domain}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div>
                    <p className="font-semibold text-foreground">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{company.domain}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{company.ticketCount}</p>
                    <p className="text-xs text-muted-foreground">tickets</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
