require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const appUserRoutes = require("./routes/appUserRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const marketLockRoutes = require("./routes/marketLockRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001';
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Health check สำหรับ Railway
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// uploads folder (สำหรับ local dev เท่านั้น — production ใช้ Cloudinary)
const uploadDir = path.join(__dirname, "uploads", "slips");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", appUserRoutes);
app.use("/api/locks", marketLockRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// Error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
