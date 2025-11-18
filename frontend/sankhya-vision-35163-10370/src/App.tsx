import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TicketProvider } from "./contexts/TicketContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminMaster from "./pages/AdminMaster";
import PesquisaSatisfacao from "./pages/PesquisaSatisfacao";
import Index from "./pages/Index";
import Processos from "./pages/Processos";
import Solicitantes from "./pages/Solicitantes";
import Filtros from "./pages/Filtros";
import AnaliseAvancada from "./pages/AnaliseAvancada";
import ControleHoras from "./pages/ControleHoras";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CompanyProvider>
          <TooltipProvider>
            <TicketProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminMaster />
                  </ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requireRole="admin">
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/admin/processos" element={
                  <ProtectedRoute requireRole="admin">
                    <Processos />
                  </ProtectedRoute>
                } />
                <Route path="/admin/solicitantes" element={
                  <ProtectedRoute requireRole="admin">
                    <Solicitantes />
                  </ProtectedRoute>
                } />
                <Route path="/admin/filtros" element={
                  <ProtectedRoute requireRole="admin">
                    <Filtros />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analise-avancada" element={
                  <ProtectedRoute requireRole="admin">
                    <AnaliseAvancada />
                  </ProtectedRoute>
                } />
                <Route path="/admin/controle-horas" element={
                  <ProtectedRoute requireRole="admin">
                    <ControleHoras />
                  </ProtectedRoute>
                } />
                <Route path="/admin/faq" element={
                  <ProtectedRoute requireRole="admin">
                    <FAQ />
                  </ProtectedRoute>
                } />
                <Route path="/admin/pesquisa-satisfacao" element={
                  <ProtectedRoute requireRole="admin">
                    <PesquisaSatisfacao />
                  </ProtectedRoute>
                } />
                <Route path="/" element={
                  <ProtectedRoute requireRole="client">
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/processos" element={
                  <ProtectedRoute requireRole="client">
                    <Processos />
                  </ProtectedRoute>
                } />
                <Route path="/solicitantes" element={
                  <ProtectedRoute requireRole="client">
                    <Solicitantes />
                  </ProtectedRoute>
                } />
                <Route path="/filtros" element={
                  <ProtectedRoute requireRole="client">
                    <Filtros />
                  </ProtectedRoute>
                } />
                <Route path="/analise-avancada" element={
                  <ProtectedRoute requireRole="client">
                    <AnaliseAvancada />
                  </ProtectedRoute>
                } />
                <Route path="/controle-horas" element={
                  <ProtectedRoute requireRole="client">
                    <ControleHoras />
                  </ProtectedRoute>
                } />
                <Route path="/faq" element={
                  <ProtectedRoute requireRole="client">
                    <FAQ />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TicketProvider>
        </TooltipProvider>
        </CompanyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
