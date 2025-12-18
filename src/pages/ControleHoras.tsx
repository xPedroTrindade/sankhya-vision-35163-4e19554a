"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export default function ControleHoras() {
  // Estados
  const [showHistorico, setShowHistorico] = useState(false);

  // Dados simulados
  const horasContratadas = 100;
  const horasConsumidas = 67;
  const horasRestantes = horasContratadas - horasConsumidas;
  const percentualConsumido = (horasConsumidas / horasContratadas) * 100;

  const chartData = [
    { name: "Consumidas", value: horasConsumidas, color: "hsl(var(--chart-1))" },
    { name: "Restantes", value: horasRestantes, color: "hsl(var(--chart-3))" },
  ];

  const historicoMensal = [
    {
      month: "Outubro",
      year: 2025,
      horasContratadas: 100,
      horasConcluidas: 67,
      horasRestantes: 33,
      percentualUtilizado: 67,
    },
    {
      month: "Setembro",
      year: 2025,
      horasContratadas: 90,
      horasConcluidas: 80,
      horasRestantes: 10,
      percentualUtilizado: 89,
    },
    {
      month: "Agosto",
      year: 2025,
      horasContratadas: 80,
      horasConcluidas: 77,
      horasRestantes: 3,
      percentualUtilizado: 96,
    },
  ];

  const handleMonthClick = (month: string, year: number) => {
    alert(`Exibindo detalhes de ${month}/${year}`);
  };

 const getBadgeVariant = (
  percentual: number
): "default" | "warning" | "destructive" | "success" => {
  if (percentual >= 90) return "success";
  if (percentual >= 75) return "warning";
  return "destructive";
};


  const cards = [
    {
      title: "Horas Contratadas",
      value: `${horasContratadas}h`,
      icon: Clock,
      iconBg: "bg-gradient-secondary",
    },
    {
      title: "Horas Consumidas",
      value: `${horasConsumidas}h`,
      icon: TrendingUp,
      iconBg: "bg-gradient-accent",
      subtitle: `${percentualConsumido.toFixed(1)}% do contrato`,
    },
    {
      title: "Horas Restantes",
      value: `${horasRestantes}h`,
      icon: TrendingDown,
      iconBg: "bg-gradient-success",
      subtitle: `${(100 - percentualConsumido).toFixed(1)}% disponível`,
    },
    {
      title: "Status do Contrato",
      value: percentualConsumido < 80 ? "Saudável" : "Atenção",
      icon: Activity,
      iconBg: percentualConsumido < 80 ? "bg-success" : "bg-warning",
      subtitle: "Monitoramento ativo",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Controle de Horas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o consumo de horas do seu contrato de SLA em tempo real
          </p>
        </div>

        {/* Cards de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <Card
              key={card.title}
              className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground animate-pulse">
                      {card.value}
                    </p>
                    {card.subtitle && (
                      <p className="text-xs text-muted-foreground">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${card.iconBg}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico de Donut e Detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-lg bg-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">
                Distribuição de Horas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">Análise Detalhada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progresso de Consumo
                  </span>
                  <span className="font-semibold text-foreground">
                    {percentualConsumido.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-accent h-full rounded-full transition-all duration-1000 ease-out shadow-glow"
                    style={{ width: `${percentualConsumido}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Média Mensal
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {(horasConsumidas / 3).toFixed(1)}h
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Projeção
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {((horasConsumidas / 3) * 4).toFixed(0)}h
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-success rounded-lg text-white shadow-success">
                <p className="text-sm font-medium mb-2">💡 Recomendação</p>
                <p className="text-xs opacity-95">
                  {percentualConsumido < 70
                    ? "Seu consumo está dentro do esperado. Continue monitorando."
                    : percentualConsumido < 90
                    ? "Atenção: você já consumiu mais de 70% do contrato. Planeje suas demandas."
                    : "Crítico: menos de 10% de horas disponíveis. Considere renovação."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Contratos */}
        <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
          <Card className="border-none shadow-lg">
            <CardHeader
              className="cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setShowHistorico(!showHistorico)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    Ver Histórico de Contratos
                  </CardTitle>
                </div>
                {showHistorico ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>

            {showHistorico && (
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Período</TableHead>
                        <TableHead className="text-center">Contratadas</TableHead>
                        <TableHead className="text-center">Concluídas</TableHead>
                        <TableHead className="text-center">Restantes</TableHead>
                        <TableHead className="text-center">Utilização</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicoMensal.map((item) => (
                        <TableRow
                          key={`${item.month}-${item.year}`}
                          onClick={() => handleMonthClick(item.month, item.year)}
                          className="hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <TableCell className="font-medium">
                            {item.month} {item.year}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.horasContratadas}h
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {item.horasConcluidas}h
                          </TableCell>
                          <TableCell className="text-center">
                            {item.horasRestantes}h
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div
                                  className={`h-full rounded-full ${
                                    item.percentualUtilizado >= 90
                                      ? "bg-success"
                                      : item.percentualUtilizado >= 75
                                      ? "bg-warning"
                                      : "bg-destructive"
                                  }`}
                                  style={{ width: `${item.percentualUtilizado}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {item.percentualUtilizado.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={getBadgeVariant(item.percentualUtilizado)}>
                              {item.percentualUtilizado >= 90
                                ? "Saudável"
                                : item.percentualUtilizado >= 75
                                ? "Atenção"
                                : "Crítico"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
