const express = require("express");
const router = express.Router();
const log = require("../controllers/log");

router.post("/inscription", log.inscription);
router.post("/connexion", log.connection);
router.post("/register", log.register);
router.get("/positions", log.positions);

module.exports = router;
