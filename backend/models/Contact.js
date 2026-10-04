const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true, maxlength: 30 },
    company: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Company",
  default: null,
},
    jobTitle: { type: String, trim: true, maxlength: 120 },
    status: {
      type: String,
      enum: ["lead", "contacted", "qualified", "customer", "lost"],
      default: "lead",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);