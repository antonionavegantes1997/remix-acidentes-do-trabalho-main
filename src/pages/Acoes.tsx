import { useState, useMemo, useRef, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { Loader2, Upload, Paperclip, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAcidentes, Acidente } from "@/hooks/use-acidentes";
import { useAcoes, useAcoesAnexos, useUpdateAcao, useCreateAcao, useUploadAnexo, useDeleteAnexo, Acao } from "@/hooks/use-acoes";
import { supabase } from "@/integrations/supabase/client";
import DashboardFilters, { DashboardFilterValues } from "@/components/DashboardFilters";
import AcidenteFormDialog from "@/components/AcidenteFormDialog";
import { useUpdateAcidente, AcidenteInput } from "@/hooks/use-acidentes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SITUACAO_OPTIONS = ["Aguardando análise", "Em andamento", "Concluída", "Cancelada"];
const TIPO_ACAO_OPTIONS = ["Sim", "Não"];

interface AcidenteCausaRow {
  acidenteId: string;
  acidente: Acidente;
  nome: string;
  data: string;
  causaTipo: string;
  causaDescricao: string;
}

export default function Acoes() {
  const { canEdit } = useAuth();
  const { data: allAcidentes = [], isLoading: loadingAcidentes } = useAcidentes();
  const { data: acoes = [], isLoading: loadingAcoes } = useAcoes();
  const createAcao = useCreateAcao();
  const updateAcao = useUpdateAcao();
  const uploadAnexo = useUploadAnexo();
  const deleteAnexo = useDeleteAnexo();
  const updateAcidente = useUpdateAcidente();

  const [editingAcidente, setEditingAcidente] = useState<Acidente | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  // Expand each acidente into rows per cause
  const causaRows = useMemo<AcidenteCausaRow[]>(() => {
    const rows: AcidenteCausaRow[] = [];
    acidentes.forEach(a => {
      const causes: { tipo: string; desc: string }[] = [];
      if (a.causas_imediatas_tasc) causes.push({ tipo: "Causa Imediata", desc: a.causas_imediatas_tasc });
      if (a.causas_imediatas_tasc_1) causes.push({ tipo: "Causa Imediata 1", desc: a.causas_imediatas_tasc_1 });
      if (a.causas_imediatas_tasc_2) causes.push({ tipo: "Causa Imediata 2", desc: a.causas_imediatas_tasc_2 });
      if (a.causas_basicas_tasc) causes.push({ tipo: "Causa Básica", desc: a.causas_basicas_tasc });
      if (a.causas_basicas_tasc_1) causes.push({ tipo: "Causa Básica 1", desc: a.causas_basicas_tasc_1 });
      if (a.causas_basicas_tasc_2) causes.push({ tipo: "Causa Básica 2", desc: a.causas_basicas_tasc_2 });
      if (!causes.length) causes.push({ tipo: "Sem causa definida", desc: "-" });
      causes.forEach(c => {
        rows.push({
          acidenteId: a.id,
          acidente: a,
          nome: a.nome,
          data: a.data,
          causaTipo: c.tipo,
          causaDescricao: c.desc,
        });
      });
    });
    return rows;
  }, [acidentes]);

  // Ensure ações exist for each causa row
  useEffect(() => {
    if (!canEdit || loadingAcoes || loadingAcidentes) return;
    causaRows.forEach(row => {
      const exists = acoes.some(
        ac => ac.acidente_id === row.acidenteId && ac.causa_tipo === row.causaTipo && ac.causa_descricao === row.causaDescricao
      );
      if (!exists) {
        createAcao.mutate({
          acidente_id: row.acidenteId,
          causa_tipo: row.causaTipo,
          causa_descricao: row.causaDescricao,
          acao: "",
          corretiva: "Não",
          preventiva: "Não",
          responsavel_execucao: "",
          data_prevista_execucao: null,
          data_realizada_execucao: null,
          situacao_atual: "Aguardando análise",
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, causaRows.length, acoes.length, loadingAcoes, loadingAcidentes]);

  const acaoIds = useMemo(() => acoes.map(a => a.id), [acoes]);
  const { data: anexos = [] } = useAcoesAnexos(acaoIds);

  const getAcao = (acidenteId: string, causaTipo: string, causaDesc: string): Acao | undefined => {
    return acoes.find(ac => ac.acidente_id === acidenteId && ac.causa_tipo === causaTipo && ac.causa_descricao === causaDesc);
  };

  const isLoading = loadingAcidentes || loadingAcoes;

  const handleEditAcidente = (acidente: Acidente) => {
    setEditingAcidente(acidente);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (input: AcidenteInput, id?: string) => {
    if (id) {
      updateAcidente.mutate({ ...input, id }, { onSuccess: () => setEditDialogOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ações</h1>
        <p className="text-sm text-muted-foreground">Ações vinculadas aos acidentes registrados</p>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <DashboardFilters acidentes={allAcidentes} filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      <AcidenteFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editing={editingAcidente}
        onSubmit={handleEditSubmit}
        isPending={updateAcidente.isPending}
      />

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
                  <TableHead>Editar</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data Acidente</TableHead>
                  <TableHead>Tipo de Causa</TableHead>
                  <TableHead>Causa</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Corretiva</TableHead>
                  <TableHead>Preventiva</TableHead>
                  <TableHead>Responsável pela Execução</TableHead>
                  <TableHead>Data Prevista (Conclusão)</TableHead>
                  <TableHead>Data Realizada</TableHead>
                  <TableHead>Situação Atual</TableHead>
                  <TableHead>Anexos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {causaRows.map((row, idx) => {
                  const acao = getAcao(row.acidenteId, row.causaTipo, row.causaDescricao);
                  if (!acao) {
                    if (canEdit) return null;
                    return (
                      <AcaoRowReadOnly
                        key={`${row.acidenteId}-${row.causaTipo}-${idx}-pending`}
                        row={row}
                        onEditAcidente={() => handleEditAcidente(row.acidente)}
                      />
                    );
                  }
                  const rowAnexos = anexos.filter(an => an.acao_id === acao.id);
                  return (
                    <AcaoRow
                      key={`${row.acidenteId}-${row.causaTipo}-${idx}`}
                      row={row}
                      acao={acao}
                      anexos={rowAnexos}
                      canEdit={canEdit}
                      onUpdate={updateAcao.mutate}
                      onUpload={uploadAnexo.mutate}
                      onDeleteAnexo={deleteAnexo.mutate}
                      onEditAcidente={() => handleEditAcidente(row.acidente)}
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

function AcaoRowReadOnly({
  row,
  onEditAcidente,
}: {
  row: AcidenteCausaRow;
  onEditAcidente: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <Button variant="outline" size="sm" onClick={onEditAcidente} disabled>
          <Pencil className="h-3 w-3" />
        </Button>
      </TableCell>
      <TableCell className="font-medium">{row.nome}</TableCell>
      <TableCell className="whitespace-nowrap">{formatDate(row.data)}</TableCell>
      <TableCell className="text-xs font-semibold">{row.causaTipo}</TableCell>
      <TableCell className="max-w-[200px] text-xs">{row.causaDescricao}</TableCell>
      <TableCell colSpan={8} className="text-xs text-muted-foreground">
        Registro de ações ainda não disponível para este filtro (aguarde um administrador sincronizar ou ajuste o período).
      </TableCell>
    </TableRow>
  );
}

function AcaoRow({
  row, acao, anexos, canEdit, onUpdate, onUpload, onDeleteAnexo, onEditAcidente,
}: {
  row: AcidenteCausaRow;
  acao: Acao;
  anexos: { id: string; file_name: string; file_path: string; file_type: string; acao_id: string; created_at: string }[];
  canEdit: boolean;
  onUpdate: (data: any) => void;
  onUpload: (data: any) => void;
  onDeleteAnexo: (data: any) => void;
  onEditAcidente: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [acaoText, setAcaoText] = useState(acao.acao);
  const [corretivaValue, setCorretivaValue] = useState(acao.corretiva || "Não");
  const [preventivaValue, setPreventivaValue] = useState(acao.preventiva || "Não");
  const [responsavelValue, setResponsavelValue] = useState(acao.responsavel_execucao);
  const [dataPrevistaValue, setDataPrevistaValue] = useState(acao.data_prevista_execucao || "");
  const [dataRealizadaValue, setDataRealizadaValue] = useState(acao.data_realizada_execucao || "");
  const [situacaoValue, setSituacaoValue] = useState(acao.situacao_atual);

  useEffect(() => {
    setAcaoText(acao.acao);
    setCorretivaValue(acao.corretiva || "Não");
    setPreventivaValue(acao.preventiva || "Não");
    setResponsavelValue(acao.responsavel_execucao);
    setDataPrevistaValue(acao.data_prevista_execucao || "");
    setDataRealizadaValue(acao.data_realizada_execucao || "");
    setSituacaoValue(acao.situacao_atual);
  }, [acao.id, acao.acao, acao.corretiva, acao.preventiva, acao.responsavel_execucao, acao.data_prevista_execucao, acao.data_realizada_execucao, acao.situacao_atual]);

  const handleField = (field: string, value: string) => {
    if (!canEdit) return;
    onUpdate({ id: acao.id, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const files = e.target.files;
    if (!files) return;
    const maxFiles = 3 - anexos.length;
    Array.from(files).slice(0, maxFiles).forEach(file => {
      onUpload({ acaoId: acao.id, file });
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const openAttachment = async (path: string) => {
    try {
      const cached = signedUrls[path];
      if (cached) {
        window.open(cached, "_blank", "noopener,noreferrer");
        return;
      }
      const { data, error } = await supabase.storage.from("acoes-anexos").createSignedUrl(path, 60);
      if (error || !data?.signedUrl) throw error || new Error("Falha ao gerar link assinado.");
      setSignedUrls((prev) => ({ ...prev, [path]: data.signedUrl }));
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao abrir anexo.";
      toast.error(msg);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Button variant="outline" size="sm" onClick={onEditAcidente} disabled={!canEdit}>
          <Pencil className="h-3 w-3" />
        </Button>
      </TableCell>
      <TableCell className="font-medium">{row.nome}</TableCell>
      <TableCell className="whitespace-nowrap">{formatDate(row.data)}</TableCell>
      <TableCell className="text-xs font-semibold">{row.causaTipo}</TableCell>
      <TableCell className="max-w-[200px] text-xs">{row.causaDescricao}</TableCell>
      <TableCell>
        <Textarea
          className="min-w-[220px] min-h-[88px] resize-y"
          value={acaoText}
          readOnly={!canEdit}
          onBlur={e => handleField("acao", e.target.value)}
          onChange={e => setAcaoText(e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Select
          value={corretivaValue}
          onValueChange={v => {
            setCorretivaValue(v);
            handleField("corretiva", v);
          }}
          disabled={!canEdit}
        >
          <SelectTrigger className="min-w-[120px]"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {TIPO_ACAO_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={preventivaValue}
          onValueChange={v => {
            setPreventivaValue(v);
            handleField("preventiva", v);
          }}
          disabled={!canEdit}
        >
          <SelectTrigger className="min-w-[120px]"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {TIPO_ACAO_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          className="min-w-[140px]"
          value={responsavelValue}
          readOnly={!canEdit}
          onBlur={e => handleField("responsavel_execucao", e.target.value)}
          onChange={e => setResponsavelValue(e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          type="date"
          className="min-w-[130px]"
          value={dataPrevistaValue}
          readOnly={!canEdit}
          onBlur={e => handleField("data_prevista_execucao", e.target.value)}
          onChange={e => setDataPrevistaValue(e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          type="date"
          className="min-w-[130px]"
          value={dataRealizadaValue}
          readOnly={!canEdit}
          onBlur={e => handleField("data_realizada_execucao", e.target.value)}
          onChange={e => setDataRealizadaValue(e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Select
          value={situacaoValue}
          onValueChange={v => {
            setSituacaoValue(v);
            handleField("situacao_atual", v);
          }}
          disabled={!canEdit}
        >
          <SelectTrigger className="min-w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SITUACAO_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          {anexos.map(an => (
            <div key={an.id} className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => void openAttachment(an.file_path)}
                className="text-primary hover:underline flex items-center gap-0.5"
              >
                <Paperclip className="h-3 w-3" /> {an.file_name.length > 15 ? an.file_name.slice(0, 15) + "..." : an.file_name}
              </button>
              <button type="button" disabled={!canEdit} onClick={() => onDeleteAnexo(an)} className="text-destructive hover:text-destructive/80 disabled:opacity-40">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {canEdit && anexos.length < 3 && (
            <>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3 w-3" /> Anexar
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}