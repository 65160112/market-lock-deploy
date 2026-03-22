const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${err.stack || err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;