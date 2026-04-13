import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts";
import { useAcidentes } from "@/hooks/use-acidentes";
import { useEtapas, ETAPAS_CONFIG } from "@/hooks/use-etapas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import ComparativePyramid from "@/components/ComparativePyramid";
import DashboardFilters, { DashboardFilterValues } from "@/components/DashboardFilters";
import DashboardCharts from "@/components/DashboardCharts";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const TIPO_COLORS: Record<string, string> = {
  "Típico": "hsl(0, 65%, 38%)",
  "Trajeto": "hsl(38, 92%, 50%)",
  "Sinistro de Trânsito": "hsl(210, 79%, 46%)",
  "Primeiros Socorros": "hsl(145, 63%, 42%)",
};
const PIE_COLORS = [
  "hsl(0, 65%, 38%)", "hsl(38, 92%, 50%)", "hsl(210, 79%, 46%)",
  "hsl(145, 63%, 42%)", "hsl(280, 60%, 50%)", "hsl(330, 70%, 50%)",
  "hsl(180, 60%, 40%)", "hsl(60, 80%, 45%)",
  "hsl(10, 80%, 50%)", "hsl(275, 65%, 50%)"
];
const CONTRATO_COLORS = [
  "hsl(0, 65%, 38%)", "hsl(38, 92%, 50%)", "hsl(210, 79%, 46%)",
  "hsl(145, 63%, 42%)", "hsl(280, 60%, 50%)", "hsl(330, 70%, 50%)",
  "hsl(180, 60%, 40%)", "hsl(60, 80%, 45%)",
];

export default function Dashboard() {
  const { data: allAcidentes = [], isLoading } = useAcidentes();
  const { data: etapas = [], isLoading: isLoadingEtapas } = useEtapas();
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<DashboardFilterValues>({
    ano: String(currentYear), mes: "all", contrato: "all", rateio: "all", tipo: "all",
    chapa: "", colaborador: "",
  });

  const acidentes = useMemo(() => {
    return allAcidentes.filter(a => {
      const d = new Date(a.data);
      if (filters.ano !== "all" && d.getFullYear() !== Number(filters.ano)) return false;
      if (filters.mes !== "all" && d.getMonth() !== Number(filters.mes)) return false;
      if (filters.contrato !== "all" && a.contrato !== filters.contrato) return false;
      if (filters.rateio !== "all" && a.rateio !== filters.rateio) return false;
      if (filters.tipo !== "all" && a.tipologia_acidente !== filters.tipo) return false;
      if (filters.chapa && !String(a.chapa).toLowerCase().includes(filters.chapa.toLowerCase().trim())) return false;
      if (filters.colaborador && !a.nome.toLowerCase().includes(filters.colaborador.toLowerCase().trim())) return false;
      return true;
    });
  }, [allAcidentes, filters]);

  const etapaLabelPorAcidente = useMemo(() => {
    const map: Record<string, string> = {};
    etapas.forEach(etapa => {
      let ultimaEtapaLabel = "Não iniciada";
      ETAPAS_CONFIG.forEach(cfg => {
        if (etapa[cfg.key]) {
          ultimaEtapaLabel = cfg.label;
        }
      });
      map[etapa.acidente_id] = ultimaEtapaLabel;
    });
    return map;
  }, [etapas]);

  const totalAcidentes = acidentes.length;
  const totalDiasPerdidos = acidentes.reduce((acc, a) => acc + a.dias_perdidos, 0);
  const pctTipicos = totalAcidentes > 0
    ? Math.round((acidentes.filter(a => a.tipologia_acidente === "ACIDENTE TIPICO").length / totalAcidentes) * 100) : 0;

  const acidentesPorMes = useMemo(() => {
    const counts = new Array(12).fill(0);
    acidentes.forEach(a => counts[new Date(a.data).getMonth()]++);
    return MESES.map((mes, i) => ({ mes, total: counts[i] }));
  }, [acidentes]);

  const tiposAcidente = useMemo(() => {
    const map: Record<string, number> = {};
    acidentes.forEach(a => { const t = a.tipologia_acidente || "Não informado"; map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).map(([tipo, total], index) => ({
      tipo,
      total,
      fill: TIPO_COLORS[tipo] || PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [acidentes]);

  const acidentesPorContrato = useMemo(() => {
    const map: Record<string, number> = {};
    acidentes.forEach(a => { const k = a.contrato || "Sem contrato"; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map)
      .map(([contrato, total], i) => ({ contrato, total, fill: CONTRATO_COLORS[i % CONTRATO_COLORS.length] }))
      .sort((a, b) => b.total - a.total);
  }, [acidentes]);

  const anoAtual = filters.ano !== "all" ? Number(filters.ano) : currentYear;
  const anoAnterior = anoAtual - 1;

  function renderTipoAcidenteLegend(props: any) {
    if (!props.payload) return null;
    return (
      <ul className="space-y-2 mt-2">
        {props.payload.map((entry: any) => (
          <li key={entry.value} className="flex items-center gap-2 text-sm text-foreground">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span>{entry.payload.total}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (isLoading || isLoadingEtapas) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos acidentes de trabalho</p>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <DashboardFilters acidentes={allAcidentes} filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAcidentes}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de Acidentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalDiasPerdidos}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Dias de Afastamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pctTipicos}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Acidentes Típicos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card><CardContent className="py-2"><ComparativePyramid acidentes={acidentes} anoAtual={anoAtual} anoAnterior={anoAnterior} /></CardContent></Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Acidentes por Mês</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={acidentesPorMes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis tick={false} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(0, 65%, 38%)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Tipo de Acidente</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={tiposAcidente}
                  dataKey="total"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={2}
                  labelLine={false}
                >
                  {tiposAcidente.map((entry) => <Cell key={entry.tipo} fill={entry.fill} />)}
                  <LabelList dataKey="total" position="inside" fill="#fff" style={{ fontSize: 12, fontWeight: 600 }} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="grid gap-2 mt-2">
              {tiposAcidente.map(entry => (
                <div key={entry.tipo} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: entry.fill }} />
                  <span>{entry.tipo}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* New charts: sexo, dia_semana, hora, status */}
      <DashboardCharts acidentes={acidentes} />

      <Card>
        <CardHeader><CardTitle className="text-base">Acidentes por Contrato</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={acidentesPorContrato} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={false} axisLine={false} tickLine={false} />
              <YAxis dataKey="contrato" type="category" fontSize={12} width={120} />
              <Tooltip />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {acidentesPorContrato.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status das Etapas por Colaborador</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chapa</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipologia do Acidente</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Rateio</TableHead>
                <TableHead>Etapa da Investigação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acidentes.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono">{a.chapa}</TableCell>
                  <TableCell>{a.nome}</TableCell>
                  <TableCell>{a.tipologia_acidente || "-"}</TableCell>
                  <TableCell>{a.contrato || "-"}</TableCell>
                  <TableCell>{a.rateio || "-"}</TableCell>
                  <TableCell>{etapaLabelPorAcidente[a.id] || "Não iniciada"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
