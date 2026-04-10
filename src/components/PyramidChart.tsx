import { useMemo } from "react";
import { Acidente } from "@/hooks/use-acidentes";

interface PyramidChartProps {
  acidentes: Acidente[];
}

export default function PyramidChart({ acidentes }: PyramidChartProps) {
  const stats = useMemo(() => {
    const total = acidentes.length;
    const fatal = acidentes.filter(a => a.tipologia_acidente === "ACIDENTE FATAL").length;
    const caf = acidentes.filter(a => a.afastamento === "COM AFASTAMENTO" && a.tipologia_acidente !== "ACIDENTE FATAL").length;
    const saf = acidentes.filter(a => a.afastamento !== "COM AFASTAMENTO" && a.tipologia_acidente !== "ACIDENTE FATAL" && a.tipologia_acidente !== "ACIDENTE ATIPICO - PRIMEIROS SOCORROS").length;
    const primeirosSocorros = acidentes.filter(a => a.tipologia_acidente === "ACIDENTE ATIPICO - PRIMEIROS SOCORROS").length;
    return { total, fatal, caf, saf, primeirosSocorros };
  }, [acidentes]);

  const layers = [
    { label: "FATAL", value: stats.fatal, color: "hsl(0, 65%, 50%)", width: "20%" },
    { label: "CAF", value: stats.caf, color: "hsl(25, 85%, 55%)", width: "40%" },
    { label: "SAF", value: stats.saf, color: "hsl(145, 55%, 48%)", width: "60%" },
    { label: "1º SOCORROS", value: stats.primeirosSocorros, color: "hsl(48, 90%, 55%)", width: "80%" },
    { label: "TOTAL", value: stats.total, color: "hsl(210, 65%, 50%)", width: "100%" },
  ];

  return (
    <div className="flex flex-col items-center gap-0 py-4">
      <h3 className="text-base font-semibold text-foreground mb-4">ACIDENTALIDADE {new Date().getFullYear()}</h3>
      <div className="flex flex-col items-center gap-1 w-full max-w-md">
        {layers.map((layer, i) => (
          <div key={layer.label} className="flex items-center w-full gap-3">
            <div className="flex-1 flex justify-center">
              <div
                className="flex items-center justify-center py-2.5 text-white font-bold text-sm rounded-sm transition-all"
                style={{
                  backgroundColor: layer.color,
                  width: layer.width,
                  clipPath: i < layers.length - 1
                    ? "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)"
                    : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                }}
              >
                {layer.value}
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground w-28 text-left">
              {layer.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
