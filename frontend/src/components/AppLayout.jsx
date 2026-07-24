import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', roles: ['Admin', 'Manager', 'Kasir'] },
  { to: '/users', label: 'Manajemen Karyawan', roles: ['Admin', 'Manager'] },
  { to: '/produk', label: 'Produk', roles: ['Admin', 'Manager', 'Kasir'] },
  { to: '/kategori', label: 'Kategori', roles: ['Admin', 'Manager', 'Kasir'] },
  { to: '/supplier', label: 'Supplier', roles: ['Admin', 'Manager', 'Kasir'] },
  { to: '/laporan', label: 'Laporan', roles: ['Admin', 'Manager'] },
  { to: '/stok', label: 'Manajemen Stok', roles: ['Admin', 'Manager'] },
];

export default function AppLayout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          Kasirin <span>POS</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.filter((item) => hasRole(...item.roles)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            <span className="role-pill">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
