const express = require("express");
const router = express.Router();
const { verifyToken, verifyOrganizer } = require("../controllers/auth");

const { goTournamentArbre } = require("../controllers/goTournaments/goTournamentArbre");
const { goTournamentCascade } = require("../controllers/goTournaments/goTournamentCascade");
const { goTournamentClassement } = require("../controllers/goTournaments/goTournamentClassement");

router.put("/arbre/:id", verifyToken, verifyOrganizer, goTournamentArbre);
router.put("/cascade/:id", verifyToken, verifyOrganizer, goTournamentCascade);
router.put("/classement/:id", verifyToken, verifyOrganizer, goTournamentClassement);

module.exports = router;
