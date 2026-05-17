const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Fonction pour envoyer un mail a une personne
exports.sendMail = async (email, subject, token) => {
  try {
    // Sera le lien de la page pour valider de manière officielle l'inscription de l'utilisateur
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

// Fonction pour envoyer un mail de réinitialisation de mot de passe
exports.sendResetPasswordMail = async (email, token) => {
  try {
    const link = `${process.env.FRONTEND_URL}reset-password/${token}`;
    await resend.emails.send({
      from: `"Pétanque Management" <contact@stat-football.fr>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${link}">${link}</a>
        <p>Ce lien expire dans 1 heure.</p>
      `,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};
