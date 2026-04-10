import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ResetSenha() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && new URLSearchParams(window.location.hash).get("type") === "recovery") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Senha inválida", description: "Use pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Senhas diferentes", description: "Confirme a mesma senha nos dois campos.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Senha atualizada", description: "Faça login com a nova senha." });
      await supabase.auth.signOut();
      navigate("/login");
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar a senha. Tente solicitar um novo link.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <img src="/cgb.png" alt="CGB" className="h-12 w-auto mx-auto object-contain" />
          <CardTitle className="text-xl">Nova senha</CardTitle>
          <CardDescription>
            {ready
              ? "Defina uma nova senha para sua conta."
              : "Carregando link de recuperação…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="np">Nova senha</Label>
              <Input
                id="np"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!ready}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="npc">Confirmar senha</Label>
              <Input
                id="npc"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={!ready}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !ready}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar nova senha
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/login")}>
              Voltar ao login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
