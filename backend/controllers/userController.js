const User = require("../models/User");

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("name email createdAt");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch {
    return res.status(500).json({ message: "Could not load user" });
  }
}

module.exports = { getMe };