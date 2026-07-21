const express = require("express");
const router = express.Router();
const {
  previewTransaksi,
  createTransaksi,
  getTransaksi,
  getTransaksiById,
  batalkanTransaksi,
} = require("../controllers/transaksiController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Semua route transaksi wajib login.
// Buat transaksi & lihat data: semua role (Admin, Manager, Kasir).
// Batalkan transaksi: khusus Admin & Manager.
router.use(protect);

router.post("/preview", previewTransaksi);

router.route("/")
  .get(getTransaksi)
  .post(createTransaksi);

router.get("/:id", getTransaksiById);

router.patch("/:id/batal", authorize("Admin", "Manager"), batalkanTransaksi);

module.exports = router;