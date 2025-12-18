import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export const KPICard = ({ title, value, icon: Icon, trend, trendUp }: KPICardProps) => {
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-card animate-fade-in hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={`text-xs font-medium ${trendUp ? 'text-accent' : 'text-destructive'}`}>
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-gradient-primary">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
