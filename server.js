require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const appUserRoutes = require("./routes/appUserRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const marketLockRoutes = require("./routes/marketLockRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true,
}));

// Session store (MySQL)
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "market_lock_db",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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