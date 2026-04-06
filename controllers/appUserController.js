const AppUser = require("../models/appUserModel");
const bcrypt = require("bcryptjs");

const appUserController = {
  // POST /users — Admin only: create manager or vendor
  async createUser(req, res) {
    try {
      const { username, email, password, role, full_name, phone } = req.body;

      if (!username || !email || !password || !full_name || !role) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      }

      if (!["manager", "vendor"].includes(role)) {
        return res.status(400).json({ message: "บทบาทไม่ถูกต้อง" });
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

      const userId = await AppUser.create({
        username,
        email,
        password: hashedPassword,
        role,
        full_name,
        phone,
      });

      res.status(201).json({ message: "สร้างผู้ใช้สำเร็จ", userId });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // GET /users — Admin only
  async getAllUsers(req, res) {
    try {
      const users = await AppUser.findAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // GET /users/:id
  async getUserById(req, res) {
    try {
      const user = await AppUser.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // PUT /users/:id — update profile (self or admin)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { full_name, phone, password } = req.body;

      // ตรวจสิทธิ์: แก้ได้เฉพาะตัวเองหรือ admin
      if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไขข้อมูลนี้" });
      }

      const { full_name, phone, password, role } = req.body;

      const updateFields = {};
      if (full_name) updateFields.full_name = full_name;
      if (phone !== undefined) updateFields.phone = phone;
      if (password) updateFields.password = await bcrypt.hash(password, 10);
      if (role && req.user.role === "admin") {
        if (!["admin", "manager", "vendor"].includes(role)) {
          return res.status(400).json({ message: "บทบาทไม่ถูกต้อง" });
        }
        updateFields.role = role;
      }

      await AppUser.update(id, updateFields);
      res.json({ message: "อัปเดตข้อมูลสำเร็จ" });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // DELETE /users/:id — Admin only
  async deleteUser(req, res) {
    try {
      await AppUser.delete(req.params.id);
      res.json({ message: "ลบผู้ใช้งานสำเร็จ" });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },
};

module.exports = appUserController;