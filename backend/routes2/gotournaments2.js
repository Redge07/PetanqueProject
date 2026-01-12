const express = require("express");
const router = express.Router();

const { goTournamentArbre } = require("../controllers2/goTournamentArbre");

router.put("/go_tournament2/:id", goTournamentArbre);

module.exports = router;
