const express = require("express");
const router = express.Router();
const players = require("../controllers/players");

router.get("/available", players.listAvailable);
router.get("/search-name/:name", players.searchByName);
router.get("/search/:id", players.search);
router.get("/:id", players.charge);
router.post("/", players.add_player);
router.delete("/:id", players.delete_player);

module.exports = router;
