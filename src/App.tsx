import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BottomTabBar from "@/components/BottomTabBar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[100dvh] bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppLayout = () => {
  const location = useLocation();
  const showTabBar = !["/auth", "/reset-password"].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showTabBar && <BottomTabBar />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
