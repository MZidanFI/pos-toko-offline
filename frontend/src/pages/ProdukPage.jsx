import { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";
import ProdukForm from "../components/ProdukForm";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

const IMG_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(
    angka || 0
  );

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
    setKategoriList(kategoriRes.data);
    setSupplierList(supplierRes.data);
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
      setProdukList(data.data);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, filterKategori, filterSupplier, page]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchProduk(), 300); // debounce pencarian
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

  return (
    <AppLayout>
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Master Data Produk</h1>
          <p className="text-sm text-gray-400">Kelola produk yang dijual di toko</p>
        </div>
        {isAdmin && (
          <button
            onClick={openTambah}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + Tambah Produk
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Cari nama atau SKU/barcode..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filterKategori}
          onChange={(e) => {
            setPage(1);
            setFilterKategori(e.target.value);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Semua Kategori</option>
          {kategoriList.map((k) => (
            <option key={k._id} value={k._id}>
              {k.nama}
            </option>
          ))}
        </select>
        <select
          value={filterSupplier}
          onChange={(e) => {
            setPage(1);
            setFilterSupplier(e.target.value);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Semua Supplier</option>
          {supplierList.map((s) => (
            <option key={s._id} value={s._id}>
              {s.nama}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Gambar</th>
              <th className="text-left px-4 py-3">Nama</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">Kategori</th>
              <th className="text-left px-4 py-3">Supplier</th>
              <th className="text-right px-4 py-3">Harga Beli</th>
              <th className="text-right px-4 py-3">Harga Jual</th>
              <th className="text-right px-4 py-3">Stok</th>
              {isAdmin && <th className="text-center px-4 py-3">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  Memuat data...
                </td>
              </tr>
            )}

            {!loading && produkList.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  Tidak ada produk ditemukan
                </td>
              </tr>
            )}

            {!loading &&
              produkList.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                      {p.gambar ? (
                        <img
                          src={`${IMG_BASE}/uploads/${p.gambar}`}
                          alt={p.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                          N/A
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">{p.nama}</td>
                  <td className="px-4 py-2 text-gray-500">{p.sku}</td>
                  <td className="px-4 py-2">{p.kategori?.nama || "-"}</td>
                  <td className="px-4 py-2">{p.supplier?.nama || "-"}</td>
                  <td className="px-4 py-2 text-right">{formatRupiah(p.hargaBeli)}</td>
                  <td className="px-4 py-2 text-right">{formatRupiah(p.hargaJual)}</td>
                  <td className="px-4 py-2 text-right">{p.stok}</td>
                  {isAdmin && (
                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-primary-600 hover:underline text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="text-red-600 hover:underline text-xs font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
          <span className="text-gray-400">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-40"
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
    </div>
    </AppLayout>
  );
}
