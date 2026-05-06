import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import WorkersPage from '@/pages/Workers';
import TimeLogsPage from '@/pages/TimeLogs';
import SettingsPage from '@/pages/Settings';

function AppLayout() {
  const { user, signOut } = useAuth();

  const navLink = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium ${
          isActive ? 'bg-green-700 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-700">Ponto Home</span>
          </div>
          <div className="flex items-center gap-2">
            {navLink('/', 'Painel')}
            {navLink('/workers', 'Funcionarios')}
            {navLink('/time-logs', 'Registros')}
            {navLink('/settings', 'Configuracoes')}
            <button
              onClick={signOut}
              className="ml-4 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/time-logs" element={<TimeLogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
