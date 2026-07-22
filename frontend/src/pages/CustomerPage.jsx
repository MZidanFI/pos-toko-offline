import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import AppLayout from '../components/AppLayout';

const EMPTY_FORM = { nama: '', telepon: '' };

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers');
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setIsEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        await api.put(`/customers/${isEditing}`, formData);
      } else {
        await api.post('/customers', formData);
      }

      resetForm();
      fetchCustomers();
    } catch (err) {
      alert('Gagal memproses data: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (customer) => {
    setIsEditing(customer._id);
    setFormData({
      nama: customer.nama || '',
      telepon: customer.telepon || '',
    });
  };

  const deleteCustomer = async (customer) => {
    if (!confirm(`Hapus pelanggan "${customer.nama}"?`)) return;

    try {
      await api.delete(`/customers/${customer._id}`);
      fetchCustomers();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Manajemen</div>
        <h1>Data Pelanggan</h1>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>
          {isEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
              alignItems: 'end',
            }}
          >
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>Nama Pelanggan</label>
              <input
                placeholder="Masukkan nama pelanggan"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>No Telepon</label>
              <input
                placeholder="Masukkan no telepon"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: 'auto', height: 42, minWidth: 100 }}
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : isEditing ? 'Update' : 'Simpan'}
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ height: 42 }}
                  onClick={resetForm}
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">Belum ada data pelanggan.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Telepon</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600 }}>{c.nama}</td>
                  <td>{c.telepon || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-secondary" onClick={() => openEdit(c)}>
                        Edit
                      </button>
                      <button className="btn-danger" onClick={() => deleteCustomer(c)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};

export default CustomerPage;  