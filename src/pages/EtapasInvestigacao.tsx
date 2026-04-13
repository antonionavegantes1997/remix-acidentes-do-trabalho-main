import { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAcidentes } from "@/hooks/use-acidentes";
import { useEtapas, useCreateEtapa, useUpdateEtapa, ETAPAS_CONFIG, EtapaInvestigacao } from "@/hooks/use-etapas";
import DashboardFilters, { DashboardFilterValues } from "@/components/DashboardFilters";
import { parseDate, formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

function isLate(acidenteData: string, etapaDate: string | null, prazoHoras: number | null): boolean | null {
  if (!prazoHoras || !etapaDate) return null;
  const acDate = parseDate(acidenteData);
  const etDate = parseDate(etapaDate);
  const diffMs = etDate.getTime() - acDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours > prazoHoras;
}

export default function EtapasInvestigacao() {
  const { canEdit } = useAuth();
  const { data: allAcidentes = [], isLoading: loadingAcidentes } = useAcidentes();
  const { data: etapas = [], isLoading: loadingEtapas } = useEtapas();
  const createEtapa = useCreateEtapa();
  const updateEtapa = useUpdateEtapa();

  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<DashboardFilterValues>({
    ano: String(currentYear), mes: "all", contrato: "all", rateio: "all", tipo: "all",
    chapa: "", colaborador: "",
  });

  const acidentes = useMemo(() => {
    return allAcidentes.filter(a => {
      const d = parseDate(a.data);
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

  // Auto-create etapas for new acidentes
  useEffect(() => {
    if (!canEdit || loadingEtapas || loadingAcidentes) return;
    allAcidentes.forEach(a => {
      const exists = etapas.some(e => e.acidente_id === a.id);
      if (!exists) {
        createEtapa.mutate({ acidente_id: a.id, responsavel_nome: "" });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, allAcidentes.length, etapas.length, loadingEtapas, loadingAcidentes]);

  const getEtapa = (acidenteId: string) => etapas.find(e => e.acidente_id === acidenteId);

  const isLoading = loadingAcidentes || loadingEtapas;

  const handleFieldUpdate = (etapaId: string, field: string, value: string) => {
    updateEtapa.mutate({ id: etapaId, [field]: value || null });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Etapas do Processo de Investigação</h1>
        <p className="text-sm text-muted-foreground">Acompanhamento das etapas obrigatórias de cada acidente</p>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <DashboardFilters acidentes={allAcidentes} filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10">Nome</TableHead>
                  <TableHead>Data Acidente</TableHead>
                  {ETAPAS_CONFIG.map(e => (
                    <TableHead key={e.key} className="min-w-[220px]">
                      {e.label}
                      {e.prazoHoras && (
                        <span className="block text-xs text-muted-foreground font-normal">
                          Prazo: {e.prazoHoras}h
                        </span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {acidentes.map(a => {
                  const etapa = getEtapa(a.id);
                  if (!etapa) {
                    if (canEdit) return null;
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium sticky left-0 bg-background z-10">{a.nome}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(a.data)}
                          {a.hora ? ` ${a.hora.substring(0, 5)}` : ""}
                        </TableCell>
                        <TableCell colSpan={ETAPAS_CONFIG.length} className="text-xs text-muted-foreground">
                          Linha de etapas ainda não criada para este acidente (somente administradores podem inicializar).
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <EtapaRow
                      key={a.id}
                      nome={a.nome}
                      dataAcidente={a.data}
                      horaAcidente={a.hora}
                      etapa={etapa}
                      canEdit={canEdit}
                      onUpdate={handleFieldUpdate}
                    />
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EtapaRow({
  nome, dataAcidente, horaAcidente, etapa, canEdit, onUpdate,
}: {
  nome: string;
  dataAcidente: string;
  horaAcidente: string | null;
  etapa: EtapaInvestigacao;
  canEdit: boolean;
  onUpdate: (etapaId: string, field: string, value: string) => void;
}) {
  const refDateStr = horaAcidente
    ? `${dataAcidente}T${horaAcidente}`
    : `${dataAcidente}T08:00:00`;

  return (
    <TableRow>
      <TableCell className="font-medium sticky left-0 bg-background z-10">{nome}</TableCell>
      <TableCell className="whitespace-nowrap">
        {formatDate(dataAcidente)}
        {horaAcidente ? ` ${horaAcidente.substring(0, 5)}` : ""}
      </TableCell>
      {ETAPAS_CONFIG.map(cfg => {
        const val = etapa[cfg.key] as string | null;
        const respVal = etapa[cfg.respKey] as string || "";
        const late = isLate(refDateStr, val, cfg.prazoHoras);

        let colorClass = "";
        if (val && cfg.prazoHoras !== null) {
          colorClass = late ? "text-red-600 font-semibold" : "text-green-600 font-semibold";
        }

        return (
          <TableCell key={cfg.key}>
            <div className="space-y-1">
              <Input
                placeholder="Responsável"
                className="min-w-[180px] text-xs"
                defaultValue={respVal}
                readOnly={!canEdit}
                onBlur={e => canEdit && onUpdate(etapa.id, cfg.respKey, e.target.value)}
              />
              <Input
                type="datetime-local"
                className={`min-w-[190px] ${colorClass}`}
                defaultValue={val ? val.slice(0, 16) : ""}
                readOnly={!canEdit}
                onBlur={e => {
                  if (!canEdit) return;
                  const v = e.target.value;
                  onUpdate(etapa.id, cfg.key, v ? new Date(v).toISOString() : "");
                }}
              />
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}
