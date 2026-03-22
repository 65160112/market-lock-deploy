const MarketLock = require("../models/marketLockModel");

const marketLockController = {
  // GET /locks — ดูล็อคทั้งหมด
  async getAllLocks(req, res) {
    try {
      const locks = await MarketLock.findAll();
      res.json(locks);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // GET /locks/map — แผนผังล็อค
  async getMapLayout(req, res) {
    try {
      const layout = await MarketLock.getMapLayout();
      res.json(layout);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // GET /locks/:id
  async getLockById(req, res) {
    try {
      const lock = await MarketLock.findById(req.params.id);
      if (!lock) return res.status(404).json({ message: "ไม่พบล็อค" });
      res.json(lock);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // POST /locks — Admin only
  async createLock(req, res) {
    try {
      const { zone, lock_number, size, price_per_month, description } =
        req.body;
      if (!zone || !lock_number || !price_per_month) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
      }
      const id = await MarketLock.create({
        zone,
        lock_number,
        size,
        price_per_month,
        description,
      });
      res.status(201).json({ message: "สร้างล็อคสำเร็จ", id });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // PUT /locks/:id — Admin only
  async updateLock(req, res) {
    try {
      const { zone, lock_number, size, price_per_month, description, status } =
        req.body;
      const updateFields = {};
      if (zone) updateFields.zone = zone;
      if (lock_number) updateFields.lock_number = lock_number;
      if (size) updateFields.size = size;
      if (price_per_month) updateFields.price_per_month = price_per_month;
      if (description) updateFields.description = description;
      if (status) updateFields.status = status;

      await MarketLock.update(req.params.id, updateFields);
      res.json({ message: "อัปเดตล็อคสำเร็จ" });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // DELETE /locks/:id — Admin only
  async deleteLock(req, res) {
    try {
      await MarketLock.delete(req.params.id);
      res.json({ message: "ลบล็อคสำเร็จ" });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },
};

module.exports = marketLockController;