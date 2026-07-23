const express = require("express");
const router = express.Router();
const {
  getStok,
  catatStok,
  getLowStockAlert,
} = require("../controllers/stokController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Semua route di bawah ini dilindungi oleh middleware auth
router.use(protect);

router.route("/")
  .get(getStok) // Melihat histori stok
  .post(authorize("Admin", "Manager", "Kasir"), catatStok); // Mencatat stok masuk/keluar/adj

router.get("/low-stock", protect, getLowStockAlert); // Notifikasi stok menipis

module.exports = router;