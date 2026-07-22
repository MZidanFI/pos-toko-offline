const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
  getLaporanPenjualan,
  getProdukTerlaris,
  getLabaRugi,
} = require("../controllers/laporanController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Semua endpoint di bawah hanya bisa diakses oleh Admin & Manager
router.use(protect);
router.use(authorize("Admin", "Manager"));

router.get("/dashboard", getDashboardSummary);
router.get("/penjualan", getLaporanPenjualan);
router.get("/produk-terlaris", getProdukTerlaris);
router.get("/laba-rugi", getLabaRugi);

module.exports = router;