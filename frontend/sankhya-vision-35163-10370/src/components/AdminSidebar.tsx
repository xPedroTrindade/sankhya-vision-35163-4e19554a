import { NavLink } from "react-router-dom";
import { Home, Package, Users, TrendingUp, Clock, HelpCircle, Filter, SmilePlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const adminNavItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: Home },
  { path: "/admin/processos", label: "Processos", icon: Package },
  { path: "/admin/solicitantes", label: "Solicitantes", icon: Users },
  { path: "/admin/analise-avancada", label: "Análise Avançada", icon: TrendingUp },
  { path: "/admin/controle-horas", label: "Controle de Horas", icon: Clock },
  { path: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { path: "/admin/filtros", label: "Filtros", icon: Filter },
  { path: "/admin/pesquisa-satisfacao", label: "Pesquisa Satisfação", icon: SmilePlus },
];

export const AdminSidebar = ({ open, onOpenChange }: AdminSidebarProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>Menu Admin</SheetTitle>
          <SheetDescription>
            Navegue pelas seções administrativas
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <nav className="flex flex-col gap-2">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
