const express = require("express");
const router = express.Router();
const organisateurs = require("../controllers/organisateurs");
const { verifyToken, verifyOrganizer } = require("../controllers/auth");

// Vérifie que l'utilisateur connecté accède bien à ses propres données
const verifySelf = (req, res, next) => {
  if (String(req.user.id) !== String(req.params.admin))
    return res.status(403).json({ message: "Accès refusé" });
  next();
};

router.get("/:admin", verifyToken, verifySelf, organisateurs.charge);
router.post("/:admin", verifyToken, verifySelf, organisateurs.create);
router.delete("/:id", verifyToken, verifyOrganizer, organisateurs.delete);

module.exports = router;
