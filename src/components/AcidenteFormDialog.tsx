import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CONTRATO_OPTIONS } from "@/lib/contrato-options";
import { cidOptions } from "@/lib/cid-options";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Acidente, AcidenteInput } from "@/hooks/use-acidentes";
import { CAUSAS_BASICAS_FATORES_PESSOAIS, CAUSAS_BASICAS_FATORES_SISTEMA } from "@/lib/causas-basicas-options";

const TURNO_OPTIONS = ["MANHÃ", "INTERVALO ALMOÇO", "TARDE", "NOITE"];
const DIA_SEMANA_OPTIONS = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
const ZONA_OPTIONS = ["URBANA", "RURAL"];
const TIPOLOGIA_OPTIONS = [
  "ACIDENTE FATAL",
  "ACIDENTE COM POPULACAO",
  "DOENCA PROFISSIONAL / DO TRABALHO",
  "ACIDENTE TIPICO",
  "ACIDENTE ATIPICO - TRAJETO",
  "ACIDENTE ATIPICO - IMPESSOAL",
  "ACIDENTE ATIPICO - SEM LESAO",
  "ACIDENTE ATIPICO - DANOS MATERIAIS",
  "ACIDENTE ATIPICO - PRIMEIROS SOCORROS",
];
const TIPO_EVENTO_OPTIONS = [
  "1. Golpeado contra/Em (Correndo, Colidindo, Batendo, Soterramento)",
  "2. Golpeado por (Atingido por Objeto em Movimento)",
  "3. Queda em Altura (Pessoa, equipamento ou material)",
  "4. Queda no Mesmo Nível (Escorregão e Queda, Tropeção)",
  "5. Pego (Agarrado, Apertado), Pego (Bloqueado, Suspenso), Pego Entre ou Sob (Esmagado, Amputado)",
  "6. Contato com Temperaturas Extremas (Calor e Frio)",
  "7. Contato com Eletricidade",
  "8. Exposição ao ruído",
  "9. Exposição a Vibrações",
  "10. Exposição a Radiações Ionizantes",
  "11. Estresse físico excessivo (por sobrecarga de trabalho/pressão excessiva)",
  "12. Contato com Substâncias Perigosas (Tóxicas/Corrosivas/Carcinogênicas/Biológicas/Virais)",
  "13. Perda de Contenção Primária",
  "14. Liberação ambiental (no Ar/Água/Solo/Estrutura)",
  "15. Incêndio (BLEVE/Jato de fogo/Bola de fogo)",
  "16. Explosão (Nuvem de vapor/Poeira/Pressão de ruptura/BLEVE)",
  "17. Falha de equipamento mecânico",
  "18. Falha de sistema elétrico",
  "19. Falha de instrumentação/lógica/circuito",
  "20. Falha da estrutura civil",
  "21. Operações Anormais / Distúrbios no processo",
  "22. Embalo de reação",
  "23. Reclamações de partes interessadas/clientes",
  "24. Ato de violência",
];
const AFASTAMENTO_OPTIONS = ["COM AFASTAMENTO", "SEM AFASTAMENTO"];
const GRAVIDADE_LESAO_OPTIONS = ["FATAL", "GRAVE", "MODERADA", "LEVE", "ALTO POTENCIAL", "SEM LESÃO", "PRIMEIROS SOCORROS"];
const GRAVIDADE_ACIDENTE_OPTIONS = ["GRAVE", "LEVE"];
const SEXO_OPTIONS = ["MASCULINO", "FEMININO"];
const STATUS_OPTIONS = ["AFASTADO", "TRATAMENTO MÉDICO", "DESLOCADO PARA ATIVIDADE COMPATÍVEL", "JÁ RETORNOU AS ATIVIDADES", "NÃO AFASTADO"];
const FATALIDADE_OPTIONS = ["FATAL", "NÃO"];

