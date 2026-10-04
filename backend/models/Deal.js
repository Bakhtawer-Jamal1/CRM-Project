const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    value: { type: Number, min: 0, default: 0 },
    stage: {
      type: String,
      enum: ["discovery", "qualified", "proposal", "negotiation", "won", "lost"],
      default: "discovery",
    },
    expectedCloseDate: Date,
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);