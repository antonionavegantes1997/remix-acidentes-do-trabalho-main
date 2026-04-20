import { useState, useRef, useMemo } from "react";
import { Plus, Loader2, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAcidentes, useCreateAcidente, useUpdateAcidente, useDeleteAcidente, useBulkCreateAcidentes, Acidente, AcidenteInput } from "@/hooks/use-acidentes";
import AcidenteFormDialog from "@/components/AcidenteFormDialog";
import DashboardFilters, { DashboardFilterValues } from "@/components/DashboardFilters";
import { toast } from "sonner";
import { parseDate, formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(";").map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ""; });
    return row;
  });
}

function mapRowToInput(r: Record<string, string>): AcidenteInput {
  return {
    nome_empresa: "CGB",
    chapa: Number(r["chapa"] || 0),
    nome: r["nome"] || "",
    cargo: r["cargo"] || "",
    sexo: r["sexo"] || "",
    idade: r["idade"] ? Number(r["idade"]) : null,
    escolaridade: r["escolaridade"] || "",
    tempo_empresa: r["tempo na empresa"] || "",
    tempo_funcao: r["tempo na função"] || r["tempo na funcao"] || "",
    rateio: r["rateio"] || "",
    contrato: r["contrato"] || "",
    regional: r["regional"] || "",
    estado: r["estado"] || "",
    data: r["data"] || "",
    hora: r["hora"] || null,
    turno_trabalho: r["turno de trabalho"] || "",
    dia_semana: r["dia da semana"] || "",
    horas_trabalhadas: r["horas trabalhadas"] || "",
    municipio: r["município"] || r["municipio"] || "",
    zona: r["zona"] || "",
    tipologia_acidente: r["tipologia do acidente"] || "",
    natureza_acidente: r["natureza acidente"] || "",
    placa_veiculo: r["placa veículo"] || r["placa veiculo"] || "",
    descricao: r["descrição"] || r["descricao"] || "",
    afastamento: r["afastamento"] || "",
    dias_perdidos: Number(r["dias perdidos"] || 0),
    dias_debitados: Number(r["dias debitados"] || 0),
    numero_cat: r["nº cat"] || r["numero cat"] || "",
    gravidade_lesao: r["gravidade da lesao"] || r["gravidade da lesão"] || "",
    identificacao_lesao: r["identificacao da lesao/doenca"] || r["identificação da lesão/doença"] || "",
    gravidade_acidente: r["gravidade do acidente"] || "",
    tarefa_executada: r["tarefa executada no momento da ocorrencia"] || "",
    
    tipo_evento: r["tipo do evento (tasc)"] || r["tipo do acidente"] || r["tipo"] || "",
    causas_basicas_tasc: r["causas basicas (tasc)"] || r["causas básicas (tasc)"] || "",
    causas_basicas_tasc_1: r["causas basicas (tasc) 1"] || r["causas básicas (tasc) 1"] || "",
    causas_basicas_tasc_2: r["causas basicas (tasc) 2"] || r["causas básicas (tasc) 2"] || "",
    causas_imediatas_tasc: r["causas imediatas (tasc)"] || "",
    causas_imediatas_tasc_1: r["causas imediatas (tasc) 1"] || "",
    causas_imediatas_tasc_2: r["causas imediatas (tasc) 2"] || "",
    nome_gestor: r["nome do gestor do colaborador"] || "",
    nome_responsavel: r["nome do responsavel pelas informacoes do comunicado"] || r["nome do responsável pelas informações do comunicado"] || "",
    fatalidade: r["fatalidade"] || "",
    status_acidente: r["status acidente"] || "",
    data_retorno: r["data retorno"] || null,
    origem_fonte: r["origem / fonte"] || r["origem/fonte"] || "",
    id_comunica_seguranca_eqtl: r["id - comunica segurança eqtl"] || r["id comunica segurança eqtl"] || "",
    transito_responsabilidades: r["trânsito responsabilidades"] || r["transito responsabilidades"] || "",
    parte_corpo_atingida: r["parte do corpo atingida"] || "",
    subdivisao_parte_corpo: r["subdivisão de partes do corpo"] || r["subdivisao parte corpo"] || "",
    cid: r["cid"] || "",
  };
}

