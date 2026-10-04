const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    website: { type: String, trim: true, maxlength: 200 },
    industry: { type: String, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 30 },
    notes: { type: String, trim: true, maxlength: 2000 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

companySchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Company", companySchema);