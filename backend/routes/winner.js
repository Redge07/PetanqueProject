const express = require("express");
const router = express.Router();
const { verifyToken, verifyOrganizer } = require("../controllers/auth");
const { arbre } = require("../controllers/winner/Arbre");
const { cascade } = require("../controllers/winner/Cascade");
const { classement } = require("../controllers/winner/Classement");

router.put("/arbre/:id", verifyToken, verifyOrganizer, arbre);
router.put("/cascade/:id", verifyToken, verifyOrganizer, cascade);
router.put("/classement/:id", verifyToken, verifyOrganizer, classement);

module.exports = router;
