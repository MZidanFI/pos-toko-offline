import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ProdukPage from './pages/ProdukPage';
import KategoriPage from './pages/KategoriPage';
import SupplierPage from './pages/SupplierPage';
import Pos from './pages/Pos';
import RiwayatTransaksi from './pages/RiwayatTransaksi';
import DetailTransaksi from './pages/DetailTransaksi';
import StokPage from './pages/StokPage';
import CustomerPage from "./pages/CustomerPage";
import LaporanPage from './pages/LaporanPage';

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
          
          <Route
            path="/pos"
            element={
              <ProtectedRoute allowedRoles={['Kasir']}>
                <Pos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transaksi"
            element={
              <ProtectedRoute>
                <RiwayatTransaksi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaksi/:id"
            element={
              <ProtectedRoute>
                <DetailTransaksi />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stok"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <StokPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerPage />
              </ProtectedRoute>
            }
          />

          {/* Route Laporan Penjualan*/}
          <Route
            path="/laporan"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <LaporanPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}