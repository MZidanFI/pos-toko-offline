import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import AppLayout from '../components/AppLayout';

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ nama: '', telepon: '' });
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/customers/${isEditing}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setFormData({ nama: '', telepon: '' });
      setIsEditing(null);
      fetchCustomers();
    } catch (err) {
      alert('Gagal memproses data: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const deleteCustomer = async (id) => {
    if (confirm('Yakin ingin menghapus pelanggan ini?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (err) {
        alert('Gagal menghapus data');
      }
    }
  };

  // Gaya Tombol
  const btnStyle = {
    padding: '6px 16px',
    borderRadius: '4px',
    border: '1px solid',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginRight: '8px'
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Manajemen</div>
        <h1>Data Pelanggan</h1>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3>{isEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
          <input 
            className="input-field"
            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, flex: 1 }}
            placeholder="Nama Pelanggan" 
            value={formData.nama} 
            onChange={e => setFormData({...formData, nama: e.target.value})} 
            required 
          />
          <input 
            className="input-field" 
            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, flex: 1 }}
            placeholder="No Telepon" 
            value={formData.telepon} 
            onChange={e => setFormData({...formData, telepon: e.target.value})} 
          />
          <button 
            type="submit" 
            style={{ padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: 4, border: 'none', cursor: 'pointer' }}
          >
            {isEditing ? 'Update' : 'Simpan'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ padding: 16, fontSize: '0.75rem', letterSpacing: '0.05em', color: '#666' }}>NAMA</th>
              <th style={{ padding: 16, fontSize: '0.75rem', letterSpacing: '0.05em', color: '#666' }}>TELEPON</th>
              <th style={{ padding: 16, fontSize: '0.75rem', letterSpacing: '0.05em', color: '#666' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 16 }}>{c.nama}</td>
                <td style={{ padding: 16 }}>{c.telepon || '-'}</td>
                <td style={{ padding: 16 }}>
                  <button 
                    onClick={() => { setIsEditing(c._id); setFormData({nama: c.nama, telepon: c.telepon}); }} 
                    style={{ ...btnStyle, borderColor: '#1a4d2e', color: '#1a4d2e' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteCustomer(c._id)} 
                    style={{ ...btnStyle, borderColor: '#d9534f', color: '#d9534f' }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default CustomerPage;