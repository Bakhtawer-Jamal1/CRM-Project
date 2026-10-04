const mongoose = require("mongoose");
const Company = require("../models/Company");
const Deal = require("../models/Deal");
const Task = require("../models/Task");

async function createCompany(req, res) {
  try {
    const { name, website, industry, phone, notes } = req.body || {};

    if (
      typeof name !== "string" || !name.trim() ||
      [website, industry, phone, notes].some(
        (value) => value !== undefined && typeof value !== "string"
      )
    ) {
      return res.status(400).json({ message: "Invalid company details" });
    }

    const company = await Company.create({
      name: name.trim(),
      website: website?.trim(),
      industry: industry?.trim(),
      phone: phone?.trim(),
      notes: notes?.trim(),
      owner: req.user.id,
    });

    return res.status(201).json({ company });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Company name already exists" });
    }
    return res.status(500).json({ message: "Could not create company" });
  }
}

async function getCompanies(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const filter = { owner: req.user.id };

    const [companies, total] = await Promise.all([
      Company.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Company.countDocuments(filter),
    ]);

    return res.json({ companies, total, page, limit });
  } catch {
    return res.status(500).json({ message: "Could not load companies" });
  }
}

async function getCompany(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid company ID" });
  }

  try {
    const company = await Company.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!company) return res.status(404).json({ message: "Company not found" });
    return res.json({ company });
  } catch {
    return res.status(500).json({ message: "Could not load company" });
  }
}

async function updateCompany(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid company ID" });
  }

  const body = req.body || {};
  const updates = {};

  for (const field of ["name", "website", "industry", "phone", "notes"]) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string") {
      return res.status(400).json({ message: `Invalid ${field}` });
    }
    updates[field] = body[field].trim();
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No valid fields to update" });
  }
  if (updates.name !== undefined && !updates.name) {
    return res.status(400).json({ message: "Name cannot be empty" });
  }

  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!company) return res.status(404).json({ message: "Company not found" });
    return res.json({ company });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Company name already exists" });
    }
    return res.status(500).json({ message: "Could not update company" });
  }
}

async function deleteCompany(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid company ID" });
  }

  try {
    const filter = { company: req.params.id, owner: req.user.id };
    const [hasDeals, hasTasks] = await Promise.all([
      Deal.exists(filter),
      Task.exists(filter),
    ]);

    if (hasDeals || hasTasks) {
      return res.status(409).json({ message: "Company is linked to deals or tasks" });
    }

    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!company) return res.status(404).json({ message: "Company not found" });
    return res.json({ message: "Company deleted" });
  } catch {
    return res.status(500).json({ message: "Could not delete company" });
  }
}

module.exports = {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
};