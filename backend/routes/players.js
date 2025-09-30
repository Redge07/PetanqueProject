const express = require("express");
const router = express.Router();
const players = require("../controllers/players");

router.post("/inscription", players.inscription);
router.post("/connexion", players.connection);

module.exports = router;
