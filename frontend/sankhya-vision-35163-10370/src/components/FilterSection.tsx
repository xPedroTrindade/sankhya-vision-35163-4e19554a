import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface FilterOptions {
  status?: string;
  priority?: string;
  process?: string;
  requester?: string;
  search?: string;
}

interface FilterSectionProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  processes: string[];
  requesters: string[];
}

export const FilterSection = ({ filters, onFilterChange, processes, requesters }: FilterSectionProps) => {
  const handleClearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-card to-card/80 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtros Avançados</h3>
        </div>
        {hasActiveFilters && (
          <Button onClick={handleClearFilters} variant="outline" size="sm" className="gap-2">
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status || "all"} onValueChange={(value) => onFilterChange({ ...filters, status: value === "all" ? undefined : value })}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Aberto">Aberto</SelectItem>
              <SelectItem value="Fechado">Fechado</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select value={filters.priority || "all"} onValueChange={(value) => onFilterChange({ ...filters, priority: value === "all" ? undefined : value })}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Todas as prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="process">Processo</Label>
          <Select value={filters.process || "all"} onValueChange={(value) => onFilterChange({ ...filters, process: value === "all" ? undefined : value })}>
            <SelectTrigger id="process">
              <SelectValue placeholder="Todos os processos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os processos</SelectItem>
              {processes.map(process => (
                <SelectItem key={process} value={process}>{process}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requester">Solicitante</Label>
          <Select value={filters.requester || "all"} onValueChange={(value) => onFilterChange({ ...filters, requester: value === "all" ? undefined : value })}>
            <SelectTrigger id="requester">
              <SelectValue placeholder="Todos os solicitantes" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">Todos os solicitantes</SelectItem>
              {requesters.map(requester => (
                <SelectItem key={requester} value={requester}>{requester}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="search">Busca por Assunto/Descrição</Label>
          <Input
            id="search"
            placeholder="Digite para buscar..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.status && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Status: {filters.status}
              <button onClick={() => onFilterChange({ ...filters, status: undefined })} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.priority && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Prioridade: {filters.priority}
              <button onClick={() => onFilterChange({ ...filters, priority: undefined })} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.process && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Processo: {filters.process}
              <button onClick={() => onFilterChange({ ...filters, process: undefined })} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.requester && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Solicitante: {filters.requester}
              <button onClick={() => onFilterChange({ ...filters, requester: undefined })} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.search && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Busca: "{filters.search}"
              <button onClick={() => onFilterChange({ ...filters, search: undefined })} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
