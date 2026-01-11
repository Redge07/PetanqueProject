const express = require("express");
const router = express.Router();

const gotournaments2 = require("../controllers2/gotournaments2");

router.put("/go_tournament2/:id", gotournaments2.go_tournament_arbre);

module.exports = router;
