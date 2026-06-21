import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import JournalPage from './pages/JournalPage';
import LoginPage from './pages/LoginPage';
import StatusPage from './pages/StatusPage';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/journal/:id" element={<JournalPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
