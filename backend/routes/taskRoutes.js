const express = require("express");
const auth = require("../middleware/authMiddleware");
const { createTask, getTasks, updateTask, deleteTask } =
  require("../controllers/taskController");

const router = express.Router();

router.use(auth);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").patch(updateTask).delete(deleteTask);

module.exports = router;