const express = require("express");
const router = express.Router();
const organisateurs = require("../controllers/organisateurs");

router.get("/:admin", organisateurs.charge);
router.post("/:admin", organisateurs.create);
router.delete("/:id", organisateurs.delete);

module.exports = router;
