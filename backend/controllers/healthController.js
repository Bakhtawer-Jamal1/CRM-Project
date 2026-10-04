const mongoose = require("mongoose");

function getHealth(req, res) {
  const connected = mongoose.connection.readyState === 1;

  return res.status(connected ? 200 : 503).json({
    server: "running",
    database: connected ? "connected" : "disconnected",
  });
}

module.exports = { getHealth };