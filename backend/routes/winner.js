const express = require("express");
const { arbre } = require("../controllers/winner/Arbre");
const { cascade } = require("../controllers/winner/Cascade");
const { classement } = require("../controllers/winner/Classement");
const router = express.Router();

router.put("/arbre/:id", arbre);
router.put("/cascade/:id", cascade);
router.put("/classement/:id", classement);

module.exports = router;
