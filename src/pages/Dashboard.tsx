import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts";
import { useAcidentes } from "@/hooks/use-acidentes";
import { useEtapas, ETAPAS_CONFIG } from "@/hooks/use-etapas";
import { useAcoes } from "@/hooks/use-acoes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, parseDate } from "@/lib/utils";

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
  const { data: acoes = [], isLoading: isLoadingAcoes } = useAcoes();
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<DashboardFilterValues>({
    ano: "all", mes: "all", contrato: "all", rateio: "all", tipo: "all",
    chapa: "", colaborador: "",
  });

  const acidentes = useMemo(() => {
    return allAcidentes.filter(a => {
      const d = parseDate(a.data);
      if (Number.isNaN(d.getTime())) return false;
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
    const totalEtapas = ETAPAS_CONFIG.length;
    const mapNumero: Record<string, string> = {};
    etapas.forEach(etapa => {
      let ultimaEtapaLabel = "Não iniciada";
      let ultimaEtapaNumero = 0;
      ETAPAS_CONFIG.forEach((cfg, index) => {
        if (etapa[cfg.key]) {
          ultimaEtapaLabel = cfg.label;
          ultimaEtapaNumero = index + 1;
        }
      });
      map[etapa.acidente_id] = ultimaEtapaLabel;
      mapNumero[etapa.acidente_id] = `${ultimaEtapaNumero}/${totalEtapas}`;
    });
    return { map, mapNumero };
  }, [etapas]);

  const totalAcidentes = acidentes.length;
  const totalDiasPerdidos = acidentes.reduce((acc, a) => acc + a.dias_perdidos, 0);
  const pctTipicos = totalAcidentes > 0
    ? Math.round((acidentes.filter(a => a.tipologia_acidente === "ACIDENTE TIPICO").length / totalAcidentes) * 100) : 0;

  const acidentesPorMes = useMemo(() => {
    const counts = new Array(12).fill(0);
    acidentes.forEach(a => {
      const d = parseDate(a.data);
      if (!Number.isNaN(d.getTime())) counts[d.getMonth()]++;
    });
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

  const transitoResponsabilidades = useMemo(() => {
    const map: Record<string, number> = {};
    acidentes.forEach(a => {
      if (a.transito_responsabilidades) {
        map[a.transito_responsabilidades] = (map[a.transito_responsabilidades] || 0) + 1;
      }
    });
    return Object.entries(map).map(([responsabilidade, total], index) => ({
      responsabilidade,
      total,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [acidentes]);

  const situacaoAtualAcoes = useMemo(() => {
    const acidentesIds = new Set(acidentes.map((a) => a.id));
    const map: Record<string, number> = {};
    acoes.forEach((acao) => {
      if (!acidentesIds.has(acao.acidente_id)) return;
      const situacao = acao.situacao_atual || "Não informada";
      map[situacao] = (map[situacao] || 0) + 1;
    });
    return Object.entries(map).map(([situacao, total], index) => ({
      situacao,
      total,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [acoes, acidentes]);

  const situacaoAtualAcoesPorAcidente = useMemo(() => {
    const map = new Map<string, Set<string>>();
    acoes.forEach((acao) => {
      if (!map.has(acao.acidente_id)) {
        map.set(acao.acidente_id, new Set());
      }
      map.get(acao.acidente_id)!.add(acao.situacao_atual || "Não informada");
    });

    const result: Record<string, string> = {};
    map.forEach((situacoes, acidenteId) => {
      result[acidenteId] = Array.from(situacoes).join(", ");
    });
    return result;
  }, [acoes]);

  const dadosAcoesPorAcidente = useMemo(() => {
    const acoesMap = new Map<string, Set<string>>();
    const dataPrevistaMap = new Map<string, Set<string>>();
    const dataRealizadaMap = new Map<string, Set<string>>();

    acoes.forEach((acao) => {
      if (!acoesMap.has(acao.acidente_id)) acoesMap.set(acao.acidente_id, new Set());
      if (!dataPrevistaMap.has(acao.acidente_id)) dataPrevistaMap.set(acao.acidente_id, new Set());
      if (!dataRealizadaMap.has(acao.acidente_id)) dataRealizadaMap.set(acao.acidente_id, new Set());

      if (acao.acao?.trim()) acoesMap.get(acao.acidente_id)!.add(acao.acao.trim());
      if (acao.data_prevista_execucao) dataPrevistaMap.get(acao.acidente_id)!.add(formatDate(acao.data_prevista_execucao));
      if (acao.data_realizada_execucao) dataRealizadaMap.get(acao.acidente_id)!.add(formatDate(acao.data_realizada_execucao));
    });

    const toRecord = (map: Map<string, Set<string>>) => {
      const result: Record<string, string> = {};
      map.forEach((values, acidenteId) => {
        result[acidenteId] = Array.from(values).join(" | ");
      });
      return result;
    };

    return {
      acoes: toRecord(acoesMap),
      dataPrevista: toRecord(dataPrevistaMap),
      dataRealizada: toRecord(dataRealizadaMap),
    };
  }, [acoes]);

  const etapasInvestigacaoData = useMemo(() => {
    const map: Record<string, number> = {};
    acidentes.forEach((acidente) => {
      const label = etapaLabelPorAcidente.map[acidente.id] || "Não iniciada";
      map[label] = (map[label] || 0) + 1;
    });

    return Object.entries(map)
      .map(([etapa, total]) => ({ etapa, total }))
      .sort((a, b) => {
        const getOrder = (label: string) => {
          if (label === "Não iniciada") return 0;
          const match = label.match(/^(\d+)\)/);
          return match ? Number(match[1]) : 999;
        };
        return getOrder(a.etapa) - getOrder(b.etapa);
      });
  }, [acidentes, etapaLabelPorAcidente]);

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

  if (isLoading || isLoadingEtapas || isLoadingAcoes) {
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
                <LabelList dataKey="total" position="right" fill="#000000" />
                {acidentesPorContrato.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {transitoResponsabilidades.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Trânsito Responsabilidades (NP077)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={transitoResponsabilidades}
                  dataKey="total"
                  nameKey="responsabilidade"
                  cx="50%"
                  cy="50%"
                  outerRadius={78}
                  innerRadius={38}
                  paddingAngle={2}
                  labelLine={false}
                >
                  {transitoResponsabilidades.map((entry) => <Cell key={entry.responsabilidade} fill={entry.fill} />)}
                  <LabelList dataKey="total" position="inside" fill="#fff" style={{ fontSize: 12, fontWeight: 600 }} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="grid gap-2 mt-2">
              {transitoResponsabilidades.map(entry => (
                <div key={entry.responsabilidade} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: entry.fill }} />
                  <span>{entry.responsabilidade}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      )}

      {situacaoAtualAcoes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Situação Atual das Ações</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={situacaoAtualAcoes}
                  dataKey="total"
                  nameKey="situacao"
                  cx="50%"
                  cy="50%"
                  outerRadius={78}
                  innerRadius={38}
                  paddingAngle={2}
                  labelLine={false}
                >
                  {situacaoAtualAcoes.map((entry) => <Cell key={entry.situacao} fill={entry.fill} />)}
                  <LabelList dataKey="total" position="inside" fill="#fff" style={{ fontSize: 12, fontWeight: 600 }} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="grid gap-2 mt-2">
              {situacaoAtualAcoes.map(entry => (
                <div key={entry.situacao} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: entry.fill }} />
                  <span>{entry.situacao}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      )}

      {etapasInvestigacaoData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Etapas de Investigação</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={etapasInvestigacaoData} layout="vertical" margin={{ left: 16, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={false} axisLine={false} tickLine={false} />
                <YAxis dataKey="etapa" type="category" width={360} fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(210, 79%, 46%)" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="total" position="right" fill="#000000" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
                <TableHead>Data do Acidente</TableHead>
                <TableHead>Tipologia do Acidente</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Rateio</TableHead>
                <TableHead>N°</TableHead>
                <TableHead>Etapa da Investigação</TableHead>
                <TableHead>Situação Atual das Ações</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Data Realizada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acidentes.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono">{a.chapa}</TableCell>
                  <TableCell>{a.nome}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(a.data)}</TableCell>
                  <TableCell>{a.tipologia_acidente || "-"}</TableCell>
                  <TableCell>{a.contrato || "-"}</TableCell>
                  <TableCell>{a.rateio || "-"}</TableCell>
                  <TableCell>{etapaLabelPorAcidente.mapNumero[a.id] || `0/${ETAPAS_CONFIG.length}`}</TableCell>
                  <TableCell>{etapaLabelPorAcidente.map[a.id] || "Não iniciada"}</TableCell>
                  <TableCell>{situacaoAtualAcoesPorAcidente[a.id] || "-"}</TableCell>
                  <TableCell className="max-w-[300px] whitespace-pre-wrap text-xs">{dadosAcoesPorAcidente.acoes[a.id] || "-"}</TableCell>
                  <TableCell className="max-w-[150px] whitespace-pre-wrap text-xs">{dadosAcoesPorAcidente.dataPrevista[a.id] || "-"}</TableCell>
                  <TableCell className="max-w-[150px] whitespace-pre-wrap text-xs">{dadosAcoesPorAcidente.dataRealizada[a.id] || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}