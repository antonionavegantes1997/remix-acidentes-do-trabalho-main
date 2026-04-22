import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Settings, Loader2, Users, Plus, Trash2, History, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PortalUserRow {
  role_row_id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: "admin" | "gestor";
}

interface AuditEntry {
  id: string;
  acidente_id: string;
  user_email: string;
  action: string;
  changes: Record<string, unknown>;
  created_at: string;
}

export default function Configuracoes() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<PortalUserRow[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "gestor">("gestor");
  const [creating, setCreating] = useState(false);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const errObj = error as Record<string, unknown>;
      if (typeof errObj.message === "string" && errObj.message.trim()) return errObj.message;
      if (typeof errObj.error === "string" && errObj.error.trim()) return errObj.error;
      if (typeof errObj.details === "string" && errObj.details.trim()) return errObj.details;
      return JSON.stringify(errObj);
    }
    return fallback;
  };

  const fetchData = async () => {
    if (!isAdmin) {
      setRows([]);
      setAuditLog([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: portal, error: e1 } = await (supabase.rpc as any)("list_portal_users_with_email");
      if (e1) throw e1;
      setRows((portal || []) as PortalUserRow[]);

      const { data: audit, error: e2 } = await supabase
        .from("acidentes_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (e2) throw e2;
      setAuditLog((audit || []) as AuditEntry[]);
    } catch (error: unknown) {
      console.error(error);
      toast.error(getErrorMessage(error, "Erro ao carregar configurações."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        r.display_name.toLowerCase().includes(q) ||
        String(r.role).toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleDeleteRole = async (roleId: string) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem remover permissões.");
      return;
    }
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) toast.error("Erro ao remover permissão.");
    else {
      toast.success("Permissão removida.");
      void fetchData();
    }
  };

  const handleSendReset = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-senha`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) toast.error(error.message);
    else toast.success("E-mail de redefinição de senha enviado.");
  };

  const handleCreateUser = async () => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem criar usuários.");
      return;
    }
    if (!newEmail.trim() || newPassword.length < 6) {
      toast.error("Informe e-mail e senha (mínimo 6 caracteres).");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-user", {
        body: {
          email: newEmail.trim(),
          password: newPassword,
          full_name: newName.trim(),
          role: newRole,
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Falha ao criar usuário.");
      toast.success("Usuário criado com sucesso.");
      setDialogOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewRole("gestor");
      void fetchData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao criar usuário.";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito a administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Usuários do portal e histórico do sistema</p>
        </div>
        
        <Button type="button" className="gap-1 shrink-0 w-full sm:w-auto" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Novo usuário
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Incluir novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nu-name">Nome completo</Label>
              <Input id="nu-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome exibido no portal" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nu-email">E-mail</Label>
              <Input id="nu-email" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nu-pass">Senha temporária</Label>
              <Input id="nu-pass" type="password" minLength={6} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as "admin" | "gestor")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => void handleCreateUser()} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Usuários do Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Input
              placeholder="Pesquisar por nome, e-mail ou perfil…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.role_row_id}>
                    <TableCell>
                      <div className="font-medium">{r.display_name || r.email.split("@")[0]}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.role === "admin" ? "default" : "outline"}>
                        {r.role === "admin" ? "Administrador" : "Gestor"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/15 text-primary border-0">Ativo</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Enviar e-mail para redefinir senha"
                          onClick={() => void handleSendReset(r.email)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title="Remover permissão deste portal"
                          disabled={r.user_id === user?.id}
                          onClick={() => void handleDeleteRole(r.role_row_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" /> Histórico de Modificações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            {/* ... restante do histórico permanece igual ... */}
            <TableBody>
              {auditLog.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(entry.created_at).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-xs">{entry.user_email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{entry.acidente_id.slice(0, 8)}…</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}