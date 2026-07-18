const express = require("express");
const router = express.Router();
const {
  getProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
} = require("../controllers/produkController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Semua route produk wajib login. Lihat data: semua role. Kelola data: Admin & Manager.
router.use(protect);

router.route("/")
  .get(getProduk)
  .post(authorize("Admin", "Manager"), upload.single("gambar"), createProduk);

router.route("/:id")
  .get(getProdukById)
  .put(authorize("Admin", "Manager"), upload.single("gambar"), updateProduk)
  .delete(authorize("Admin", "Manager"), deleteProduk);

module.exports = router;
