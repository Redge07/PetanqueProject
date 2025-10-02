const express = require("express");
const router = express.Router();
const organisateurs = require("../controllers/organisateurs");

router.get("/charge/:admin", organisateurs.charge);
router.post("/create/:admin", organisateurs.create);
router.delete("/delete/:id", organisateurs.delete);

module.exports = router;
