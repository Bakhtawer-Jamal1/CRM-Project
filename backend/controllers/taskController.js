const mongoose = require("mongoose");
const Task = require("../models/Task");
const validateRefs = require("../utils/validateCrmReferences");

const priorities = ["low", "medium", "high"];
const validDate = (value) =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

async function createTask(req, res) {
  try {
    const { title, description, dueDate, priority, contact, company } = req.body || {};

    if (
      typeof title !== "string" || !title.trim() ||
      (description !== undefined && typeof description !== "string") ||
      (dueDate && !validDate(dueDate)) ||
      (priority && !priorities.includes(priority)) ||
      (contact != null && typeof contact !== "string") ||
      (company != null && typeof company !== "string")
    ) {
      return res.status(400).json({ message: "Invalid task details" });
    }

    if (!(await validateRefs({ contact, company }, req.user.id))) {
      return res.status(400).json({ message: "Invalid contact or company" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      dueDate: dueDate || undefined,
      priority: priority || "medium",
      contact: contact || undefined,
      company: company || undefined,
      owner: req.user.id,
    });

    return res.status(201).json({ task });
  } catch {
    return res.status(500).json({ message: "Could not create task" });
  }
}

async function getTasks(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const filter = { owner: req.user.id };

    const [tasks, total] = await Promise.all([
      Task.find(filter).populate("contact", "name email").populate("company", "name")
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Task.countDocuments(filter),
    ]);

    return res.json({ tasks, total, page, limit });
  } catch {
    return res.status(500).json({ message: "Could not load tasks" });
  }
}

async function updateTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  const body = req.body || {};
  const updates = {};

  for (const field of ["title", "description"]) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        return res.status(400).json({ message: `Invalid ${field}` });
      }
      updates[field] = body[field].trim();
    }
  }

  if (updates.title !== undefined && !updates.title) {
    return res.status(400).json({ message: "Title cannot be empty" });
  }
  if (body.priority !== undefined) {
    if (!priorities.includes(body.priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }
    updates.priority = body.priority;
  }
  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean") {
      return res.status(400).json({ message: "Completed must be true or false" });
    }
    updates.completed = body.completed;
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate && !validDate(body.dueDate)) {
      return res.status(400).json({ message: "Invalid due date" });
    }
    updates.dueDate = body.dueDate || null;
  }
  for (const field of ["contact", "company"]) {
    if (body[field] !== undefined) updates[field] = body[field] || null;
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json({ task });
  } catch {
    return res.status(500).json({ message: "Could not update task" });
  }
}

async function deleteTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json({ message: "Task deleted" });
  } catch {
    return res.status(500).json({ message: "Could not delete task" });
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask };