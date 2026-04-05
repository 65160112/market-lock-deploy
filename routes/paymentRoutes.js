const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get("/", authMiddleware, paymentController.getAllPayments);
router.get("/pending", authMiddleware, roleMiddleware("admin", "manager"), paymentController.getPendingPayments);
router.get("/:id", authMiddleware, paymentController.getPaymentById);
router.post(
  "/",
  authMiddleware,
  paymentController.uploadSlip,
  paymentController.submitPayment
);
router.patch("/:id/verify", authMiddleware, roleMiddleware("admin", "manager"), paymentController.verifyPayment);

module.exports = router;