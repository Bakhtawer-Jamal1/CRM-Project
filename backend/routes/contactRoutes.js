const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const router = express.Router();

router.use(authMiddleware);
router.route("/")
  .get(getContacts)
  .post(createContact);

router.route("/:id")
  .get(getContact)
  .patch(updateContact)
  .delete(deleteContact);

module.exports = router;