const NATUREZA_ACIDENTE_OPTIONS = [
  "Escoriação, abrasão (atrito)",
  "Amputação ou enucleação",
  "Asfixia, estrangulamento, afogamento",
  "Queimadura",
  "Concussão cerebral",
  "Contusão, esmagamento",
  "Corte, laceração, ferida contusa",
  "Dermatite",
  "Luxação",
  "Efeito de radiação",
  "Eletrocussão, choque elétrico",
  "Envenenamento ou intoxicação",
  "Fratura",
  "Hérnia",
  "Inflamação de articulação, tendão ou músculo",
  "Lumbago (Lombalgia)",
  "Pneumoconiose",
  "Perda de audição",
];

const ORIGEM_FONTE_OPTIONS = [
  "ATINGIDO POR OBJETO: quando objeto em movimento atinge o colaborador",
  "BATIDA CONTRA: quando o colaborador em movimento atinge um objeto",
  "ELÉTRICA (POR CONTATO, INDUÇÃO OU ARCO ELÉTRICO): quando ocorrer um choque elétrico por contato ou por indução ou queimaduras por arco elétrico",
  "PROVOCADO POR SERES VIVOS (ANIMAIS, PESSOAS, ETC.): quando o ofensor for um ser vivo de categoria animal",
  "QUEDA DE DIF. DE NÍVEL < 2 m: Caracteriza-se pelo deslocamento vertical não intencional de um indivíduo de uma superfície elevada para uma inferior, quando a diferença de altura é menor que dois metros",
  "QUEDA DE DIF. DE NÍVEL ≥ 2 m: Descreve o deslocamento vertical não intencional de um indivíduo de uma superfície elevada para uma inferior, com uma diferença de altura igual ou superior a dois metros",
  "QUEDA DE MESMO NÍVEL: Refere-se à perda de equilíbrio e contato do corpo com o solo ou superfície de apoio, ocorrendo no mesmo plano horizontal, sem variação de altura do ponto de apoio inicial",
  "REAÇÃO DO CORPO AO MOVIMENTO: Lesão ou evento causado pela própria movimentação ou resposta corporal",
  "TRÂNSITO DUAS RODAS: Acidente de trânsito envolvendo veículos como motocicletas ou bicicletas",
  "TRÂNSITO QUATRO RODAS: Acidente de trânsito envolvendo veículos como carros, caminhões ou ônibus",
];

const TRANSITO_RESP_OPTIONS = [
  "CAUSA ATIVA: responsabilidade do colaborador (próprio ou parceiro)",
  "CAUSA PASSIVA: a responsabilidade não é do colaborador (próprio ou parceiro), mas de um terceiro",
  "NÃO SE APLICA: utilizado quando não for sinistro de trânsito",
];

const PARTE_CORPO_OPTIONS = [
  "Cabeça (face, crânio, pescoço, nuca, olhos, boca, nariz, ouvidos)",
  "Tronco (tórax, abdome, pelve, dorso, região glútea)",
  "Membros superiores (ombros, braços, cotovelo, antebraços, punhos, mãos)",
  "Membros inferiores (coxas, joelhos, pernas, tornozelos e pés)",
];

const SUBDIVISAO_MAP: Record<string, string[]> = {
  "Cabeça (face, crânio, pescoço, nuca, olhos, boca, nariz, ouvidos)": ["face", "crânio", "pescoço", "nuca", "olhos", "boca", "nariz", "ouvidos"],
  "Tronco (tórax, abdome, pelve, dorso, região glútea)": ["tórax", "abdome", "pelve", "dorso", "região glútea"],
  "Membros superiores (ombros, braços, cotovelo, antebraços, punhos, mãos)": ["ombros", "braços", "cotovelo", "antebraços", "punhos", "mãos"],
  "Membros inferiores (coxas, joelhos, pernas, tornozelos e pés)": ["coxas", "joelhos", "pernas", "tornozelos", "pés"],
};

