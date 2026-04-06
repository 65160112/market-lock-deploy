require("dotenv").config();

// ป้องกัน process crash จาก unhandled errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
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

// Session store — ใช้ callback pool (express-mysql-session ไม่รองรับ promise pool)
const mysql2 = require("mysql2");
const sessionPool = mysql2.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "market_lock_db",
});
const sessionStore = new MySQLStore({ createDatabaseTable: true }, sessionPool);

sessionStore.on("error", (err) => {
  console.error("Session store error:", err.message);
});

// Health check — ต้องอยู่ก่อน session middleware เพื่อไม่ให้ติด MySQL
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// สร้างโฟลเดอร์ uploads/slips ถ้ายังไม่มี
const uploadDir = path.join(__dirname, "uploads", "slips");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads/slips directory");
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    key: "market_session",
    secret: process.env.SESSION_SECRET || "secret_key_change_this",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 วัน
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

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