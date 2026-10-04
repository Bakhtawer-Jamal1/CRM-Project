const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const validateRefs = require("../utils/validateCrmReferences");

const statuses = ["lead", "contacted", "qualified", "customer", "lost"];
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

async function createContact(req, res) {
  try {
    const body = req.body || {};
    const { name, email, phone, company, jobTitle, status } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !validEmail(email.trim()) ||
      (status !== undefined && !statuses.includes(status)) ||
      [phone, jobTitle].some(
        (value) => value !== undefined && typeof value !== "string"
      ) ||
      (company != null && typeof company !== "string")
    ) {
      return res.status(400).json({ message: "Invalid contact details" });
    }

    const companyId = company || null;

    if (!(await validateRefs({ company: companyId }, req.user.id)) ) {
      return res.status(400).json({ message: "Invalid company" });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      company: companyId,
      jobTitle: jobTitle?.trim(),
      status: status || "lead",
      owner: req.user.id,
    });

    return res.status(201).json({ contact });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Invalid contact details" });
    }
    return res.status(500).json({ message: "Could not create contact" });
  }
}

async function getContacts(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const filter = { owner: req.user.id };

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Contact.countDocuments(filter),
    ]);

    return res.json({ contacts, total, page, limit });
  } catch {
    return res.status(500).json({ message: "Could not load contacts" });
  }
}

async function getContact(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid contact ID" });
  }

  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      owner: req.user.id,
    }).populate("company", "name");

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    return res.json({ contact });
  } catch {
    return res.status(500).json({ message: "Could not load contact" });
  }
}

async function updateContact(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid contact ID" });
  }

  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const updates = {};

  for (const field of ["name", "email", "phone", "jobTitle"]) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string") {
      return res.status(400).json({ message: `Invalid ${field}` });
    }
    updates[field] = body[field].trim();
  }

  if (updates.name !== undefined && !updates.name) {
    return res.status(400).json({ message: "Name cannot be empty" });
  }

  if (updates.email !== undefined) {
    if (!validEmail(updates.email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    updates.email = updates.email.toLowerCase();
  }

  if (body.status !== undefined) {
    if (!statuses.includes(body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    updates.status = body.status;
  }

  if (body.company !== undefined) {
    if (body.company === null || body.company === "") {
      updates.company = null;
    } else if (
      typeof body.company !== "string" ||
      !mongoose.isValidObjectId(body.company)
    ) {
      return res.status(400).json({ message: "Invalid company ID" });
    } else {
      updates.company = body.company;
    }
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  try {
    if (!(await validateRefs({ company: updates.company }, req.user.id))) {
      return res.status(400).json({ message: "Invalid company" });
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).populate("company", "name");

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    return res.json({ contact });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Could not update contact" });
  }
}

async function deleteContact(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid contact ID" });
  }

  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    return res.json({ message: "Contact deleted" });
  } catch {
    return res.status(500).json({ message: "Could not delete contact" });
  }
}

module.exports = {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
};