const CAUSAS_IMEDIATAS_ATOS = [
  "1. Operação de Equipamento sem Autorização",
  "2. Falha de Advertência/Aviso",
  "3. Falha em Assegurar",
  "4. Operação em Velocidade Inadequada",
  "5. Desativar Dispositivos Críticos de Segurança",
  "6. Utilização de Equipamentos/Ferramentas/Máquinas/Dispositivos Defeituosos",
  "7. Operação Inadequada de Ferramentas/Equipamentos/Máquinas/Dispositivos",
  "8. Equipamentos de Serviço / Máquinas em operação inadequadas",
  "9. Uso de Material Incorreto/Inadequado",
  "10. Falha no uso de EPIs",
  "11. Carregamento Inadequado",
  "12. Localização / Colocação Inadequada",
  "13. Levantamento / Igamento Inadequado",
  "14. Posição Inadequada para a Tarefa",
  "15. Comportamento Inadequado/Impróprio",
  "16. Sob Influência de Remédios/Álcool/Drogas",
  "17. Falha no Cumprimento com os Procedimentos/Instruções",
  "18. Falha ao Identificar Perigos",
  "19. Ações de Partes Externas Abaixo do Padrão (fora de controle)",
  "20. Falha ao Identificar Requisitos de Clientes/Partes Interessadas",
  "21. Falha ao Cumprir com Requisitos de Clientes/Partes Interessadas",
  "22. Perturbações da Ordem Pública (Tumultos, Manifestações, Guerra)",
  "23. Atividades criminosas",
];

const CAUSAS_IMEDIATAS_CONDICOES = [
  "24. Condições de Solo/Superfície Inadequadas",
  "25. Ferramenta ou Equipamento Defeituoso",
  "26. Ferramenta ou Equipamento Incorreto/Inadequado",
  "27. Integridade do Equipamento Inadequada",
  "28. Falha em Detectar/Medir",
  "29. Medição/Conversão de Sinal Imprópria",
  "30. Materiais Incorretos",
  "31. Composição de Material/Gases Incorreta",
  "32. Proteção/Barreira Inadequada",
  "33. EPI Inadequado/Impróprio",
  "34. Espaço para Ação Congestionado/Restrito",
  "35. Sistema de Alerta Inadequado",
  "36. Presença de Atmosfera Inflamável/explosiva",
  "37. Presença Não Autorizada de Materiais Perigosos",
  "38. Desordem/Falta de Organização, Arrumação e Limpeza",
  "39. Nível de Ruído acima do Limite de Tolerância",
  "40. Perigo de Radiação acima do Limite de Tolerância",
  "41. Iluminação Excessiva/Insuficiente",
  "42. Vibração acima do Limite de Tolerância",
  "43. Exposição a Temperaturas Elevadas",
  "44. Exposição a Temperaturas Baixas",
  "45. Pressão fora dos Limites de Tolerância",
  "46. Ventilação Inadequada",
  "47. Informação Inadequada",
  "48. Exposição à Condições Meteorológicas Adversas",
];

const emptyForm: Record<string, string> = {
  nome_empresa: "", chapa: "", nome: "", cargo: "", sexo: "", idade: "",
  escolaridade: "", tempo_empresa: "", tempo_funcao: "", rateio: "", contrato: "",
  regional: "", estado: "", data: "", hora: "", turno_trabalho: "", dia_semana: "",
  horas_trabalhadas: "", municipio: "", zona: "", tipologia_acidente: "",
  natureza_acidente: "", placa_veiculo: "", descricao: "", afastamento: "",
  dias_perdidos: "", dias_debitados: "", numero_cat: "",
  gravidade_lesao: "", identificacao_lesao: "", gravidade_acidente: "",
  tarefa_executada: "", tipo_evento: "",
  causas_basicas_tasc: "", causas_basicas_tasc_1: "", causas_basicas_tasc_2: "",
  causas_imediatas_tasc: "", causas_imediatas_tasc_1: "", causas_imediatas_tasc_2: "",
  nome_gestor: "", nome_responsavel: "", fatalidade: "",
  status_acidente: "", data_retorno: "", origem_fonte: "", id_comunica_seguranca_eqtl: "",
  transito_responsabilidades: "", parte_corpo_atingida: "", subdivisao_parte_corpo: "",
  cid: "",
};

