import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search, Download, FileX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTickets } from "@/contexts/TicketContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { format, parseISO, differenceInHours } from "date-fns";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

const Filtros = () => {
  const { tickets } = useTickets();
  const { user } = useAuth();
  const { selectedCompany } = useCompany();
  const isAdmin = user?.role === "admin";
  
  const [filters, setFilters] = useState({
    status: "todos",
    prioridade: "todos",
    processo: "todos",
    avaliacao: "todos",
    busca: ""
  });

  // Get unique processes from real data
  const uniqueProcesses = useMemo(() => {
    return Array.from(new Set(tickets.map(t => t.processo).filter(Boolean))).sort();
  }, [tickets]);

  // Filter tickets based on company and filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Filter by company for admin
      if (isAdmin && selectedCompany && ticket.empresa !== selectedCompany) {
        return false;
      }

      // Status filter
      if (filters.status !== "todos" && ticket.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
      
      // Priority filter
      if (filters.prioridade !== "todos" && ticket.prioridade.toLowerCase() !== filters.prioridade.toLowerCase()) {
        return false;
      }
      
      // Process filter
      if (filters.processo !== "todos" && ticket.processo.toLowerCase() !== filters.processo.toLowerCase()) {
        return false;
      }

      // Evaluation filter
      if (filters.avaliacao !== "todos" && ticket.avaliacao !== filters.avaliacao) {
        return false;
      }
      
      // Search filter
      if (filters.busca) {
        const searchLower = filters.busca.toLowerCase();
        const matchesSearch = 
          ticket.id.toLowerCase().includes(searchLower) ||
          ticket.assunto.toLowerCase().includes(searchLower) ||
          ticket.nomeSolicitante.toLowerCase().includes(searchLower) ||
          ticket.emailSolicitante.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [tickets, filters, isAdmin, selectedCompany]);

  // Calculate resolution time
  const getResolutionTime = (ticket: any) => {
    try {
      const created = parseISO(ticket.horaCriacao);
      const updated = parseISO(ticket.horaUltimaAtualizacao);
      const hours = differenceInHours(updated, created);
      return hours > 0 ? `${hours}h` : '<1h';
    } catch {
      return '-';
    }
  };

  // Get evaluation emoji
  const getEvaluationEmoji = (avaliacao: string) => {
    switch (avaliacao) {
      case "satisfeito":
        return "😊";
      case "neutro":
        return "😐";
      case "insatisfeito":
        return "😞";
      default:
        return "-";
    }
  };

  // Export to Excel
  const handleExport = () => {
    if (filteredTickets.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const exportData = filteredTickets.map(ticket => ({
      'ID': ticket.id,
      'Assunto': ticket.assunto,
      'Status': ticket.status,
      'Prioridade': ticket.prioridade,
      'Processo': ticket.processo,
      'Solicitante': ticket.nomeSolicitante,
      'Email': ticket.emailSolicitante,
      'Data Criação': format(parseISO(ticket.horaCriacao), 'dd/MM/yyyy HH:mm'),
      'Avaliação': ticket.avaliacao || 'Não avaliado',
      ...(isAdmin ? { 'Tempo Resolução': getResolutionTime(ticket) } : {})
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tickets Filtrados");
    XLSX.writeFile(wb, `tickets_filtrados_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`);
    
    toast.success("Arquivo exportado com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberto': return 'bg-accent text-accent-foreground';
      case 'fechado': return 'bg-primary text-primary-foreground';
      case 'pendente': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case 'alta': return 'bg-destructive text-destructive-foreground';
      case 'média': return 'bg-warning text-warning-foreground';
      case 'baixa': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Filtros Avançados
            </h1>
            <p className="text-muted-foreground">
              Busca detalhada e exportação de dados customizados
            </p>
          </div>

          {/* Filtros */}
          <Card className="shadow-lg border-none bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Configurar Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Prioridade</label>
                  <Select value={filters.prioridade} onValueChange={(v) => setFilters({...filters, prioridade: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Processo</label>
                  <Select value={filters.processo} onValueChange={(v) => setFilters({...filters, processo: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o processo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {uniqueProcesses.map(processo => (
                        <SelectItem key={processo} value={processo.toLowerCase()}>{processo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Avaliação</label>
                  <Select value={filters.avaliacao} onValueChange={(v) => setFilters({...filters, avaliacao: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="satisfeito">😊 Satisfeito</SelectItem>
                      <SelectItem value="neutro">😐 Neutro</SelectItem>
                      <SelectItem value="insatisfeito">😞 Insatisfeito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Busca Livre</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID, assunto, solicitante..."
                      value={filters.busca}
                      onChange={(e) => setFilters({...filters, busca: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button className="gap-2">
                  <Filter className="h-4 w-4" />
                  Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={() => setFilters({
                  status: "todos",
                  prioridade: "todos",
                  processo: "todos",
                  avaliacao: "todos",
                  busca: ""
                })}>
                  Limpar
                </Button>
                <Button variant="secondary" className="gap-2 ml-auto" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Exportar Resultados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card className="shadow-lg border-none bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultados da Busca</span>
                <Badge variant="secondary">{filteredTickets.length} tickets encontrados</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTickets.length === 0 ? (
                <div className="py-12 text-center">
                  <FileX className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">Nenhum ticket encontrado</p>
                  <p className="text-sm text-muted-foreground">
                    {tickets.length === 0 
                      ? "Importe um arquivo na página inicial para começar" 
                      : "Tente ajustar os filtros para ver mais resultados"}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">Assunto</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Prioridade</TableHead>
                        <TableHead className="font-semibold">Processo</TableHead>
                        <TableHead className="font-semibold">Solicitante</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Avaliação</TableHead>
                        {isAdmin && <TableHead className="font-semibold">Tempo</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket, index) => (
                        <TableRow 
                          key={ticket.id}
                          className="hover:bg-muted/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                          <TableCell className="font-medium max-w-xs truncate">{ticket.assunto}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(ticket.prioridade)}>
                              {ticket.prioridade}
                            </Badge>
                          </TableCell>
                          <TableCell>{ticket.processo}</TableCell>
                          <TableCell>{ticket.nomeSolicitante}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{ticket.emailSolicitante}</TableCell>
                          <TableCell className="text-sm">
                            {format(parseISO(ticket.horaCriacao), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="text-2xl text-center">
                            {getEvaluationEmoji(ticket.avaliacao)}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="font-semibold text-foreground">{getResolutionTime(ticket)}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Filtros;
