const express = require("express");
const router = express.Router();
const log = require("../controllers/log");

router.post("/inscription", log.inscription);
router.post("/connexion", log.connection);
router.post("/register", log.register);
router.get("/positions/:id", log.positions);
router.get("/jwt/:id", log.getToken);

module.exports = router;
