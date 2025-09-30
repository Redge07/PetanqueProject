const express = require("express");
const router = express.Router();
const players = require("../controllers/players");

router.get("/charge/:id", players.charge);
router.get("/search/:id", players.search);
router.post("/add_player", players.add_player);
router.delete("/delete_player/:id", players.delete_player);

module.exports = router;
