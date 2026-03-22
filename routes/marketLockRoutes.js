const express = require("express");
const router = express.Router();
const marketLockController = require("../controllers/marketLockController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ทุกคนที่ login แล้วดูได้
router.get("/", authMiddleware, marketLockController.getAllLocks);
router.get("/map", authMiddleware, marketLockController.getMapLayout);
router.get("/:id", authMiddleware, marketLockController.getLockById);

// เฉพาะ Admin
router.post("/", authMiddleware, roleMiddleware("admin"), marketLockController.createLock);
router.put("/:id", authMiddleware, roleMiddleware("admin"), marketLockController.updateLock);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), marketLockController.deleteLock);

module.exports = router;