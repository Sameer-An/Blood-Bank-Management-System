import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './pages/SplashScreen';
import AuthPage from './pages/AuthPage';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to="/auth" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/auth" element={user ? <Navigate to={`/${user.role}`} /> : <AuthPage />} />
      <Route path="/donor" element={<ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>} />
      <Route path="/recipient" element={<ProtectedRoute role="recipient"><RecipientDashboard /></ProtectedRoute>} />
      <Route path="/bloodbank" element={<ProtectedRoute role="bloodbank"><BloodBankDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
