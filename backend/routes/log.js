const express = require("express");
const router = express.Router();
const log = require("../controllers/log");

router.post("/inscription", log.inscription);
router.post("/connexion", log.connection);
router.post("/register_signin", log.registerSignin);

module.exports = router;