function acidenteToForm(a: Acidente): Record<string, string> {
  return {
    nome_empresa: a.nome_empresa || "", chapa: String(a.chapa), nome: a.nome, cargo: a.cargo || "",
    sexo: a.sexo, idade: a.idade != null ? String(a.idade) : "", escolaridade: a.escolaridade || "",
    tempo_empresa: a.tempo_empresa || "", tempo_funcao: a.tempo_funcao || "", rateio: a.rateio,
    contrato: a.contrato, regional: a.regional || "", estado: a.estado || "", data: a.data,
    hora: a.hora || "", turno_trabalho: a.turno_trabalho || "", dia_semana: a.dia_semana,
    horas_trabalhadas: a.horas_trabalhadas || "", municipio: a.municipio, zona: a.zona,
    tipologia_acidente: a.tipologia_acidente || "", natureza_acidente: a.natureza_acidente,
    placa_veiculo: a.placa_veiculo, descricao: a.descricao, afastamento: a.afastamento || "",
    dias_perdidos: String(a.dias_perdidos),
    dias_debitados: String(a.dias_debitados), numero_cat: a.numero_cat,
    gravidade_lesao: a.gravidade_lesao || "", identificacao_lesao: a.identificacao_lesao || "",
    gravidade_acidente: a.gravidade_acidente || "", tarefa_executada: a.tarefa_executada || "",
    tipo_evento: a.tipo_evento,
    causas_basicas_tasc: a.causas_basicas_tasc || "",
    causas_basicas_tasc_1: a.causas_basicas_tasc_1 || "",
    causas_basicas_tasc_2: a.causas_basicas_tasc_2 || "",
    causas_imediatas_tasc: a.causas_imediatas_tasc || "",
    causas_imediatas_tasc_1: (a as any).causas_imediatas_tasc_1 || "",
    causas_imediatas_tasc_2: (a as any).causas_imediatas_tasc_2 || "",
    nome_gestor: a.nome_gestor || "", nome_responsavel: a.nome_responsavel || "",
    fatalidade: a.fatalidade, status_acidente: a.status_acidente,
    data_retorno: a.data_retorno || "",
    origem_fonte: a.origem_fonte || "",
    id_comunica_seguranca_eqtl: a.id_comunica_seguranca_eqtl || "",
    transito_responsabilidades: a.transito_responsabilidades || "",
    parte_corpo_atingida: a.parte_corpo_atingida || "",
    subdivisao_parte_corpo: a.subdivisao_parte_corpo || "",
    cid: (a as any).cid || "",
  };
}

