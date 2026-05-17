const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendNotification = async (req, res) => {
  try {
    const { infos } = req.params;

    await resend.emails.send({
      // from: `"Pétanque Management" <onboarding@resend.dev>`,
      from: `"Pétanque Management" <contact@stat-football.fr>`,
      to: "mathonregis28@gmail.com",
      // to: "baptistemarhon@icloud.com",
      subject: "Notification",
      html: `
        <div style="font-family: Arial; padding:20px;">
      <h1 style="color:#ff7b00;">🏆 Pétanque Project</h1>
      <p>Petit test pour l'envoi de mail, c'est toujours sympa</p>
      <div style="
        background:#f4f4f4;
        padding:15px;
        border-radius:8px;
        margin:10px 0;
      ">
        ${infos}
      </div>
      <p style="font-size:12px;color:gray;">
        Cet email a été envoyé automatiquement.
      </p>
    </div>
      `,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
