import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Acidentes from "@/pages/Acidentes";
import Acoes from "@/pages/Acoes";
import EtapasInvestigacao from "@/pages/EtapasInvestigacao";
import Treinamentos from "@/pages/Treinamentos";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import Login from "@/pages/Login";
import ResetSenha from "@/pages/ResetSenha";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-senha" element={<ResetSenha />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/acidentes" element={<Acidentes />} />
                      <Route path="/acoes" element={<Acoes />} />
                      <Route path="/etapas-investigacao" element={<EtapasInvestigacao />} />
                      <Route path="/treinamentos" element={<Treinamentos />} />
                      <Route path="/relatorios" element={<Relatorios />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
