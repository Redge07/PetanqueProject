const express = require("express");
const router = express.Router();
const gotournaments = require("../controllers/gotournaments");

router.put("/go_tournament/:id", gotournaments.go_tournament);
router.put("/win_player_arbre/:id", gotournaments.win_player_arbre);
router.put("/win_player_cascade/:id", gotournaments.win_player_cascade);
router.put("/win_player_classement/:id", gotournaments.win_player_classement);
router.post("/create_players/:id", gotournaments.create_players);
router.get("/charge_classement/:id", gotournaments.charge_classement);
router.put(
  "/create_arbre_classement/:id",
  gotournaments.create_arbre_classement
);
module.exports = router;
