import { useMemo, useState } from "react";
import { Acidente } from "@/hooks/use-acidentes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComparativePyramidProps {
  acidentes: Acidente[];
  anoAtual: number;
  anoAnterior: number;
}

function calcStats(acidentes: Acidente[]) {
  const total = acidentes.length;
  const fatal = acidentes.filter(a => a.tipologia_acidente === "ACIDENTE FATAL").length;
  const caf = acidentes.filter(a => a.afastamento === "COM AFASTAMENTO" && a.tipologia_acidente !== "ACIDENTE FATAL").length;
  const saf = acidentes.filter(a => a.afastamento !== "COM AFASTAMENTO" && a.tipologia_acidente !== "ACIDENTE FATAL" && a.tipologia_acidente !== "ACIDENTE ATIPICO - PRIMEIROS SOCORROS").length;
  const primeirosSocorros = acidentes.filter(a => a.tipologia_acidente === "ACIDENTE ATIPICO - PRIMEIROS SOCORROS").length;
  return { total, fatal, caf, saf, primeirosSocorros };
}

const LAYERS = [
  { key: "fatal" as const, label: "FATAL", color: "#c0392b" },
  { key: "caf" as const, label: "CAF", color: "#e67e22" },
  { key: "saf" as const, label: "SAF", color: "#27ae60" },
  { key: "primeirosSocorros" as const, label: "1º SOCORROS - TRÂNSITO", color: "#f1c40f" },
  { key: "total" as const, label: "TOTAL", color: "#5dade2" },
];

export default function ComparativePyramid({ acidentes, anoAtual: initialAnoAtual, anoAnterior: initialAnoAnterior }: ComparativePyramidProps) {
  const anos = useMemo(() => {
    const set = new Set<number>();
    acidentes.forEach(a => set.add(new Date(a.data).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [acidentes]);

  const [anoAtual, setAnoAtual] = useState(initialAnoAtual);
  const [anoAnterior, setAnoAnterior] = useState(initialAnoAnterior);

  const statsAtual = useMemo(() => calcStats(acidentes.filter(a => new Date(a.data).getFullYear() === anoAtual)), [acidentes, anoAtual]);
  const statsAnterior = useMemo(() => calcStats(acidentes.filter(a => new Date(a.data).getFullYear() === anoAnterior)), [acidentes, anoAnterior]);

  const svgW = 600;
  const svgH = 340;
  const pyramidTop = 30;
  const pyramidBottom = 280;
  const pyramidH = pyramidBottom - pyramidTop;
  const centerX = svgW / 2;
  const topW = 50;
  const bottomW = 480;
  const n = LAYERS.length;

  const getLayerTrapezoid = (i: number) => {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const y0 = pyramidTop + t0 * pyramidH;
    const y1 = pyramidTop + t1 * pyramidH;
    const w0 = topW + t0 * (bottomW - topW);
    const w1 = topW + t1 * (bottomW - topW);
    return {
      y0, y1,
      leftTop: centerX - w0 / 2,
      rightTop: centerX + w0 / 2,
      leftBottom: centerX - w1 / 2,
      rightBottom: centerX + w1 / 2,
    };
  };

  return (
    <div className="flex flex-col items-center py-4">
      <h3 className="text-base font-bold text-foreground mb-1 tracking-wide">
        ACIDENTALIDADE - COMPARAÇÃO
      </h3>
      <div className="flex gap-3 mb-3">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Esquerda:</span>
          <Select value={String(anoAnterior)} onValueChange={v => setAnoAnterior(Number(v))}>
            <SelectTrigger className="w-[90px] h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Direita:</span>
          <Select value={String(anoAtual)} onValueChange={v => setAnoAtual(Number(v))}>
            <SelectTrigger className="w-[90px] h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-xl mx-auto">
        {LAYERS.map((layer, i) => {
          const t = getLayerTrapezoid(i);
          const valAnterior = statsAnterior[layer.key];
          const valAtual = statsAtual[layer.key];

          const frontLeftPath = `M${t.leftTop},${t.y0} L${centerX},${t.y0} L${centerX},${t.y1} L${t.leftBottom},${t.y1} Z`;
          const frontRightPath = `M${centerX},${t.y0} L${t.rightTop},${t.y0} L${t.rightBottom},${t.y1} L${centerX},${t.y1} Z`;

          const midY = (t.y0 + t.y1) / 2;
          const leftTextX = (t.leftTop + t.leftBottom) / 2 + (centerX - (t.leftTop + t.leftBottom) / 2) / 2;
          const rightTextX = centerX + (((t.rightTop + t.rightBottom) / 2) - centerX) / 2;

          const darken = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgb(${Math.round(r * 0.75)},${Math.round(g * 0.75)},${Math.round(b * 0.75)})`;
          };

          return (
            <g key={layer.key}>
              <path d={frontLeftPath} fill={darken(layer.color)} />
              <path d={frontRightPath} fill={layer.color} />
              <line x1={centerX} y1={t.y0} x2={centerX} y2={t.y1} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
              <text x={leftTextX} y={midY + 5} textAnchor="middle" fill="white" fontWeight="bold" fontSize={16}>
                {valAnterior}
              </text>
              <text x={rightTextX} y={midY + 5} textAnchor="middle" fill="white" fontWeight="bold" fontSize={16}>
                {valAtual}
              </text>
              <text x={t.rightBottom + 8} y={midY + 4} textAnchor="start" fill="currentColor" fontWeight="600" fontSize={11}>
                {layer.label}
              </text>
            </g>
          );
        })}

        {(() => {
          const last = getLayerTrapezoid(n - 1);
          const labelY = last.y1 + 22;
          const halfW = (last.rightBottom - last.leftBottom) / 2;
          return (
            <>
              <rect x={last.leftBottom} y={last.y1 + 4} width={halfW} height={24} rx={4} fill={LAYERS[n - 1].color} opacity={0.7} />
              <rect x={centerX} y={last.y1 + 4} width={halfW} height={24} rx={4} fill={LAYERS[n - 1].color} />
              <text x={(last.leftBottom + centerX) / 2} y={labelY} textAnchor="middle" fill="white" fontWeight="bold" fontSize={14}>
                {anoAnterior}
              </text>
              <text x={(centerX + last.rightBottom) / 2} y={labelY} textAnchor="middle" fill="white" fontWeight="bold" fontSize={14}>
                {anoAtual}
              </text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}
