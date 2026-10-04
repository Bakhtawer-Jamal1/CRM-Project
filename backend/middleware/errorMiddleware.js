function notFound(req, res, next) {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status >= 500 ? "Internal server error" : error.message;

  return res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };