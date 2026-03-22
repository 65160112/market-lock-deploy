const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้" });
    }
    next();
  };
};

module.exports = roleMiddleware;