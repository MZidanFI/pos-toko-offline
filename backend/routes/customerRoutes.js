const express = require("express");
const router = express.Router();
const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.route("/")
  .get(getCustomers)
  .post(authorize("Admin", "Manager", "Kasir"), createCustomer);

router.route("/:id")
  .put(authorize("Admin", "Manager"), updateCustomer)
  .delete(authorize("Admin", "Manager"), deleteCustomer);

module.exports = router;