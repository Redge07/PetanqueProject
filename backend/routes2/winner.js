const express = require("express");
const { winnerArbre } = require("../controllers2/winner");
const router = express.Router();

router.put("/arbre/:id", winnerArbre);

module.exports = router;
