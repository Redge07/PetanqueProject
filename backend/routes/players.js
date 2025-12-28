const express = require("express");
const router = express.Router();
const players = require("../controllers/players");

router.get("/:id", players.charge);
router.get("/search/:id", players.search);
router.post("/", players.add_player);
router.delete("/:id", players.delete_player);

module.exports = router;
