import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { I18nProvider } from './lib/i18n';
import { ThemeProvider } from './lib/theme-provider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Payments from './pages/Payments';
import Apps from './pages/Apps';
import Support from './pages/Support';
import Admin from './pages/Admin';
import Translator from './pages/Translator';
import Tasks from './pages/Tasks';
import UpdateURL from './pages/UpdateURL';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="universatv-theme">
      <AuthProvider>
        <I18nProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/app" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="vendendo" element={<Messages />} />
                <Route path="tarefas" element={<Tasks />} />
                <Route path="pagamentos" element={<Payments />} />
                <Route path="apps" element={<Apps />} />
                <Route path="update-url" element={<UpdateURL />} />
                <Route path="suporte" element={<Support />} />
                <Route path="tradutor" element={<Translator />} />
                <Route path="admin" element={<Admin />} />
              </Route>

              <Route path="/" element={<Navigate to="/app" replace />} />
            </Routes>
          </HashRouter>
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
