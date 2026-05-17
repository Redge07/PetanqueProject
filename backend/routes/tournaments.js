const express = require("express");
const router = express.Router();
const tournaments = require("../controllers/tournaments");

router.get("/classement/:id", tournaments.charge_classement);
router.get("/:id", tournaments.charge);
router.delete("/players_attente/:id", tournaments.delete_players_attente);
router.delete("/:id", tournaments.delete_players_valid);
router.post("/create_players/:id", tournaments.create_players);
router.post("/:id", tournaments.add_player);
router.put("/recompense/:id", tournaments.modify_recompense);
router.put("/recompense_victoire/:id", tournaments.modify_recompense_victoire);
router.put("/:id", tournaments.valid);

module.exports = router;
