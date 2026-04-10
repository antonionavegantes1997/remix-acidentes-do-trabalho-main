import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { useAcidentes } from "@/hooks/use-acidentes";
import { toast } from "sonner";

function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) { toast.error("Nenhum dado para exportar."); return; }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(";"),
    ...data.map(row => headers.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(";")),
  ];
  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  toast.success("Relatório exportado!");
}

export default function Relatorios() {
  const { data = [], isLoading } = useAcidentes();

  const handleExportCSV = () => {
    const rows = data.map(a => ({
      "Nome da Empresa": a.nome_empresa,
      Chapa: a.chapa,
      Nome: a.nome,
      Cargo: a.cargo,
      Sexo: a.sexo,
      Idade: a.idade ?? "",
      Escolaridade: a.escolaridade,
      "Tempo na Empresa": a.tempo_empresa,
      "Tempo na Função": a.tempo_funcao,
      Rateio: a.rateio,
      Contrato: a.contrato,
      Regional: a.regional,
      Estado: a.estado,
      Data: a.data,
      Hora: a.hora || "",
      "Turno de Trabalho": a.turno_trabalho,
      "Dia da Semana": a.dia_semana,
      "Horas Trabalhadas": a.horas_trabalhadas,
      Município: a.municipio,
      Zona: a.zona,
      "Tipologia do Acidente": a.tipologia_acidente,
      "Tipo do Evento (TASC)": a.tipo_evento,
      "Origem / Fonte": a.origem_fonte,
      "Natureza Acidente": a.natureza_acidente,
      "Placa Veículo": a.placa_veiculo,
      Descrição: a.descricao,
      "Trânsito Responsabilidades": a.transito_responsabilidades,
      "Parte do Corpo Atingida": a.parte_corpo_atingida,
      "Subdivisão Parte do Corpo": a.subdivisao_parte_corpo,
      Afastamento: a.afastamento,
      
      "Dias Perdidos": a.dias_perdidos,
      "Dias Debitados": a.dias_debitados,
      "Nº CAT": a.numero_cat,
      "Gravidade da Lesão": a.gravidade_lesao,
      "Identificação da Lesão/Doença": a.identificacao_lesao,
      "Gravidade do Acidente": a.gravidade_acidente,
      "Tarefa Executada": a.tarefa_executada,
      
      "Causas Básicas (TASC)": a.causas_basicas_tasc,
      "Causas Básicas (TASC) 1": a.causas_basicas_tasc_1,
      "Causas Básicas (TASC) 2": a.causas_basicas_tasc_2,
      "Causas Imediatas (TASC)": a.causas_imediatas_tasc,
      "Nome do Gestor": a.nome_gestor,
      "Nome do Responsável": a.nome_responsavel,
      Fatalidade: a.fatalidade,
      "ID - Comunica Segurança EQTL": a.id_comunica_seguranca_eqtl,
      "Status Acidente": a.status_acidente,
      "Data Retorno": a.data_retorno || "",
      Situação: a.situacao,
    }));
    exportToCSV(rows, `relatorio_acidentes_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" /> Exportar Dados de Acidentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Exporte todos os registros em formato CSV compatível com Excel.</p>
          <Button onClick={handleExportCSV} disabled={isLoading || !data.length} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar CSV
          </Button>
          {!isLoading && <p className="text-xs text-muted-foreground">{data.length} registros disponíveis.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
