import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ProdukPage from './pages/ProdukPage';
import KategoriPage from './pages/KategoriPage';
import SupplierPage from './pages/SupplierPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/produk"
            element={
              <ProtectedRoute>
                <ProdukPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kategori"
            element={
              <ProtectedRoute>
                <KategoriPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/supplier"
            element={
              <ProtectedRoute>
                <SupplierPage />
              </ProtectedRoute>
            }
          />

          {/* Modul lain (Transaksi, Laporan) ditambahkan di sini oleh anggota tim lain */}

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
