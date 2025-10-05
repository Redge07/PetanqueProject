const express = require("express");
const router = express.Router();
const tournaments = require("../controllers/tournaments");

router.get("/charge/:id", tournaments.charge);
router.delete("/delete_players/:id", tournaments.delete_players);
router.put("/valid/:id", tournaments.valid);
router.post("/add_player/:id", tournaments.add_player);

module.exports = router;
