import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Acidente } from "@/hooks/use-acidentes";
import { CONTRATO_OPTIONS } from "@/lib/contrato-options";

export interface DashboardFilterValues {
  ano: string;
  mes: string;
  contrato: string;
  rateio: string;
  tipo: string;
  estado: string;
  chapa: string;
  colaborador: string;
}

interface DashboardFiltersProps {
  acidentes: Acidente[];
  filters: DashboardFilterValues;
  onChange: (filters: DashboardFilterValues) => void;
}

const MESES_OPTIONS = [
  { value: "all", label: "Todos os meses" },
  { value: "0", label: "Janeiro" }, { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" }, { value: "3", label: "Abril" },
  { value: "4", label: "Maio" }, { value: "5", label: "Junho" },
  { value: "6", label: "Julho" }, { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" }, { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" }, { value: "11", label: "Dezembro" },
];

export default function DashboardFilters({ acidentes, filters, onChange }: DashboardFiltersProps) {
  const anos = useMemo(() => {
    const set = new Set<number>();
    acidentes.forEach(a => set.add(new Date(a.data).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [acidentes]);

  const rateios = useMemo(() => {
    const set = new Set<string>();
    acidentes.forEach(a => { if (a.rateio) set.add(a.rateio); });
    return Array.from(set).sort();
  }, [acidentes]);

  const estados = useMemo(() => {
    const set = new Set<string>();
    acidentes.forEach(a => { if (a.estado) set.add(a.estado); });
    return Array.from(set).sort();
  }, [acidentes]);

  const update = (key: keyof DashboardFilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={filters.ano} onValueChange={v => update("ano", v)}>
        <SelectTrigger className="w-[130px] h-9 text-xs">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os anos</SelectItem>
          {anos.map(a => (
            <SelectItem key={a} value={String(a)}>{a}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.mes} onValueChange={v => update("mes", v)}>
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {MESES_OPTIONS.map(m => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.contrato} onValueChange={v => update("contrato", v)}>
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Contrato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os contratos</SelectItem>
          {CONTRATO_OPTIONS.map(c => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.rateio} onValueChange={v => update("rateio", v)}>
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <SelectValue placeholder="Rateio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os rateios</SelectItem>
          {rateios.map(r => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.tipo} onValueChange={v => update("tipo", v)}>
        <SelectTrigger className="w-[180px] h-9 text-xs">
          <SelectValue placeholder="Tipologia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as tipologias</SelectItem>
          <SelectItem value="ACIDENTE FATAL">Acidente Fatal</SelectItem>
          <SelectItem value="ACIDENTE COM POPULACAO">Acidente com População</SelectItem>
          <SelectItem value="DOENCA PROFISSIONAL / DO TRABALHO">Doença Profissional</SelectItem>
          <SelectItem value="ACIDENTE TIPICO">Acidente Típico</SelectItem>
          <SelectItem value="ACIDENTE ATIPICO - TRAJETO">Atípico - Trajeto</SelectItem>
          <SelectItem value="ACIDENTE ATIPICO - IMPESSOAL">Atípico - Impessoal</SelectItem>
          <SelectItem value="ACIDENTE ATIPICO - SEM LESAO">Atípico - Sem Lesão</SelectItem>
          <SelectItem value="ACIDENTE ATIPICO - DANOS MATERIAIS">Atípico - Danos Materiais</SelectItem>
          <SelectItem value="ACIDENTE ATIPICO - PRIMEIROS SOCORROS">Atípico - Primeiros Socorros</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.estado} onValueChange={v => update("estado", v)}>
        <SelectTrigger className="w-[150px] h-9 text-xs">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os estados</SelectItem>
          {estados.map(e => (
            <SelectItem key={e} value={e}>{e}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={filters.chapa}
        onChange={e => update("chapa", e.target.value)}
        placeholder="Filtrar por chapa"
        className="w-[150px] h-9 text-xs"
      />

      <Input
        value={filters.colaborador}
        onChange={e => update("colaborador", e.target.value)}
        placeholder="Filtrar por colaborador"
        className="w-[210px] h-9 text-xs"
      />
    </div>
  );
}
