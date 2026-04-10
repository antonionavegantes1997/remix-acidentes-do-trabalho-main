import { useState } from "react";
import { Plus, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTreinamentos, useCreateTreinamento } from "@/hooks/use-treinamentos";
import { useAuth } from "@/contexts/AuthContext";

const mesesOptions = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function Treinamentos() {
  const { canEdit } = useAuth();
  const { data = [], isLoading } = useTreinamentos();
  const createMutation = useCreateTreinamento();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ mes: "", contrato: "", quantidade: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { mes: form.mes, contrato: form.contrato, quantidade: Number(form.quantidade) },
      {
        onSuccess: () => {
          setForm({ mes: "", contrato: "", quantidade: "" });
          setOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Horas de Treinamento</h1>
          <p className="text-sm text-muted-foreground">Registre as horas de treinamento por contrato</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1" disabled={!canEdit}>
              <Plus className="h-4 w-4" /> Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Horas de Treinamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Mês</Label>
                <Select value={form.mes} onValueChange={v => setForm({ ...form, mes: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o mês" /></SelectTrigger>
                  <SelectContent>
                    {mesesOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contrato">Contrato</Label>
                <Input id="contrato" required value={form.contrato} onChange={e => setForm({ ...form, contrato: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantidade">Quantidade (horas)</Label>
                <Input id="quantidade" type="number" min={0} required value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mb-3" />
              <p className="font-medium">Nenhum registro</p>
              <p className="text-sm">Adicione horas de treinamento clicando em "Novo Registro".</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Quantidade (h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.mes}</TableCell>
                    <TableCell>{t.contrato}</TableCell>
                    <TableCell>{t.quantidade}</TableCell>
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
