import { Navbar } from "@/components/Navbar";
import { useCompany } from "@/contexts/CompanyContext";
import { Building2, Settings, Users, BarChart3, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminMaster = () => {
  const { selectedCompany } = useCompany();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">
              Central de configurações e gestão do sistema
            </p>
          </div>

          {!selectedCompany && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Selecione uma empresa no cabeçalho para visualizar os dados específicos
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="bg-gradient-card border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Configurações</CardTitle>
                    <CardDescription>Gerencie as configurações do sistema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure preferências, integrações e parâmetros globais da aplicação.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Gestão de Empresas</CardTitle>
                    <CardDescription>Administre as empresas do sistema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Atualmente gerenciando dados para múltiplas empresas clientes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Análises Consolidadas</CardTitle>
                    <CardDescription>Visão geral de todas as empresas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use o menu lateral para navegar entre as diferentes seções analíticas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Controle de acesso e permissões</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gerencie usuários, roles e permissões de acesso ao sistema.
                </p>
              </CardContent>
            </Card>
          </div>

          {selectedCompany && (
            <Alert className="border-primary/20 bg-primary/5">
              <Building2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                Empresa ativa: <strong>{selectedCompany}</strong>
                <br />
                <span className="text-sm text-muted-foreground">
                  Use o menu lateral (ícone ☰) para navegar entre as seções
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMaster;
