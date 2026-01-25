const express = require("express");
const {
  winnerArbre,
  winnerCascade,
  winnerClassement,
} = require("../controllers2/winner");
const router = express.Router();

router.put("/arbre/:id", winnerArbre);
router.put("/cascade/:id", winnerCascade);
router.put("/classement/:id", winnerClassement);

module.exports = router;
