import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Bungkus route yang butuh login. Opsional: batasi role tertentu.
// Contoh: <ProtectedRoute allowedRoles={['Admin']}><UserManagement /></ProtectedRoute>
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="empty-state">Memuat...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="empty-state">
        Akses ditolak. Halaman ini khusus untuk role: {allowedRoles.join(', ')}.
      </div>
    );
  }

  return children;
}
