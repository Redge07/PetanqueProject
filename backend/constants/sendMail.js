const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendMail = async (email, subject, token) => {
  try {
    const link = `${process.env.FRONTEND_URL}verify/${token}`;
    await resend.emails.send({
      from: `"Pétanque Management" <contact@stat-football.fr>`,
      to: email,
      subject: subject,
      html: `
      <h2>Bienvenue</h2>
      <p>Cliquez pour vérifier votre compte :</p>
      <a href="${link}">${link}</a>
    `,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};
