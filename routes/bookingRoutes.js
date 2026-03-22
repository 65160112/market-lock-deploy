const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get("/", authMiddleware, bookingController.getAllBookings);
router.get("/stats", authMiddleware, roleMiddleware("admin"), bookingController.getStats);
router.get("/:id", authMiddleware, bookingController.getBookingById);
router.post("/", authMiddleware, roleMiddleware("tenant", "vendor"), bookingController.createBooking);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin"), bookingController.updateBookingStatus);
router.delete("/:id", authMiddleware, bookingController.cancelBooking);

module.exports = router;