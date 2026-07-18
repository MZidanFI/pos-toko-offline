// Middleware penanganan error terpusat
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route tidak ditemukan - ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Error validasi Mongoose
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  // Error duplicate key MongoDB (unique field)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Data dengan ${field} tersebut sudah ada`;
  }

  // Error cast ObjectId tidak valid
  if (err.name === "CastError") {
    statusCode = 400;
    message = `ID tidak valid: ${err.value}`;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
