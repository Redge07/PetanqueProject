const express = require("express");
const router = express.Router();
const gotournaments = require("../controllers/gotournaments");

router.put("/go_tournament/:id", gotournaments.go_tournament);
router.put("/win_player/:id", gotournaments.win_player);

module.exports = router;
