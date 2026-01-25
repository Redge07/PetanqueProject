const express = require("express");
const router = express.Router();
const tournaments = require("../controllers2/tournaments");

router.get("/:id", tournaments.charge);
router.get("/classement/:id", tournaments.charge_classement);

module.exports = router;
