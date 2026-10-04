const mongoose = require("mongoose");
const Deal = require("../models/Deal");
const validateRefs = require("../utils/validateCrmReferences");

const stages = ["discovery", "qualified", "proposal", "negotiation", "won", "lost"];
const validDate = (value) =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

async function createDeal(req, res) {
  try {
    const { title, value, stage, expectedCloseDate, contact, company } = req.body || {};

    if (
      typeof title !== "string" || !title.trim() ||
      (value !== undefined && (typeof value !== "number" || value < 0)) ||
      (stage && !stages.includes(stage)) ||
      (expectedCloseDate && !validDate(expectedCloseDate)) ||
      (contact != null && typeof contact !== "string") ||
      (company != null && typeof company !== "string")
    ) {
      return res.status(400).json({ message: "Invalid deal details" });
    }

    if (!(await validateRefs({ contact, company }, req.user.id))) {
      return res.status(400).json({ message: "Invalid contact or company" });
    }

    const deal = await Deal.create({
      title: title.trim(),
      value: value ?? 0,
      stage: stage || "discovery",
      expectedCloseDate: expectedCloseDate || undefined,
      contact: contact || undefined,
      company: company || undefined,
      owner: req.user.id,
    });

    return res.status(201).json({ deal });
  } catch {
    return res.status(500).json({ message: "Could not create deal" });
  }
}

async function getDeals(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const filter = { owner: req.user.id };

    const [deals, total] = await Promise.all([
      Deal.find(filter).populate("contact", "name email").populate("company", "name")
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Deal.countDocuments(filter),
    ]);

    return res.json({ deals, total, page, limit });
  } catch {
    return res.status(500).json({ message: "Could not load deals" });
  }
}

async function updateDeal(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid deal ID" });
  }

  const body = req.body || {};
  const updates = {};

  for (const field of ["title", "value", "stage"]) {
    if (body[field] === undefined) continue;
    updates[field] = body[field];
  }

  if (updates.title !== undefined) {
    if (typeof updates.title !== "string" || !updates.title.trim()) {
      return res.status(400).json({ message: "Invalid title" });
    }
    updates.title = updates.title.trim();
  }
  if (updates.value !== undefined && (typeof updates.value !== "number" || updates.value < 0)) {
    return res.status(400).json({ message: "Value must be a non-negative number" });
  }
  if (updates.stage !== undefined && !stages.includes(updates.stage)) {
    return res.status(400).json({ message: "Invalid deal stage" });
  }

  for (const field of ["expectedCloseDate", "contact", "company"]) {
    if (body[field] === undefined) continue;
    updates[field] = body[field] || null;
  }

  if (
    updates.expectedCloseDate &&
    !validDate(updates.expectedCloseDate)
  ) {
    return res.status(400).json({ message: "Invalid close date" });
  }
  if (
    (updates.contact != null && typeof updates.contact !== "string") ||
    (updates.company != null && typeof updates.company !== "string")
  ) {
    return res.status(400).json({ message: "Invalid contact or company ID" });
  }
  if (!(await validateRefs(updates, req.user.id))) {
    return res.status(400).json({ message: "Invalid contact or company" });
  }
  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  try {
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    return res.json({ deal });
  } catch {
    return res.status(500).json({ message: "Could not update deal" });
  }
}

async function deleteDeal(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid deal ID" });
  }

  try {
    const deal = await Deal.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    return res.json({ message: "Deal deleted" });
  } catch {
    return res.status(500).json({ message: "Could not delete deal" });
  }
}

module.exports = { createDeal, getDeals, updateDeal, deleteDeal };