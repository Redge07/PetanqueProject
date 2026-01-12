const express = require("express");
const router = express.Router();

const { goTournamentArbre } = require("../controllers2/goTournamentArbre");

router.put("/arbre/:id", goTournamentArbre);

module.exports = router;
