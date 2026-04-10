export interface Acidente {
  id: string;
  chapa: number;
  nome: string;
  rateio: string;
  data: string;
  descricao: string;
  diasAfastamento: number;
  numeroCat: string;
  tipo: "Típico" | "Trajeto" | "Sinistro de Trânsito" | "Primeiros Socorros";
  situacao: "Ativo" | "Finalizado";
}

export const acidentes: Acidente[] = [
  { id: "1", chapa: 10234, nome: "Carlos Silva", rateio: "Norte - PA", data: "2026-01-15", descricao: "Queda de altura", diasAfastamento: 12, numeroCat: "CAT-2026-001", tipo: "Típico", situacao: "Finalizado" },
  { id: "2", chapa: 10567, nome: "Maria Souza", rateio: "Sul - PR", data: "2026-02-03", descricao: "Colisão veicular", diasAfastamento: 30, numeroCat: "CAT-2026-002", tipo: "Sinistro de Trânsito", situacao: "Ativo" },
  { id: "3", chapa: 10891, nome: "João Pereira", rateio: "Sudeste - SP", data: "2026-02-20", descricao: "Corte superficial", diasAfastamento: 0, numeroCat: "", tipo: "Primeiros Socorros", situacao: "Finalizado" },
  { id: "4", chapa: 11023, nome: "Ana Costa", rateio: "Norte - PA", data: "2026-03-01", descricao: "Acidente no trajeto casa-trabalho", diasAfastamento: 7, numeroCat: "CAT-2026-003", tipo: "Trajeto", situacao: "Ativo" },
  { id: "5", chapa: 11200, nome: "Pedro Lima", rateio: "Centro-Oeste - MT", data: "2026-03-10", descricao: "Entorse no tornozelo", diasAfastamento: 5, numeroCat: "CAT-2026-004", tipo: "Típico", situacao: "Ativo" },
  { id: "6", chapa: 11345, nome: "Fernanda Dias", rateio: "Sul - PR", data: "2026-03-15", descricao: "Queimadura leve", diasAfastamento: 3, numeroCat: "", tipo: "Primeiros Socorros", situacao: "Finalizado" },
];

export const acidentesPorMes = [
  { mes: "Jan", total: 3 },
  { mes: "Fev", total: 5 },
  { mes: "Mar", total: 4 },
  { mes: "Abr", total: 2 },
  { mes: "Mai", total: 6 },
  { mes: "Jun", total: 3 },
  { mes: "Jul", total: 1 },
  { mes: "Ago", total: 4 },
  { mes: "Set", total: 2 },
  { mes: "Out", total: 5 },
  { mes: "Nov", total: 3 },
  { mes: "Dez", total: 2 },
];

export const tiposAcidente = [
  { tipo: "Típico", total: 15, fill: "hsl(0, 65%, 38%)" },
  { tipo: "Trajeto", total: 8, fill: "hsl(38, 92%, 50%)" },
  { tipo: "Sinistro de Trânsito", total: 5, fill: "hsl(210, 79%, 46%)" },
  { tipo: "Primeiros Socorros", total: 12, fill: "hsl(145, 63%, 42%)" },
];

export const regionais = ["Todas", "Norte - PA", "Sul - PR", "Sudeste - SP", "Centro-Oeste - MT"];
export const rateios = ["Todos", "Norte - PA", "Sul - PR", "Sudeste - SP", "Centro-Oeste - MT"];
export const meses = ["Todos", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const anos = ["2026", "2025", "2024"];