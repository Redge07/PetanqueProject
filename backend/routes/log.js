const express = require("express");
const router = express.Router();
const log = require("../controllers/log");

router.post("/inscription", log.inscription);
router.post("/connexion", log.connection);
router.post("/register", log.register);
router.get("/positions/:id", log.positions);
router.post("/verifToken", log.verifToken);
router.get("/sendNotification/:infos", log.sendNotification);
router.get("/verify/:token", log.verifyEmail);
router.post("/create-checkout-session/:id", log.checkoutSession);
router.post("/webhooks", log.webhooks);
router.post("/google", log.googleAuth);

module.exports = router;
