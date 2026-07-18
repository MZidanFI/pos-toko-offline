import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'Kasir', phone: '' };

export default function UserManagement() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('Admin');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = mode tambah
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data karyawan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, phone: user.phone || '' });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, {
          name: form.name,
          role: form.role,
          phone: form.phone,
        });
      } else {
        await api.post('/users', form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user._id}/toggle-active`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Hapus karyawan "${user.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus karyawan');
    }
  };

  const badgeClassForRole = (role) => {
    if (role === 'Admin') return 'badge badge-admin';
    if (role === 'Manager') return 'badge badge-manager';
    return 'badge badge-kasir';
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Sumber Daya</div>
        <h1>Manajemen Karyawan</h1>
      </div>

      <div className="toolbar">
        <span style={{ color: 'var(--color-muted)', fontSize: '0.88rem' }}>
          {users.length} karyawan terdaftar
        </span>
        {isAdmin && (
          <button className="btn-primary" style={{ width: 'auto' }} onClick={openAddModal}>
            + Tambah Karyawan
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : users.length === 0 ? (
          <div className="empty-state">Belum ada karyawan. Tambahkan karyawan pertama.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                {isAdmin && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="mono" style={{ fontSize: '0.85rem' }}>{u.email}</td>
                  <td>
                    <span className={badgeClassForRole(u.role)}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="row-actions">
                        <button className="btn-secondary" onClick={() => openEditModal(u)}>
                          Edit
                        </button>
                        <button className="btn-secondary" onClick={() => handleToggleActive(u)}>
                          {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(u)}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>

            {formError && <div className="error-banner">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Nama</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!!editingUser}
                  required
                />
              </div>

              {!editingUser && (
                <div className="form-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-field" style={{ flex: 1 }}>
                  <label>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="Kasir">Kasir</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-field" style={{ flex: 1 }}>
                  <label>No. Telepon</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