function formToInput(f: Record<string, string>): AcidenteInput {
  return {
    nome_empresa: f.nome_empresa, chapa: Number(f.chapa) || 0, nome: f.nome, cargo: f.cargo,
    sexo: f.sexo, idade: f.idade ? Number(f.idade) : null, escolaridade: f.escolaridade,
    tempo_empresa: f.tempo_empresa, tempo_funcao: f.tempo_funcao, rateio: f.rateio,
    contrato: f.contrato, regional: f.regional, estado: f.estado, data: f.data,
    hora: f.hora || null, turno_trabalho: f.turno_trabalho, dia_semana: f.dia_semana,
    horas_trabalhadas: f.horas_trabalhadas, municipio: f.municipio, zona: f.zona,
    tipologia_acidente: f.tipologia_acidente, natureza_acidente: f.natureza_acidente,
    placa_veiculo: f.placa_veiculo, descricao: f.descricao, afastamento: f.afastamento,
    dias_perdidos: Number(f.dias_perdidos) || 0,
    dias_debitados: Number(f.dias_debitados) || 0, numero_cat: f.numero_cat,
    gravidade_lesao: f.gravidade_lesao, identificacao_lesao: f.identificacao_lesao,
    gravidade_acidente: f.gravidade_acidente, tarefa_executada: f.tarefa_executada,
    tipo_evento: f.tipo_evento,
    causas_basicas_tasc: f.causas_basicas_tasc,
    causas_basicas_tasc_1: f.causas_basicas_tasc_1,
    causas_basicas_tasc_2: f.causas_basicas_tasc_2,
    causas_imediatas_tasc: f.causas_imediatas_tasc,
    causas_imediatas_tasc_1: f.causas_imediatas_tasc_1,
    causas_imediatas_tasc_2: f.causas_imediatas_tasc_2,
    nome_gestor: f.nome_gestor, nome_responsavel: f.nome_responsavel,
    fatalidade: f.fatalidade, status_acidente: f.status_acidente,
    data_retorno: f.data_retorno || null,
    origem_fonte: f.origem_fonte, id_comunica_seguranca_eqtl: f.id_comunica_seguranca_eqtl,
    transito_responsabilidades: f.transito_responsabilidades,
    parte_corpo_atingida: f.parte_corpo_atingida, subdivisao_parte_corpo: f.subdivisao_parte_corpo,
    cid: f.cid,
  } as any;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Acidente | null;
  onSubmit: (data: AcidenteInput, id?: string) => void;
  isPending: boolean;
}

