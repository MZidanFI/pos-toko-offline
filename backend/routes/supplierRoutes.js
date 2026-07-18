const express = require("express");
const router = express.Router();
const {
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.route("/")
  .get(getSupplier)
  .post(authorize("Admin", "Manager"), createSupplier);

router.route("/:id")
  .put(authorize("Admin", "Manager"), updateSupplier)
  .delete(authorize("Admin", "Manager"), deleteSupplier);

module.exports = router;
