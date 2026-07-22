const Transaksi = require("../models/Transaksi");
const Produk = require("../models/Produk");

// @desc    Get Ringkasan Dashboard (Omzet, Total Transaksi, Produk Terjual, Laba Rugi)
// @route   GET /api/laporan/dashboard
// @access  Private (Admin, Manager)
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalPenjualan = await Transaksi.aggregate([
      { $match: { status: "selesai" } },
      {
        $group: {
          _id: null,
          totalOmzet: { $sum: "$total" },
          totalTransaksi: { $sum: 1 },
        },
      },
    ]);

    const omzet = totalPenjualan[0]?.totalOmzet || 0;
    const totalTransaksi = totalPenjualan[0]?.totalTransaksi || 0;

    const totalProduk = await Produk.countDocuments({ aktif: true });
    const lowStockProduk = await Produk.countDocuments({ aktif: true, stok: { $lte: 5 } });

    const recentTransactions = await Transaksi.find({ status: "selesai" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("kasir", "name email");

    res.json({
      success: true,
      data: {
        omzet,
        totalTransaksi,
        totalProduk,
        lowStockProduk,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Laporan Penjualan (Harian/Bulanan/Rentang Tanggal)
// @route   GET /api/laporan/penjualan
// @access  Private (Admin, Manager)
exports.getLaporanPenjualan = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: "selesai" };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    const transaksi = await Transaksi.find(query)
      .populate("kasir", "name")
      .sort({ createdAt: -1 });

    const totalOmzet = transaksi.reduce((acc, curr) => acc + curr.total, 0);

    res.json({
      success: true,
      count: transaksi.length,
      totalOmzet,
      data: transaksi,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Produk Terlaris (Top Selling Products)
// @route   GET /api/laporan/produk-terlaris
// @access  Private (Admin, Manager)
exports.getProdukTerlaris = async (req, res) => {
  try {
    const topProducts = await Transaksi.aggregate([
      { $match: { status: "selesai" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.produk",
          nama: { $first: "$items.nama" },
          sku: { $first: "$items.sku" },
          totalQty: { $sum: "$items.qty" },
          totalPendapatan: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Laporan Laba Rugi Sederhana
// @route   GET /api/laporan/laba-rugi
// @access  Private (Admin, Manager)
exports.getLabaRugi = async (req, res) => {
  try {
    const transaksi = await Transaksi.find({ status: "selesai" }).populate("items.produk");

    let totalOmzet = 0;
    let totalModalHPP = 0;

    transaksi.forEach((t) => {
      totalOmzet += t.total;
      t.items.forEach((item) => {
        const hargaBeli = item.produk?.hargaBeli || 0;
        totalModalHPP += hargaBeli * item.qty;
      });
    });

    const labaKotor = totalOmzet - totalModalHPP;

    res.json({
      success: true,
      data: {
        totalOmzet,
        totalModalHPP,
        labaKotor,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};