function SelectField({ label, value, onChange, options, placeholder = "Selecione", className = "", labelClassName = "" }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; className?: string; labelClassName?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className={labelClassName}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function MultiSelectField({ label, value, onChange, options, placeholder = "Selecione", className = "", labelClassName = "" }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; className?: string; labelClassName?: string;
}) {
  const selectedValues = value ? value.split(",").filter(Boolean) : [];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className={labelClassName}>{label}</Label>
      <select
        multiple
        size={Math.min(options.length, 4)}
        className="w-full max-h-36 min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        value={selectedValues}
        onChange={e => {
          const selected = Array.from(e.target.selectedOptions).map(option => option.value);
          onChange(selected.join(","));
        }}
      >
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function TextField({ label, id, value, onChange, type = "text", required = false, className = "", labelClassName = "" }: {
  label: string; id: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; className?: string; labelClassName?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className={labelClassName}>{label}</Label>
      <Input id={id} type={type} required={required} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function GroupedCausasImediatasSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="font-bold text-primary">ATOS ABAIXO DO PADRÃO</SelectLabel>
            {CAUSAS_IMEDIATAS_ATOS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel className="font-bold text-primary">CONDIÇÕES ABAIXO DO PADRÃO</SelectLabel>
            {CAUSAS_IMEDIATAS_CONDICOES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function GroupedCausasBasicasSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="font-bold text-primary">{CAUSAS_BASICAS_FATORES_PESSOAIS.label}</SelectLabel>
            {CAUSAS_BASICAS_FATORES_PESSOAIS.groups.map(g => (
              <SelectGroup key={g.label}>
                <SelectLabel className="font-semibold text-xs pl-4">{g.label}</SelectLabel>
                {g.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectGroup>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel className="font-bold text-primary">{CAUSAS_BASICAS_FATORES_SISTEMA.label}</SelectLabel>
            {CAUSAS_BASICAS_FATORES_SISTEMA.groups.map(g => (
              <SelectGroup key={g.label}>
                <SelectLabel className="font-semibold text-xs pl-4">{g.label}</SelectLabel>
                {g.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectGroup>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function AcidenteFormDialog({ open, onOpenChange, editing, onSubmit, isPending }: Props) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(editing ? acidenteToForm(editing) : { ...emptyForm });
    }
  }, [open, editing]);

  const set = (key: string) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));

  const subdivisaoOptions = SUBDIVISAO_MAP[form.parte_corpo_atingida] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formToInput(form), editing?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Acidente" : "Registrar Novo Acidente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Empresa e Identificação */}
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Nome da Empresa" id="nome_empresa" value={form.nome_empresa} onChange={set("nome_empresa")} />
            <TextField label="Chapa" id="chapa" value={form.chapa} onChange={set("chapa")} type="number" required />
            <TextField label="Nome" id="nome" value={form.nome} onChange={set("nome")} required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Cargo" id="cargo" value={form.cargo} onChange={set("cargo")} />
            <SelectField label="Sexo" value={form.sexo} onChange={set("sexo")} options={SEXO_OPTIONS} />
            <TextField label="Idade" id="idade" value={form.idade} onChange={set("idade")} type="number" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Escolaridade" id="escolaridade" value={form.escolaridade} onChange={set("escolaridade")} />
            <TextField label="Tempo na Empresa" id="tempo_empresa" value={form.tempo_empresa} onChange={set("tempo_empresa")} />
            <TextField label="Tempo na Função" id="tempo_funcao" value={form.tempo_funcao} onChange={set("tempo_funcao")} />
          </div>

          {/* Localização */}
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Rateio" id="rateio" value={form.rateio} onChange={set("rateio")} required />
            <SelectField label="Contrato" value={form.contrato} onChange={set("contrato")} options={CONTRATO_OPTIONS} />
            <TextField label="Regional" id="regional" value={form.regional} onChange={set("regional")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <TextField label="Estado" id="estado" value={form.estado} onChange={set("estado")} />
            <TextField label="Município" id="municipio" value={form.municipio} onChange={set("municipio")} />
            <SelectField label="Zona" value={form.zona} onChange={set("zona")} options={ZONA_OPTIONS} />
          </div>

          {/* Data/Hora */}
          <div className="grid grid-cols-4 gap-3">
            <TextField label="Data" id="data" value={form.data} onChange={set("data")} type="date" required />
            <TextField label="Hora" id="hora" value={form.hora} onChange={set("hora")} type="time" />
            <SelectField label="Turno de Trabalho" value={form.turno_trabalho} onChange={set("turno_trabalho")} options={TURNO_OPTIONS} />
            <SelectField label="Dia da Semana" value={form.dia_semana} onChange={set("dia_semana")} options={DIA_SEMANA_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Horas Trabalhadas" id="horas_trabalhadas" value={form.horas_trabalhadas} onChange={set("horas_trabalhadas")} />
          </div>

          {/* Classificação do Acidente */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Tipologia (NP077)" value={form.tipologia_acidente} onChange={set("tipologia_acidente")} options={TIPOLOGIA_OPTIONS} />
            <SelectField label="Tipo do Evento (TASC)" value={form.tipo_evento} onChange={set("tipo_evento")} options={TIPO_EVENTO_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Natureza do Acidente (NBR14280)" value={form.natureza_acidente} onChange={set("natureza_acidente")} options={NATUREZA_ACIDENTE_OPTIONS} />
            <TextField label="Placa do Veículo" id="placa" value={form.placa_veiculo} onChange={set("placa_veiculo")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Origem/Fonte (NP077)" value={form.origem_fonte} onChange={set("origem_fonte")} options={ORIGEM_FONTE_OPTIONS} />
            <TextField label="ID - Comunica Segurança EQTL" id="id_comunica" value={form.id_comunica_seguranca_eqtl} onChange={set("id_comunica_seguranca_eqtl")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Trânsito Responsabilidades (NP077)" value={form.transito_responsabilidades} onChange={set("transito_responsabilidades")} options={TRANSITO_RESP_OPTIONS} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={form.descricao} onChange={e => set("descricao")(e.target.value)} />
          </div>

          {/* Parte do Corpo */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Parte do Corpo Atingida (NBR14280)" value={form.parte_corpo_atingida} onChange={(v) => { set("parte_corpo_atingida")(v); set("subdivisao_parte_corpo")(""); }} options={PARTE_CORPO_OPTIONS} />
            <MultiSelectField label="Subdivisão Parte do Corpo (NBR14280)" value={form.subdivisao_parte_corpo} onChange={set("subdivisao_parte_corpo")} options={subdivisaoOptions} placeholder={subdivisaoOptions.length ? "Selecione" : "Selecione parte do corpo primeiro"} />
          </div>

          {/* Afastamento e Gravidade */}
          <div className="grid grid-cols-3 gap-3">
            <SelectField label="Afastamento" value={form.afastamento} onChange={set("afastamento")} options={AFASTAMENTO_OPTIONS} />
            <TextField label="Dias Perdidos" id="dias_perdidos" value={form.dias_perdidos} onChange={set("dias_perdidos")} type="number" />
            <TextField label="Dias Debitados" id="dias_debitados" value={form.dias_debitados} onChange={set("dias_debitados")} type="number" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <TextField label="Nº CAT" id="cat" value={form.numero_cat} onChange={set("numero_cat")} className="md:col-span-3" />
            <SelectField label="Gravidade da Lesão (NP077)" value={form.gravidade_lesao} onChange={set("gravidade_lesao")} options={GRAVIDADE_LESAO_OPTIONS} className="md:col-span-4" />
            <SelectField label="Gravidade do Acidente (NP077)" value={form.gravidade_acidente} onChange={set("gravidade_acidente")} options={GRAVIDADE_ACIDENTE_OPTIONS} className="md:col-span-5" labelClassName="whitespace-nowrap" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Identificação da Lesão/Doença" id="id_lesao" value={form.identificacao_lesao} onChange={set("identificacao_lesao")} />
            <SelectField label="Fatalidade" value={form.fatalidade} onChange={set("fatalidade")} options={FATALIDADE_OPTIONS} />
          </div>

          {/* CID */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="CID" value={form.cid} onChange={set("cid")} options={cidOptions} />
          </div>

          {/* Investigação */}
          <div className="grid grid-cols-1 gap-3">
            <TextField label="Tarefa Executada" id="tarefa" value={form.tarefa_executada} onChange={set("tarefa_executada")} />
          </div>

          {/* Causas Imediatas TASC - 3 columns */}
          <div className="grid grid-cols-3 gap-3">
            <GroupedCausasImediatasSelect label="Causas Imediatas (TASC)" value={form.causas_imediatas_tasc} onChange={set("causas_imediatas_tasc")} />
            <GroupedCausasImediatasSelect label="Causas Imediatas (TASC) 1" value={form.causas_imediatas_tasc_1} onChange={set("causas_imediatas_tasc_1")} />
            <GroupedCausasImediatasSelect label="Causas Imediatas (TASC) 2" value={form.causas_imediatas_tasc_2} onChange={set("causas_imediatas_tasc_2")} />
          </div>

          {/* Causas Básicas TASC - 3 columns with grouped selects */}
          <div className="grid grid-cols-3 gap-3">
            <GroupedCausasBasicasSelect label="Causas Básicas (TASC)" value={form.causas_basicas_tasc} onChange={set("causas_basicas_tasc")} />
            <GroupedCausasBasicasSelect label="Causas Básicas (TASC) 1" value={form.causas_basicas_tasc_1} onChange={set("causas_basicas_tasc_1")} />
            <GroupedCausasBasicasSelect label="Causas Básicas (TASC) 2" value={form.causas_basicas_tasc_2} onChange={set("causas_basicas_tasc_2")} />
          </div>

          {/* Responsáveis e Status */}
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Gerência" id="gestor" value={form.nome_gestor} onChange={set("nome_gestor")} />
            <TextField label="Líder" id="responsavel" value={form.nome_responsavel} onChange={set("nome_responsavel")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Status do Acidentado" value={form.status_acidente} onChange={set("status_acidente")} options={STATUS_OPTIONS} />
            <TextField label="Data de Retorno" id="data_retorno" value={form.data_retorno} onChange={set("data_retorno")} type="date" />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {editing ? "Atualizar" : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
