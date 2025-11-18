import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FileUpload } from "@/components/FileUpload";
import { Dashboard } from "@/components/Dashboard";
import { Navbar } from "@/components/Navbar";
import { FilterSection, FilterOptions } from "@/components/FilterSection";
import { parseFile, validateTickets } from "@/utils/fileParser";
import { useTickets } from "@/contexts/TicketContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const location = useLocation();
  const { tickets, setTickets } = useTickets();
  const { user } = useAuth();
  const { selectedCompany } = useCompany();
  const isAdmin = user?.role === "admin";
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  
  // Pegar filtro de mês/ano do state (vindo do ControleHoras)
  const filterMonth = location.state?.filterMonth as string | undefined;
  const filterYear = location.state?.filterYear as number | undefined;

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedTickets = await parseFile(file);
      const validation = validateTickets(parsedTickets);
      
      if (!validation.valid) {
        toast.error("Erro na validação do arquivo", {
          description: validation.errors.join(", ")
        });
        setIsLoading(false);
        return;
      }

      setTickets(parsedTickets);
      toast.success("Arquivo processado com sucesso!", {
        description: `${parsedTickets.length} tickets carregados e prontos para análise`
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Erro ao processar arquivo", {
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTickets([]);
    setFilters({});
    toast.info("Dashboard limpo", {
      description: "Importe um novo arquivo para começar"
    });
  };

  // Extract unique processes and requesters for filter dropdowns
  const processes = useMemo(() => {
    const uniqueProcesses = Array.from(new Set(tickets.map(t => t.processo).filter(Boolean)));
    return uniqueProcesses.sort();
  }, [tickets]);

  const requesters = useMemo(() => {
    const uniqueRequesters = Array.from(new Set(tickets.map(t => t.nomeSolicitante).filter(Boolean)));
    return uniqueRequesters.sort();
  }, [tickets]);

  // Função auxiliar para converter nome do mês em número
  const getMonthNumber = (monthName: string): number => {
    const months: Record<string, number> = {
      'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3,
      'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7,
      'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
    };
    return months[monthName] ?? -1;
  };

  // Filtrar tickets por mês/ano se fornecido
  const filteredTicketsByMonth = useMemo(() => {
    // Primeiro, filtra por empresa se for admin
    let baseTickets = tickets;
    if (isAdmin && selectedCompany) {
      baseTickets = tickets.filter(t => t.empresa === selectedCompany);
    }

    if (!filterMonth || !filterYear) return baseTickets;
    
    const targetMonth = getMonthNumber(filterMonth);
    if (targetMonth === -1) return baseTickets;

    return baseTickets.filter(ticket => {
      try {
        // Tentar parsear diferentes formatos de data
        const dateStr = ticket.horaCriacao;
        let date: Date | null = null;

        // Formato DD/MM/YYYY ou DD/MM/YYYY HH:mm
        if (dateStr.includes('/')) {
          const parts = dateStr.split(/[/ :]/);
          if (parts.length >= 3) {
            date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
        } else {
          // Formato ISO ou outros
          date = new Date(dateStr);
        }

        if (!date || isNaN(date.getTime())) return false;
        
        return date.getMonth() === targetMonth && date.getFullYear() === filterYear;
      } catch {
        return false;
      }
    });
  }, [tickets, filterMonth, filterYear, isAdmin, selectedCompany]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {tickets.length > 0 && (
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-end">
              <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Novo Arquivo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isAdmin && !selectedCompany && tickets.length > 0 && (
          <Alert className="mb-6">
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              Selecione uma empresa no Painel Master para visualizar os dados
            </AlertDescription>
          </Alert>
        )}
        
        {tickets.length === 0 ? (
          <div className="max-w-3xl mx-auto mt-12">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            <div className="mt-8 p-6 rounded-lg bg-muted/30 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Como usar:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Exporte seus tickets de suporte em formato Excel (.xlsx) ou CSV (.csv)</li>
                <li>2. Certifique-se de que o arquivo contém as colunas necessárias</li>
                <li>3. Faça upload do arquivo usando o botão acima</li>
                <li>4. Visualize insights automáticos e gráficos interativos</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            {filterMonth && filterYear && (
              <Alert className="mb-6 border-primary/20 bg-primary/5">
                <Calendar className="h-4 w-4 text-primary" />
                <AlertDescription className="text-foreground">
                  Visualizando tickets de <strong>{filterMonth} {filterYear}</strong> ({filteredTicketsByMonth.length} tickets encontrados)
                </AlertDescription>
              </Alert>
            )}
            <FilterSection 
              filters={filters} 
              onFilterChange={setFilters}
              processes={processes}
              requesters={requesters}
            />
            <Dashboard tickets={filteredTicketsByMonth} filters={filters} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            BPsankhya Analytics • Transformando dados em decisões inteligentes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