export default function Acidentes() {
  const { canEdit } = useAuth();
  const { data = [], isLoading } = useAcidentes();
  const createMutation = useCreateAcidente();
  const updateMutation = useUpdateAcidente();
  const deleteMutation = useDeleteAcidente();
  const bulkMutation = useBulkCreateAcidentes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Acidente | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<DashboardFilterValues>({
    ano: String(currentYear), mes: "all", contrato: "all", rateio: "all", tipo: "all",
    chapa: "", colaborador: "",
  });

  const filteredData = useMemo(() => {
    return data.filter(a => {
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
  }, [data, filters]);

  const handleSubmit = (input: AcidenteInput, id?: string) => {
    if (id) {
      updateMutation.mutate({ ...input, id }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleEdit = (a: Acidente) => { setEditing(a); setDialogOpen(true); };
  const handleNew = () => { setEditing(null); setDialogOpen(true); };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target?.result as string);
        if (!rows.length) { toast.error("Arquivo vazio ou inválido."); return; }
        bulkMutation.mutate(rows.map(mapRowToInput));
      } catch { toast.error("Erro ao processar arquivo."); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Controle de Acidentes</h1>
          <p className="text-sm text-muted-foreground">Gerencie todos os registros de acidentes</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileImport} />
          <Button variant="outline" className="gap-1" onClick={() => fileInputRef.current?.click()} disabled={!canEdit || bulkMutation.isPending}>
            {bulkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importar CSV
          </Button>
          <Button className="gap-1" onClick={handleNew} disabled={!canEdit}>
            <Plus className="h-4 w-4" /> Novo Acidente
          </Button>
        </div>
      </div>

      <AcidenteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <Card>
        <CardContent className="pt-4 pb-4">
          <DashboardFilters acidentes={data} filters={filters} onChange={setFilters} />
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
                  <TableHead>Empresa</TableHead>
                  <TableHead>Chapa</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Rateio</TableHead>
                  <TableHead>Regional</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Dia Semana</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead>Tipologia</TableHead>
                  <TableHead>Tipo Evento</TableHead>
                  <TableHead>Origem/Fonte</TableHead>
                  <TableHead>Natureza</TableHead>
                  <TableHead>Trânsito Resp.</TableHead>
                  <TableHead>Parte Corpo</TableHead>
                  <TableHead>Subdivisão</TableHead>
                  <TableHead>Afastamento</TableHead>
                  <TableHead>Dias Perd.</TableHead>
                  <TableHead>Dias Deb.</TableHead>
                  <TableHead>Nº CAT</TableHead>
                  <TableHead>Grav. Lesão</TableHead>
                  <TableHead>Grav. Acidente</TableHead>
                  <TableHead>Fatalidade</TableHead>
                  <TableHead>Causas Imediatas</TableHead>
                  <TableHead>ID Comunica EQTL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Retorno</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>CGB</TableCell>
                    <TableCell className="font-mono">{a.chapa}</TableCell>
                    <TableCell>{a.nome}</TableCell>
                    <TableCell>{a.cargo}</TableCell>
                    <TableCell>{a.sexo}</TableCell>
                    <TableCell>{a.idade}</TableCell>
                    <TableCell>{a.contrato}</TableCell>
                    <TableCell>{a.rateio}</TableCell>
                    <TableCell>{a.regional}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(a.data)}
                      {a.hora ? ` ${a.hora.substring(0, 5)}` : ""}
                    </TableCell>
                    <TableCell>{a.turno_trabalho}</TableCell>
                    <TableCell>{a.dia_semana}</TableCell>
                    <TableCell>{a.municipio}</TableCell>
                    <TableCell>{a.zona}</TableCell>
                    <TableCell>{a.tipologia_acidente}</TableCell>
                    <TableCell>{a.tipo_evento}</TableCell>
                    <TableCell>{a.origem_fonte}</TableCell>
                    <TableCell>{a.natureza_acidente}</TableCell>
                    <TableCell>{a.transito_responsabilidades}</TableCell>
                    <TableCell>{a.parte_corpo_atingida}</TableCell>
                    <TableCell>{a.subdivisao_parte_corpo}</TableCell>
                    <TableCell>{a.afastamento}</TableCell>
                    <TableCell>{a.dias_perdidos}</TableCell>
                    <TableCell>{a.dias_debitados}</TableCell>
                    <TableCell>{a.numero_cat}</TableCell>
                    <TableCell>{a.gravidade_lesao}</TableCell>
                    <TableCell>{a.gravidade_acidente}</TableCell>
                    <TableCell>
                      <Badge variant={a.fatalidade === "FATAL" || a.fatalidade === "Fatal" ? "destructive" : "secondary"}>
                        {a.fatalidade}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.causas_imediatas_tasc}</TableCell>
                    <TableCell>{a.id_comunica_seguranca_eqtl}</TableCell>
                    <TableCell>{a.status_acidente}</TableCell>
                    <TableCell>{a.data_retorno ? formatDate(a.data_retorno) : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={a.situacao === "Ativo" ? "default" : "secondary"}>{a.situacao}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(a)} disabled={!canEdit}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={!canEdit}>Excluir</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(a.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
