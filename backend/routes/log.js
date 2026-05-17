const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth");
const stripe = require("../controllers/stripe");
const users = require("../controllers/users");
const notifications = require("../controllers/notifications");

router.post("/inscription", auth.inscription);
router.post("/connexion", auth.connection);
router.post("/google", auth.googleAuth);
router.post("/verifToken", auth.verifToken);
router.get("/verify/:token", auth.verifyEmail);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password/:token", auth.resetPassword);

router.post("/register", users.register);
router.get("/positions/:id", users.positions);

router.post("/create-checkout-session/:id", stripe.checkoutSession);
router.post("/webhooks", stripe.webhooks);

router.get("/sendNotification/:infos", notifications.sendNotification);

module.exports = router;
