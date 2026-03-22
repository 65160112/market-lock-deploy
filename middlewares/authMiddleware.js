const authMiddleware = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "กรุณาเข้าสู่ระบบก่อน" });
  }
  req.user = req.session.user;
  next();
};

module.exports = authMiddleware;