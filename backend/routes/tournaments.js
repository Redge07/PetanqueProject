const express = require("express");
const router = express.Router();
const tournaments = require("../controllers/tournaments");

router.get("/charge/:id", tournaments.charge);
router.delete(
  "/delete_players_attente/:id",
  tournaments.delete_players_attente
);
router.delete("/delete_players_valid/:id", tournaments.delete_players_valid);
router.put("/valid/:id", tournaments.valid);
router.post("/add_player/:id", tournaments.add_player);

module.exports = router;
