const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const Company = require("../models/Company");
const Deal = require("../models/Deal");
const Task = require("../models/Task");

async function getSummary(req, res) {
  try {
    const owner = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    const [contacts, companies, openTasks, overdueTasks, dealStages] =
      await Promise.all([
        Contact.countDocuments({ owner }),
        Company.countDocuments({ owner }),
        Task.countDocuments({ owner, completed: false }),
        Task.countDocuments({
          owner,
          completed: false,
          dueDate: { $lt: now },
        }),
        Deal.aggregate([
          { $match: { owner } },
          {
            $group: {
              _id: "$stage",
              count: { $sum: 1 },
              value: { $sum: "$value" },
            },
          },
        ]),
      ]);

    const openStages = ["discovery", "qualified", "proposal", "negotiation"];
    const openPipeline = dealStages
      .filter((item) => openStages.includes(item._id))
      .reduce((sum, item) => sum + item.value, 0);

    return res.json({
      contacts,
      companies,
      openTasks,
      overdueTasks,
      openPipeline,
      dealsByStage: dealStages,
    });
  } catch {
    return res.status(500).json({ message: "Could not load dashboard" });
  }
}

module.exports = { getSummary };