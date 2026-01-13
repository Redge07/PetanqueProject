const express = require("express");
const router = express.Router();

const { goTournamentArbre } = require("../controllers2/goTournamentArbre");
const { goTournamentCascade } = require("../controllers2/goTournamentCascade");

router.put("/arbre/:id", goTournamentArbre);
router.put("/cascade/:id", goTournamentCascade);

module.exports = router;
