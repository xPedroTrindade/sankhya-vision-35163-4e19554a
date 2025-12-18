import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCompany } from "@/contexts/CompanyContext";
import { useTickets } from "@/contexts/TicketContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, SmilePlus } from "lucide-react";
import { useMemo } from "react";

const PesquisaSatisfacao = () => {
  const { selectedCompany } = useCompany();
  const { tickets } = useTickets();

  const satisfactionStats = useMemo(() => {
    const filteredTickets = selectedCompany
      ? tickets.filter((t) => t.empresa === selectedCompany && t.avaliacao)
      : tickets.filter((t) => t.avaliacao);

    const total = filteredTickets.length;
    if (total === 0) {
      return { satisfied: 0, neutral: 0, unsatisfied: 0, total: 0 };
    }

    const satisfied = filteredTickets.filter((t) => t.avaliacao === "satisfeito").length;
    const neutral = filteredTickets.filter((t) => t.avaliacao === "neutro").length;
    const unsatisfied = filteredTickets.filter((t) => t.avaliacao === "insatisfeito").length;

    return {
      satisfied: Math.round((satisfied / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      unsatisfied: Math.round((unsatisfied / total) * 100),
      total,
    };
  }, [tickets, selectedCompany]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Pesquisa de Satisfação</h1>
            <p className="text-muted-foreground">
              Resumo completo da satisfação dos clientes com os atendimentos
            </p>
          </div>

          {!selectedCompany && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Selecione uma empresa no Painel Admin Master para visualizar os dados de satisfação
              </AlertDescription>
            </Alert>
          )}

          {selectedCompany && (
            <>
              <Card className="bg-gradient-card border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SmilePlus className="h-5 w-5 text-primary" />
                    Resumo Geral - {selectedCompany}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Satisfeitos */}
                    <Card className="border-none shadow-md bg-card/50">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-5xl">😊</span>
                          <span className="text-3xl font-bold text-primary">
                            {satisfactionStats.satisfied}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Satisfeitos</span>
                            <span className="text-muted-foreground">
                              {Math.round((satisfactionStats.satisfied / 100) * satisfactionStats.total)} tickets
                            </span>
                          </div>
                          <Progress value={satisfactionStats.satisfied} className="h-3" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Neutros */}
                    <Card className="border-none shadow-md bg-card/50">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-5xl">😐</span>
                          <span className="text-3xl font-bold text-primary">
                            {satisfactionStats.neutral}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Neutros</span>
                            <span className="text-muted-foreground">
                              {Math.round((satisfactionStats.neutral / 100) * satisfactionStats.total)} tickets
                            </span>
                          </div>
                          <Progress value={satisfactionStats.neutral} className="h-3" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Insatisfeitos */}
                    <Card className="border-none shadow-md bg-card/50">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-5xl">😞</span>
                          <span className="text-3xl font-bold text-primary">
                            {satisfactionStats.unsatisfied}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Insatisfeitos</span>
                            <span className="text-muted-foreground">
                              {Math.round((satisfactionStats.unsatisfied / 100) * satisfactionStats.total)} tickets
                            </span>
                          </div>
                          <Progress value={satisfactionStats.unsatisfied} className="h-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-none shadow-md bg-card/50">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                        <p className="text-4xl font-bold text-primary">{satisfactionStats.total}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PesquisaSatisfacao;
