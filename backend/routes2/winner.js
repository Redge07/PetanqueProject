const express = require("express");
const { winnerArbre, winnerCascade } = require("../controllers2/winner");
const router = express.Router();

router.put("/arbre/:id", winnerArbre);
router.put("/cascade/:id", winnerCascade);

module.exports = router;
