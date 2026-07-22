import { useEffect, useRef, useState } from 'react';
import api from '../api/axiosConfig';
import AppLayout from '../components/AppLayout';

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-';
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const badgeClassForTipe = (tipe) => {
  if (tipe === 'MASUK') return 'badge badge-active';
  if (tipe === 'KELUAR') return 'badge badge-inactive';
  return 'badge badge-manager';
};

const tipeOptions = [
  { value: 'MASUK', label: 'Stok Masuk' },
  { value: 'KELUAR', label: 'Stok Keluar' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
];

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-select" ref={wrapperRef}>
      <button
        type="button"
        className="custom-select-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="custom-select-label">
          {selected ? selected.label : placeholder}
        </span>
        <span className="custom-select-arrow">▾</span>
      </button>

      {open && (
        <div className="custom-select-menu">
          <button
            type="button"
            className={`custom-select-option empty ${!value ? 'active' : ''}`}
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
          >
            {placeholder}
          </button>

          {options.length === 0 ? (
            <button type="button" className="custom-select-option" disabled>
              Tidak ada data
            </button>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`custom-select-option ${value === opt.value ? 'active' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const StokPage = () => {
  const [histori, setHistori] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    produkId: '',
    supplierId: '',
    tipe: 'MASUK',
    jumlah: '',
    keterangan: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [resHistori, resLow, resProduk, resSupplier] = await Promise.all([
        api.get('/stok'),
        api.get('/stok/low-stock'),
        api.get('/produk'),
        api.get('/supplier'),
      ]);

      const daftarProduk = Array.isArray(resProduk.data)
        ? resProduk.data
        : resProduk.data?.data || [];

      setProdukList(daftarProduk);
      setHistori(Array.isArray(resHistori.data) ? resHistori.data : []);
      setLowStock(Array.isArray(resLow.data) ? resLow.data : []);
      setSupplierList(Array.isArray(resSupplier.data) ? resSupplier.data : []);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      produkId: '',
      supplierId: '',
      tipe: 'MASUK',
      jumlah: '',
      keterangan: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.produkId) {
      alert('Pilih produk terlebih dahulu');
      return;
    }

    if (!formData.tipe) {
      alert('Pilih tipe transaksi terlebih dahulu');
      return;
    }

    if (formData.tipe === 'MASUK' && !formData.supplierId) {
      alert('Pilih supplier terlebih dahulu');
      return;
    }

    if (!formData.jumlah || Number(formData.jumlah) <= 0) {
      alert('Jumlah harus lebih dari 0');
      return;
    }

    setSaving(true);

    try {
      await api.post('/stok', formData);
      resetForm();
      fetchData();
      alert('Transaksi stok berhasil dicatat!');
    } catch (err) {
      alert('Gagal: ' + (err.response?.data?.message || 'Terjadi kesalahan'));
    } finally {
      setSaving(false);
    }
  };

  const produkOptions = produkList.map((p) => ({
    value: p._id,
    label: `${p.nama} — Stok: ${p.stok}`,
  }));

  const supplierOptions = supplierList.map((s) => ({
    value: s._id,
    label: s.nama,
  }));

  return (
    <AppLayout>
      <div className="page-header">
        <div className="eyebrow">Inventori</div>
        <h1>Manajemen Stok</h1>
      </div>

      {lowStock.length > 0 && (
        <div
          className="card"
          style={{
            padding: 16,
            marginBottom: 24,
            background: 'rgba(226, 154, 61, 0.12)',
            borderColor: 'rgba(226, 154, 61, 0.35)',
          }}
        >
          <h3 style={{ fontSize: '1rem', marginBottom: 10, color: 'var(--color-accent-dark)' }}>
            ⚠️ Peringatan Stok Menipis
          </h3>

          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              color: 'var(--color-accent-dark)',
              fontSize: '0.9rem',
            }}
          >
            {lowStock.map((item) => (
              <li key={item._id}>
                <b>{item.nama}</b> — Sisa stok: {item.stok}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>
          Catat Transaksi
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="stock-form-grid">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>Produk</label>
              <CustomSelect
                value={formData.produkId}
                placeholder="Pilih produk"
                options={produkOptions}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    produkId: value,
                  })
                }
              />
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>Tipe Transaksi</label>
              <CustomSelect
                value={formData.tipe}
                placeholder="Pilih tipe transaksi"
                options={tipeOptions}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    tipe: value,
                    supplierId: value === 'MASUK' ? formData.supplierId : '',
                  })
                }
              />
            </div>

            {formData.tipe === 'MASUK' && (
              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Supplier</label>
                <CustomSelect
                  value={formData.supplierId}
                  placeholder="Pilih supplier"
                  options={supplierOptions}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      supplierId: value,
                    })
                  }
                />
              </div>
            )}

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>Jumlah</label>
              <input
                type="number"
                min="1"
                placeholder="Masukkan jumlah"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jumlah: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>Keterangan</label>
              <input
                placeholder="Opsional"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keterangan: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="btn-primary stock-submit-btn"
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : histori.length === 0 ? (
          <div className="empty-state">Belum ada histori stok.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Produk</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Keterangan</th>
              </tr>
            </thead>

            <tbody>
              {histori.map((h) => (
                <tr key={h._id}>
                  <td>{formatTanggal(h.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{h.produk?.nama || '-'}</td>
                  <td>
                    <span className={badgeClassForTipe(h.tipe)}>
                      {h.tipe}
                    </span>
                  </td>
                  <td>{h.jumlah}</td>
                  <td>{h.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
};

export default StokPage;