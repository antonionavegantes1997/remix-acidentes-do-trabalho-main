import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

async function fetchPrimaryRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error || !data?.length) return null;
  if (data.some((r: { role: string }) => r.role === "admin")) return "admin";
  if (data.some((r: { role: string }) => r.role === "gestor")) return "gestor";
  return null;
}

export type AppRole = "admin" | "gestor";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Perfil principal: admin se tiver papel de administrador, senão gestor se tiver, senão null */
  role: AppRole | null;
  isAdmin: boolean;
  canEdit: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  role: null,
  isAdmin: false,
  canEdit: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRole = async (userId: string | undefined) => {
      if (!userId) {
        setRole(null);
        return;
      }
      const r = await fetchPrimaryRole(userId);
      if (!cancelled) setRole(r);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        setSession(sess);
        setLoading(false);
        void loadRole(sess?.user?.id);
      }
    );

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setLoading(false);
      void loadRole(sess?.user?.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = role === "admin" || role === "gestor";
  const canEdit = role === "admin" || role === "gestor";

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        role,
        isAdmin,
        canEdit,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
