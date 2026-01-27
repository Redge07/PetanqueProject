const express = require("express");
const router = express.Router();

const {
  goTournamentArbre,
} = require("../controllers2/goTournaments/goTournamentArbre");
const {
  goTournamentCascade,
} = require("../controllers2/goTournaments/goTournamentCascade");
const {
  goTournamentClassement,
} = require("../controllers2/goTournaments/goTournamentClassement");

router.put("/arbre/:id", goTournamentArbre);
router.put("/cascade/:id", goTournamentCascade);
router.put("/classement/:id", goTournamentClassement);

module.exports = router;
