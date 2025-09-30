const express = require("express");
const router = express.Router();
const organisateurs = require("../controllers/organisateurs");

router.get("/charge/:admin", organisateurs.charge);
router.get("/create/:admin", organisateurs.create);
router.get("/delete/:id", organisateurs.delete);

module.exports = router;
