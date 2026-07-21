const mongoose = require("mongoose");
const Produk = require("../models/Produk");
const Transaksi = require("../models/Transaksi");
const Counter = require("../models/Counter");

// Helper: generate nomor struk unik per hari (TRX-20250115-0001)
const generateNomorStruk = async (session) => {
  const today = new Date();
  const tanggal = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}`;
  const counterId = `struk-${tanggal}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  const urutan = String(counter.seq).padStart(4, "0");
  return `TRX-${tanggal}-${urutan}`;
};

// Helper: ambil detail produk & hitung subtotal dari daftar item request
const susunItemTransaksi = async (items, session) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: "Item transaksi tidak boleh kosong" };
  }

  let subtotal = 0;
  const itemHasil = [];

  for (const it of items) {
    const produk = await Produk.findById(it.produk).session(session);
    if (!produk) {
      throw { status: 404, message: `Produk dengan ID ${it.produk} tidak ditemukan` };
    }

    const qty = Number(it.qty);
    if (!qty || qty <= 0) {
      throw { status: 400, message: `Qty tidak valid untuk produk ${produk.nama}` };
    }

    if (produk.stok < qty) {
      throw { status: 400, message: `Stok ${produk.nama} tidak mencukupi (sisa ${produk.stok})` };
    }

    const hargaSatuan = produk.hargaJual;
    const subtotalItem = hargaSatuan * qty;
    subtotal += subtotalItem;

    itemHasil.push({
      produk: produk._id,
      nama: produk.nama,
      sku: produk.sku,
      harga: hargaSatuan,
      qty,
      subtotal: subtotalItem,
      _produkDoc: produk, // dipakai internal untuk update stok, akan dibuang sebelum simpan
    });
  }

  return { itemHasil, subtotal };
};

// @desc    Preview / hitung total transaksi tanpa mengubah stok
// @route   POST /api/transaksi/preview
const previewTransaksi = async (req, res) => {
  const { items, diskon = 0, pajakPersen = 11 } = req.body;

  try {
    const { itemHasil, subtotal } = await susunItemTransaksi(items, null);

    const dpp = Math.max(subtotal - diskon, 0);
    const pajak = Math.round((dpp * pajakPersen) / 100);
    const total = dpp + pajak;

    const itemBersih = itemHasil.map(({ _produkDoc, ...rest }) => rest);

    res.json({
      items: itemBersih,
      subtotal,
      diskon,
      pajakPersen,
      pajak,
      total,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Gagal menghitung transaksi" });
  }
};

// @desc    Proses transaksi baru (checkout) + update stok otomatis
// @route   POST /api/transaksi
const createTransaksi = async (req, res) => {
  const {
    items,
    diskon = 0,
    pajakPersen = 11,
    metodePembayaran = "tunai",
    jumlahBayar,
    catatan,
  } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { itemHasil, subtotal } = await susunItemTransaksi(items, session);

    const dpp = Math.max(subtotal - diskon, 0);
    const pajak = Math.round((dpp * pajakPersen) / 100);
    const total = dpp + pajak;

    if (metodePembayaran === "tunai" && Number(jumlahBayar) < total) {
      throw { status: 400, message: "Jumlah bayar kurang dari total transaksi" };
    }

    const kembalian = Number(jumlahBayar) - total;

    // Kurangi stok tiap produk
    for (const item of itemHasil) {
      item._produkDoc.stok -= item.qty;
      await item._produkDoc.save({ session });
    }

    const nomorStruk = await generateNomorStruk(session);

    const itemBersih = itemHasil.map(({ _produkDoc, ...rest }) => rest);

    const transaksiBaru = new Transaksi({
      nomorStruk,
      items: itemBersih,
      subtotal,
      diskon,
      pajakPersen,
      pajak,
      total,
      metodePembayaran,
      jumlahBayar,
      kembalian,
      kasir: req.user._id, // sesuaikan dengan middleware auth
      catatan,
    });

    const disimpan = await transaksiBaru.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(disimpan);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Gagal membuat transaksi:", err);
    res.status(err.status || 500).json({ message: err.message || "Gagal memproses transaksi" });
  }
};

// @desc    Ambil semua transaksi (filter tanggal, kasir, nomor struk)
// @route   GET /api/transaksi?dari=&sampai=&kasir=&search=&page=&limit=
const getTransaksi = async (req, res) => {
  const { dari, sampai, kasir, search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (dari || sampai) {
    query.createdAt = {};
    if (dari) query.createdAt.$gte = new Date(dari);
    if (sampai) query.createdAt.$lte = new Date(sampai + "T23:59:59");
  }

  if (kasir) query.kasir = kasir;
  if (search) query.nomorStruk = { $regex: search, $options: "i" };

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    Transaksi.find(query)
      .populate("kasir", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Transaksi.countDocuments(query),
  ]);

  res.json({
    data,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
};

// @desc    Ambil detail satu transaksi (untuk cetak struk)
// @route   GET /api/transaksi/:id
const getTransaksiById = async (req, res) => {
  const transaksi = await Transaksi.findById(req.params.id).populate("kasir", "name");
  if (!transaksi) {
    return res.status(404).json({ message: "Transaksi tidak ditemukan" });
  }
  res.json(transaksi);
};

// @desc    Batalkan transaksi & kembalikan stok
// @route   PATCH /api/transaksi/:id/batal
const batalkanTransaksi = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const transaksi = await Transaksi.findById(req.params.id).session(session);
    if (!transaksi) {
      throw { status: 404, message: "Transaksi tidak ditemukan" };
    }
    if (transaksi.status === "dibatalkan") {
      throw { status: 400, message: "Transaksi sudah dibatalkan sebelumnya" };
    }

    // Kembalikan stok tiap item
    for (const item of transaksi.items) {
      await Produk.findByIdAndUpdate(
        item.produk,
        { $inc: { stok: item.qty } },
        { session }
      );
    }

    transaksi.status = "dibatalkan";
    await transaksi.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Transaksi berhasil dibatalkan", transaksi });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(err.status || 500).json({ message: err.message || "Gagal membatalkan transaksi" });
  }
};

module.exports = {
  previewTransaksi,
  createTransaksi,
  getTransaksi,
  getTransaksiById,
  batalkanTransaksi,
};