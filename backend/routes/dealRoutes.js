const express = require("express");
const auth = require("../middleware/authMiddleware");
const { createDeal, getDeals, updateDeal, deleteDeal } =
  require("../controllers/dealController");

const router = express.Router();

router.use(auth);
router.route("/").get(getDeals).post(createDeal);
router.route("/:id").patch(updateDeal).delete(deleteDeal);

module.exports = router;