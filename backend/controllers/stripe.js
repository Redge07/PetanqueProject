const { Stripe } = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.checkoutSession = async (req, res) => {
  try {
    const idTournament = req.params.id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Tournoi numéro " + idTournament,
            },
            unit_amount: 3000, // 30€
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}success`,
      cancel_url: `${process.env.FRONTEND_URL}cancel`,
      metadata: {
        idTournament,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.webhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("❌ Signature invalide :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🎯 Paiement réussi
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const tournamentId = session.metadata.idTournament;

    await query("update tournaments set premium = 1 where id = ?", [
      tournamentId,
    ]);

    console.log("✅ Paiement validé pour tournoi :", tournamentId);
  }

  res.json({ received: true });
};
