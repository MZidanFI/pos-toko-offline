const Stok = require('../models/Stok'); // Diperbarui sesuai nama file
const Produk = require('../models/Produk');

// @desc    Ambil semua histori pergerakan stok
// @route   GET /api/stok
const getStok = async (req, res) => {
  const histori = await Stok.find()
    .populate('produk', 'nama')
    .populate('supplier', 'nama')
    .populate('user', 'email')
    .sort({ createdAt: -1 });
  res.json(histori);
};

// @desc    Catat pergerakan stok (Masuk/Keluar/Adjustment)
// @route   POST /api/stok
const catatStok = async (req, res) => {
  const { produkId, supplierId, tipe, jumlah, keterangan } = req.body;

  const produk = await Produk.findById(produkId);
  if (!produk) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  const perubahan = Number(jumlah);

  if (tipe === 'MASUK') {
    if (!supplierId) return res.status(400).json({ message: "Supplier wajib diisi untuk stok masuk" });
    produk.stok += perubahan;
  } else if (tipe === 'KELUAR') {
    if (produk.stok < perubahan) {
      return res.status(400).json({ message: "Stok tidak mencukupi!" });
    }
    produk.stok -= perubahan;
  } else if (tipe === 'ADJUSTMENT') {
    produk.stok = perubahan; // Penyesuaian langsung ke jumlah baru
  }

  await produk.save();

  const pergerakanStok = await Stok.create({
    produk: produkId,
    supplier: supplierId || null,
    tipe,
    jumlah: perubahan,
    keterangan,
    user: req.user._id
  });

  res.status(201).json({ message: "Pergerakan stok berhasil dicatat", pergerakanStok });
};

// @desc    Cek Produk dengan Stok Menipis (Low Stock Warning)
// @route   GET /api/stok/low-stock
const getLowStockAlert = async (req, res) => {
  const batasStokMenipis = 5; 
  
  const lowProducts = await Produk.find({ stok: { $lte: batasStokMenipis } });
  res.json(lowProducts);
};

module.exports = { getStok, catatStok, getLowStockAlert };