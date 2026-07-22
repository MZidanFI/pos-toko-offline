import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axiosConfig";
import ProdukForm from "../components/ProdukForm";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

const IMG_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka || 0);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            className={`custom-select-option empty ${!value ? "active" : ""}`}
            onClick={() => {
              onChange("");
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
                className={`custom-select-option ${value === opt.value ? "active" : ""}`}
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

export default function ProdukPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("Admin", "Manager");

  const [produkList, setProdukList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduk, setEditingProduk] = useState(null);

  const fetchMasterData = useCallback(async () => {
    const [kategoriRes, supplierRes] = await Promise.all([
      api.get("/kategori"),
      api.get("/supplier"),
    ]);

    setKategoriList(Array.isArray(kategoriRes.data) ? kategoriRes.data : []);
    setSupplierList(Array.isArray(supplierRes.data) ? supplierRes.data : []);
  }, []);

  const fetchProduk = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/produk", {
        params: {
          search: search || undefined,
          kategori: filterKategori || undefined,
          supplier: filterSupplier || undefined,
          page,
          limit: 10,
        },
      });

      setProdukList(data.data || []);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [search, filterKategori, filterSupplier, page]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchProduk(), 300);
    return () => clearTimeout(timeout);
  }, [fetchProduk]);

  const handleDelete = async (produk) => {
    if (!confirm(`Hapus produk "${produk.nama}"?`)) return;
    await api.delete(`/produk/${produk._id}`);
    fetchProduk();
  };

  const openTambah = () => {
    setEditingProduk(null);
    setShowForm(true);
  };

  const openEdit = (produk) => {
    setEditingProduk(produk);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    fetchProduk();
  };

  const kategoriOptions = kategoriList.map((k) => ({
    value: k._id,
    label: k.nama,
  }));

  const supplierOptions = supplierList.map((s) => ({
    value: s._id,
    label: s.nama,
  }));

  return (
    <AppLayout>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div className="eyebrow">Master Data</div>
          <h1>Master Data Produk</h1>
          <p className="page-header-subtitle">Kelola produk yang dijual di toko</p>
        </div>

        {isAdmin && (
          <button className="btn-primary" style={{ width: "auto" }} onClick={openTambah}>
            + Tambah Produk
          </button>
        )}
      </div>

      <div className="card filter-bar">
        <input
          type="text"
          placeholder="Cari nama atau SKU/barcode..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="text-input"
        />

        <div style={{ minWidth: 180 }}>
          <CustomSelect
            value={filterKategori}
            placeholder="Semua Kategori"
            options={kategoriOptions}
            onChange={(value) => {
              setPage(1);
              setFilterKategori(value);
            }}
          />
        </div>

        <div style={{ minWidth: 180 }}>
          <CustomSelect
            value={filterSupplier}
            placeholder="Semua Supplier"
            options={supplierOptions}
            onChange={(value) => {
              setPage(1);
              setFilterSupplier(value);
            }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : produkList.length === 0 ? (
          <div className="empty-state">Tidak ada produk ditemukan</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Nama</th>
                <th>SKU</th>
                <th>Kategori</th>
                <th>Supplier</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th>Stok</th>
                {isAdmin && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {produkList.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table-thumb">
                      {p.gambar ? (
                        <img src={`${IMG_BASE}/uploads/${p.gambar}`} alt={p.nama} />
                      ) : (
                        <span className="table-thumb-empty">N/A</span>
                      )}
                    </div>
                  </td>

                  <td style={{ fontWeight: 600 }}>{p.nama}</td>
                  <td className="mono" style={{ fontSize: "0.85rem" }}>
                    {p.sku}
                  </td>
                  <td>{p.kategori?.nama || "-"}</td>
                  <td>{p.supplier?.nama || "-"}</td>
                  <td>{formatRupiah(p.hargaBeli)}</td>
                  <td>{formatRupiah(p.hargaJual)}</td>
                  <td>{p.stok}</td>

                  {isAdmin && (
                    <td>
                      <div className="row-actions">
                        <button className="btn-secondary" onClick={() => openEdit(p)}>
                          Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(p)}>
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

        <div className="pagination">
          <span>
            Halaman {page} dari {totalPages}
          </span>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </button>

            <button
              className="pagination-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <ProdukForm
          produk={editingProduk}
          kategoriList={kategoriList}
          supplierList={supplierList}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </AppLayout>
  );
}