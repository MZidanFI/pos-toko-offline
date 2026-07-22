import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import AppLayout from '../components/AppLayout';

const StokPage = () => {
  const [histori, setHistori] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  
  const [formData, setFormData] = useState({
    produkId: '',
    supplierId: '',
    tipe: 'MASUK',
    jumlah: '',
    keterangan: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resHistori, resLow, resProduk, resSupplier] = await Promise.all([
        api.get('/stok'),
        api.get('/stok/low-stock'),
        api.get('/produk'),
        api.get('/supplier') // Pastikan endpoint ini sudah benar sesuai perbaikan sebelumnya
      ]);
      
      // PERBAIKAN DI SINI:
      // Kita ambil resProduk.data.data karena daftar array produk ada di dalam kunci 'data'
      const daftarProduk = resProduk.data.data || []; 
      setProdukList(daftarProduk);

      setHistori(Array.isArray(resHistori.data) ? resHistori.data : []);
      setLowStock(Array.isArray(resLow.data) ? resLow.data : []);
      setSupplierList(Array.isArray(resSupplier.data) ? resSupplier.data : []);
      
    } catch (err) {
      console.error('Gagal memuat data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stok', formData);
      setFormData({ produkId: '', supplierId: '', tipe: 'MASUK', jumlah: '', keterangan: '' });
      fetchData();
      alert('Transaksi stok berhasil dicatat!');
    } catch (err) {
      alert('Gagal: ' + (err.response?.data?.message || 'Terjadi kesalahan'));
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Inventori</div>
        <h1>Manajemen Stok</h1>
      </div>

      {/* NOTIFIKASI STOK MENIPIS */}
      {lowStock.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 24, backgroundColor: '#fff3cd', border: '1px solid #ffeeba' }}>
          <h4 style={{ color: '#856404', margin: '0 0 8px' }}>⚠️ Peringatan Stok Menipis</h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#856404' }}>
            {lowStock.map(item => (
              // Menghapus referensi minStok karena tidak ada di model teman
              <li key={item._id}>
                <b>{item.nama}</b> — Sisa stok: {item.stok}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FORM INPUT */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3>Catat Transaksi</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <select value={formData.produkId} onChange={e => setFormData({...formData, produkId: e.target.value})} required className="input-field">
            <option value="">-- Pilih Produk --</option>
            {produkList.map(p => <option key={p._id} value={p._id}>{p.nama} (Stok: {p.stok})</option>)}
          </select>

          <select value={formData.tipe} onChange={e => setFormData({...formData, tipe: e.target.value})} className="input-field">
            <option value="MASUK">Stok Masuk</option>
            <option value="KELUAR">Stok Keluar</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>

          {formData.tipe === 'MASUK' && (
            <select value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} required className="input-field">
              <option value="">-- Pilih Supplier --</option>
              {supplierList.map(s => <option key={s._id} value={s._id}>{s.nama}</option>)}
            </select>
          )}

          <input type="number" placeholder="Jumlah" value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: e.target.value})} required className="input-field" />
          <button type="submit" style={{ backgroundColor: '#1a4d2e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Simpan</button>
        </form>
      </div>

      {/* TABEL HISTORI */}
      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ padding: 16 }}>TANGGAL</th>
              <th style={{ padding: 16 }}>PRODUK</th>
              <th style={{ padding: 16 }}>TIPE</th>
              <th style={{ padding: 16 }}>JUMLAH</th>
            </tr>
          </thead>
          <tbody>
            {histori.map(h => (
              <tr key={h._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 16 }}>{new Date(h.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: 16 }}>{h.produk?.nama}</td>
                <td style={{ padding: 16 }}>{h.tipe}</td>
                <td style={{ padding: 16 }}>{h.jumlah}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default StokPage;