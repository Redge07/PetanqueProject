const express = require("express");
const router = express.Router();
const tournaments = require("../controllers2/tournaments");

router.get("/:id", tournaments.charge);

module.exports = router;
