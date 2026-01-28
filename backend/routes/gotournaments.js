const express = require("express");
const router = express.Router();

const {
  goTournamentArbre,
} = require("../controllers/goTournaments/goTournamentArbre");
const {
  goTournamentCascade,
} = require("../controllers/goTournaments/goTournamentCascade");
const {
  goTournamentClassement,
} = require("../controllers/goTournaments/goTournamentClassement");
const {
  create_players,
} = require("../controllers/goTournaments/goTournamentArbre");

router.put("/arbre/:id", goTournamentArbre);
router.put("/cascade/:id", goTournamentCascade);
router.put("/classement/:id", goTournamentClassement);
router.post("/create_players/:id", create_players);

module.exports = router;
