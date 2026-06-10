const express = require("express");
const router = express.Router();
const tournaments = require("../controllers/tournaments");
const { verifyToken, verifyOrganizer } = require("../controllers/auth");

// Lecture publique (participants et organisateurs)
router.get("/classement/:id", tournaments.charge_classement);
router.get("/:id", tournaments.charge);

// Écriture : organisateur uniquement
router.delete("/players_attente/:id", verifyToken, verifyOrganizer, tournaments.delete_players_attente);
router.delete("/:id", verifyToken, verifyOrganizer, tournaments.delete_players_valid);
router.post("/create_players/:id", verifyToken, verifyOrganizer, tournaments.create_players);
router.post("/:id", verifyToken, verifyOrganizer, tournaments.add_player);
router.put("/recompense/:id", verifyToken, verifyOrganizer, tournaments.modify_recompense);
router.put("/recompense_victoire/:id", verifyToken, verifyOrganizer, tournaments.modify_recompense_victoire);
router.put("/prix_entree/:id", verifyToken, verifyOrganizer, tournaments.modify_prix_entree);
router.put("/:id", verifyToken, verifyOrganizer, tournaments.valid);

module.exports = router;
