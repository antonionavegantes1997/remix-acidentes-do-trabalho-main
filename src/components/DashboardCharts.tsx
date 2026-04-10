import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Acidente } from "@/hooks/use-acidentes";

const COLORS = [
  "hsl(210, 79%, 46%)", "hsl(0, 65%, 38%)", "hsl(38, 92%, 50%)",
  "hsl(145, 63%, 42%)", "hsl(280, 60%, 50%)", "hsl(330, 70%, 50%)",
  "hsl(180, 60%, 40%)",
];

interface Props {
  acidentes: Acidente[];
}

export default function DashboardCharts({ acidentes }: Props) {
  const porSexo = useMemo(() => {
    const map: Record<string, number> = {};
    acidentes.forEach(a => {
      const s = a.sexo || "Não informado";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));
  }, [acidentes]);

  const porDiaSemana = useMemo(() => {
    const dias = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "DOMINGO"];
    const map: Record<string, number> = {};
    dias.forEach(d => { map[d] = 0; });
    acidentes.forEach(a => {
      if (a.dia_semana && map[a.dia_semana] !== undefined) map[a.dia_semana]++;
      else if (a.dia_semana) map[a.dia_semana] = (map[a.dia_semana] || 0) + 1;
    });
    return Object.entries(map).map(([dia, total]) => ({ dia, total }));
  }, [acidentes]);

  const porHora = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hora: `${String(i).padStart(2, "0")}h`, total: 0 }));
    acidentes.forEach(a => {
      if (a.hora) {
        const h = parseInt(a.hora.substring(0, 2), 10);
        if (h >= 0 && h < 24) hours[h].total++;
      }
    });
    return hours;
  }, [acidentes]);

  const porStatus = useMemo(() => {
    const map: Record<string, number> = {};
    acidentes.forEach(a => {
      const s = a.status_acidente || "Não informado";
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));
  }, [acidentes]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Acidentes por Sexo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={porSexo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
                  {porSexo.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Acidentes por Dia da Semana</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={porDiaSemana}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dia" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(210, 79%, 46%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Acidentes por Hora</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={porHora}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hora" fontSize={10} interval={1} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Status Atual dos Acidentes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={porStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
                  {porStatus.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
