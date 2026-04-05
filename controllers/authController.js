const bcrypt = require("bcryptjs");
const AppUser = require("../models/appUserModel");

const authController = {
  // POST /auth/register
  async register(req, res) {
    try {
      const { username, email, password, full_name, phone } = req.body;

      if (!username || !email || !password || !full_name) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      }

      const existingEmail = await AppUser.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
      }

      const existingUsername = await AppUser.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = "vendor"; // Vendors can register themselves

      const userId = await AppUser.create({
        username,
        email,
        password: hashedPassword,
        role: userRole,
        full_name,
        phone,
      });

      res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", userId });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // POST /auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
      }

      const user = await AppUser.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      };

      res.json({
        message: "เข้าสู่ระบบสำเร็จ",
        user: req.session.user,
      });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // POST /auth/logout
  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "ออกจากระบบไม่สำเร็จ" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "ออกจากระบบสำเร็จ" });
    });
  },

  // GET /auth/me
  async me(req, res) {
    res.json({ user: req.session.user });
  },
};

module.exports = authController;