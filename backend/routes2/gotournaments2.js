const express = require("express");
const router = express.Router();

const { goTournamentArbre } = require("../controllers2/goTournamentArbre");
const { goTournamentCascade } = require("../controllers2/goTournamentCascade");
const {
  goTournamentClassement,
} = require("../controllers2/goTournamentClassement");

router.put("/arbre/:id", goTournamentArbre);
router.put("/cascade/:id", goTournamentCascade);
router.put("/classement/:id", goTournamentClassement);

module.exports = router;
