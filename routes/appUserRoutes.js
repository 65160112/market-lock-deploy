const express = require("express");
const router = express.Router();
const appUserController = require("../controllers/appUserController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("admin"), appUserController.createUser);
router.get("/", authMiddleware, roleMiddleware("admin"), appUserController.getAllUsers);
router.get("/:id", authMiddleware, appUserController.getUserById);
router.put("/:id", authMiddleware, appUserController.updateUser);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), appUserController.deleteUser);

module.exports = router;