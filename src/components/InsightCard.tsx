import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InsightCardProps {
  insight: string;
  index: number;
}

export const InsightCard = ({ insight, index }: InsightCardProps) => {
  return (
    <Card 
      className="border-l-4 border-l-primary shadow-md bg-gradient-card animate-fade-in hover:shadow-lg transition-shadow"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-foreground leading-relaxed">{insight}</p>
        </div>
      </CardContent>
    </Card>
  );
};
