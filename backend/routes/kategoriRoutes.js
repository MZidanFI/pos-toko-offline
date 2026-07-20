const express = require("express");
const router = express.Router();
const {
  getKategori,
  createKategori,
  updateKategori,
  deleteKategori,
} = require("../controllers/kategoriController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.route("/")
  .get(getKategori)
  .post(authorize("Admin", "Manager"), createKategori);

router.route("/:id")
  .put(authorize("Admin", "Manager"), updateKategori)
  .delete(authorize("Admin", "Manager"), deleteKategori);

module.exports = router;
