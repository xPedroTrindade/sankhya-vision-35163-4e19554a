import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Settings, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Lightbulb,
  FileText
} from "lucide-react";

export default function FAQ() {
  const faqItems = [
    {
      id: "1",
      icon: HelpCircle,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      category: "Abertura de Tickets",
      question: "Como abrir um ticket corretamente?",
      answer: `Para abrir um ticket de forma assertiva, siga estas etapas:

1. **Acesse o Freshdesk** através do link oficial da Sankhya
2. **Escolha a categoria correta** do problema (Suporte, Financeiro, Implementação)
3. **Preencha o título** de forma clara e objetiva (ex: "Erro ao gerar relatório financeiro")
4. **Descreva o problema** com detalhes:
   - O que você estava fazendo?
   - Qual erro apareceu?
   - Anexe prints de tela
   - Informe o módulo/tela afetada
5. **Selecione a prioridade** adequada (veja o FAQ específico sobre prioridades)
6. **Revise antes de enviar** para garantir que todas as informações estão corretas

✅ **Dica:** Tickets bem descritos são resolvidos até 40% mais rápido!`,
    },
    {
      id: "2",
      icon: Settings,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
      category: "Status de Tickets",
      question: "Como definir o status do ticket?",
      answer: `O status do ticket é geralmente definido automaticamente, mas você pode acompanhar:

**Status Disponíveis:**
- 🔵 **Novo:** Ticket recém-criado, aguardando análise
- 🟡 **Em Atendimento:** Técnico está trabalhando na solução
- 🟢 **Aguardando Cliente:** Precisamos de mais informações suas
- 🔴 **Em Espera:** Dependência externa (fornecedor, homologação)
- ✅ **Resolvido:** Problema solucionado
- ⚫ **Fechado:** Ticket finalizado após confirmação

**Como interagir:**
- Responda rapidamente quando o status for "Aguardando Cliente"
- Se o problema persistir após "Resolvido", reabra o ticket
- Não feche tickets sem testar a solução implementada

📌 **Importante:** Tickets em "Aguardando Cliente" por mais de 3 dias são fechados automaticamente.`,
    },
    {
      id: "3",
      icon: AlertCircle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
      category: "Prioridades",
      question: "Como atribuir a prioridade adequada?",
      answer: `A prioridade define o tempo de resposta. Use com responsabilidade:

**Níveis de Prioridade:**

🔴 **Crítica (Urgente):**
- Sistema completamente fora do ar
- Perda de dados em andamento
- Impossibilidade total de trabalhar
- **SLA:** Resposta em até 1 hora

🟠 **Alta:**
- Funcionalidade principal indisponível
- Afeta múltiplos usuários
- Impacto significativo na operação
- **SLA:** Resposta em até 4 horas

🟡 **Média (Normal):**
- Problema pontual que tem workaround
- Afeta poucos usuários
- Não impede o trabalho principal
- **SLA:** Resposta em até 8 horas

🟢 **Baixa:**
- Dúvidas, melhorias, sugestões
- Problemas estéticos menores
- Sem impacto operacional
- **SLA:** Resposta em até 24 horas

⚠️ **ATENÇÃO:** Uso indevido de prioridade "Crítica" pode atrasar o atendimento de emergências reais!`,
    },
    {
      id: "4",
      icon: TrendingUp,
      iconColor: "text-success",
      bgColor: "bg-success/10",
      category: "Acompanhamento",
      question: "Como acompanhar o andamento do ticket?",
      answer: `Você tem várias formas de acompanhar seus tickets:

**1. Por E-mail:**
- Receba notificações automáticas a cada atualização
- Configure para receber resumo diário
- Responda o e-mail para adicionar informações ao ticket

**2. No Portal Freshdesk:**
- Acesse "Meus Tickets" para ver todos em andamento
- Use filtros por status, prioridade ou data
- Visualize histórico completo de interações

**3. Dashboard Sankhya (esta ferramenta!):**
- Veja estatísticas em tempo real
- Acompanhe métricas de atendimento
- Identifique tickets mais antigos

**4. Notificações Push (App Mobile):**
- Instale o app Freshdesk
- Receba alertas em tempo real
- Responda diretamente pelo celular

💡 **Dica Pro:** Configure notificações apenas para seus tickets prioritários para evitar sobrecarga de informações.`,
    },
    {
      id: "5",
      icon: CheckCircle,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      category: "Boas Práticas",
      question: "Boas práticas para evitar erros e aumentar a assertividade",
      answer: `Siga estas práticas para otimizar seu atendimento:

**✅ Antes de Abrir um Ticket:**
- Consulte a base de conhecimento (pode já ter a solução!)
- Tente reproduzir o erro para confirmar
- Reúna evidências (prints, vídeos, logs)
- Verifique se não há ticket duplicado aberto

**✅ Ao Descrever o Problema:**
- Use linguagem clara e objetiva
- Evite jargões técnicos desnecessários
- Informe ambiente (navegador, sistema operacional)
- Mencione se o problema é recorrente ou novo

**✅ Durante o Atendimento:**
- Responda as solicitações do técnico rapidamente
- Teste as soluções propostas antes de fechar
- Informe se o problema persiste
- Seja educado e colaborativo

**✅ Após a Resolução:**
- Confirme que o problema foi resolvido
- Avalie o atendimento (ajuda a melhorar!)
- Documente a solução para consultas futuras

**❌ Evite:**
- Abrir múltiplos tickets para o mesmo problema
- Usar prioridade inadequada
- Deixar tickets sem resposta
- Fornecer informações incompletas

🎯 **Meta:** Tickets bem gerenciados = Resolução mais rápida + Melhor uso das horas contratadas!`,
    },
    {
      id: "6",
      icon: Clock,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
      category: "Controle de Horas",
      question: "Como visualizar as horas do contrato?",
      answer: `O controle de horas está disponível na nova aba "Controle de Horas":

**O que você encontra:**
- 📊 Horas contratadas totais
- 📈 Horas já consumidas
- 📉 Horas restantes no período
- 💡 Projeções e alertas inteligentes

**Como o consumo é calculado:**
- Cada atendimento técnico consome horas
- O tempo é registrado automaticamente pelo técnico
- Inclui análise, implementação e testes
- Não inclui tempo de "Aguardando Cliente"

**Visualizações disponíveis:**
- Gráfico de pizza (distribuição visual)
- Cards com métricas detalhadas
- Histórico de consumo mensal
- Projeção de uso futuro

**Alertas inteligentes:**
- 🟢 Verde: Consumo saudável (< 70%)
- 🟡 Amarelo: Atenção necessária (70-90%)
- 🔴 Vermelho: Crítico (> 90%)

🔮 **Em breve:** Integração automática com Freshdesk para contabilização em tempo real de cada ticket atendido!

➡️ **Acesse agora:** Clique na aba "Controle de Horas" no menu superior.`,
    },
    {
      id: "7",
      icon: Lightbulb,
      iconColor: "text-success",
      bgColor: "bg-success/10",
      category: "Dicas Avançadas",
      question: "Dicas para maximizar o valor do seu contrato",
      answer: `Aproveite ao máximo seu SLA com estas estratégias:

**💰 Economize Horas:**
- Agrupe problemas relacionados em um único ticket
- Teste soluções simples antes de abrir ticket
- Use a base de conhecimento para problemas comuns
- Participe dos treinamentos oferecidos

**⚡ Acelere Resoluções:**
- Forneça informações completas na primeira descrição
- Responda dúvidas do técnico imediatamente
- Tenha um ambiente de testes disponível
- Permita acesso remoto quando necessário

**📊 Monitore seu Consumo:**
- Acesse o dashboard semanalmente
- Configure alertas de consumo de horas
- Analise quais tipos de tickets consomem mais tempo
- Planeje renovações com antecedência

**🎓 Desenvolva Autonomia:**
- Participe de webinars e workshops
- Documente soluções recorrentes
- Treine sua equipe internamente
- Crie um FAQ interno da empresa

**🤝 Relacionamento com Suporte:**
- Mantenha contato regular com seu consultor
- Compartilhe feedbacks construtivos
- Sugira melhorias no processo
- Reconheça bons atendimentos

🏆 **Resultado:** Empresas que seguem essas práticas reduzem em até 30% o consumo de horas!`,
    },
    {
      id: "8",
      icon: FileText,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
      category: "Documentação",
      question: "Como documentar problemas de forma eficiente?",
      answer: `Uma boa documentação acelera drasticamente a resolução:

**📸 Capturas de Tela:**
- Capture a tela inteira, não apenas a mensagem de erro
- Inclua a URL/caminho da tela
- Mostre os dados que causaram o problema
- Use ferramentas de anotação para destacar o erro

**🎥 Gravações de Tela:**
- Para problemas intermitentes, grave o comportamento
- Mostre o passo-a-passo que leva ao erro
- Máximo de 2-3 minutos de vídeo
- Use ferramentas gratuitas como Loom ou OBS

**📋 Logs do Sistema:**
- Copie mensagens de erro completas
- Inclua horário exato do erro
- Forneça ID de transação quando disponível
- Não edite ou resuma logs técnicos

**📝 Template de Descrição Ideal:**

\`\`\`
🎯 PROBLEMA:
[Descreva em uma frase o que não funciona]

📍 ONDE:
Módulo: [Ex: Financeiro]
Tela: [Ex: Contas a Pagar]
Caminho: [Ex: Menu > Financeiro > Contas a Pagar]

🔄 COMO REPRODUZIR:
1. [Primeiro passo]
2. [Segundo passo]
3. [Quando ocorre o erro]

❌ RESULTADO ATUAL:
[O que acontece de errado]

✅ RESULTADO ESPERADO:
[O que deveria acontecer]

🔍 INFORMAÇÕES ADICIONAIS:
- Navegador: [Chrome/Firefox/Edge + versão]
- Sistema: [Windows/Mac/Linux]
- Frequência: [Sempre/Às vezes/Primeira vez]
- Usuários afetados: [Só eu/Vários/Todos]

📎 ANEXOS:
[Lista de prints/vídeos anexados]
\`\`\`

✨ **Use este template e veja seus tickets serem resolvidos muito mais rápido!**`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Central de Ajuda - FAQ
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais frequentes sobre o uso do sistema Freshdesk
            e aprenda as melhores práticas para um atendimento eficiente.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Artigos", value: "8+", icon: FileText, color: "bg-primary" },
            { label: "Categorias", value: "6", icon: Settings, color: "bg-accent" },
            { label: "Atualizações", value: "Semanal", icon: TrendingUp, color: "bg-success" },
            { label: "Satisfação", value: "98%", icon: CheckCircle, color: "bg-success" },
          ].map((stat, index) => (
            <Card 
              key={stat.label}
              className="border-none shadow-md hover:shadow-lg transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Accordion */}
        <Card className="border-none shadow-lg bg-card animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={item.id} 
                  value={item.id}
                  className="border rounded-lg px-4 hover:border-primary transition-all animate-fade-in bg-muted/30"
                  style={{ animationDelay: `${500 + index * 50}ms` }}
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className={`p-2 rounded-lg ${item.bgColor} flex-shrink-0`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                        <p className="font-semibold text-foreground">{item.question}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-4 text-muted-foreground whitespace-pre-line">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <Card className="border-none shadow-lg bg-gradient-primary text-white mt-8 animate-fade-in" style={{ animationDelay: "900ms" }}>
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Não encontrou o que procura?</h3>
            <p className="mb-6 opacity-90">
              Nossa equipe está pronta para ajudar com qualquer dúvida adicional.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:scale-105 transition-transform">
                Abrir Ticket de Suporte
              </button>
              <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all">
                Contatar Consultor
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
