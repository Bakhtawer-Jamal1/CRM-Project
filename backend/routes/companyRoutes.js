const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

const router = express.Router();

router.use(authMiddleware);
router.route("/").get(getCompanies).post(createCompany);
router.route("/:id").get(getCompany).patch(updateCompany).delete(deleteCompany);

module.exports = router;