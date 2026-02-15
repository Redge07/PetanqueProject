const { query } = require("../constants/query");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendMail } = require("../constants/sendMail");
const { log } = require("console");

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign({ player: user }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

// API pour l'inscription d'un utilisateur
exports.inscription = async (req, res) => {
  log("Tentative d'inscription pour l'email:", req.body.email);
  try {
    const { pseudo, email, password } = req.body;
    let user = (await query("select * from users where email = ?", [email]))[0];
    // Si il y a déjà un utilisateur avec le pseudo renseigné alors on peut pas s'inscrire
    if (user)
      return res.status(200).json({ res: 0, message: "Email déjà utilisé" });
    // Sinon on peut inscrire le pseudo dans la table
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await query(
      "insert into users (pseudo, email, password, verification_token) values (?, ?, ?, ?)",
      [pseudo, email, hashedPassword, verificationToken],
    );
    await sendMail(email, "Vérification de votre compte", verificationToken);
    return res
      .status(200)
      .json({ res: 1, message: "Compte crée et mail envoyé" });
  } catch (err) {
    log("Erreur lors de l'inscription:", err);
    return res.status(500).send(err);
  }
};

// API pour la connexion d'un utilisateur
exports.connection = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = (
      await query("select * from users where email = ?", [email])
    )[0];
    if (!user) {
      return res
        .status(200)
        .json({ res: 0, message: "Email ou mot de passe incorrect" });
    }
    if (!user.is_verified) {
      return res.status(200).json({
        res: 0,
        message: "Veuillez vérifier votre email avant de vous connecter",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ res: 0, message: "Email ou mot de passe incorrect" });
    }

    // results = [ { id: 6, pseudo: 'Regis', password: 'aaaaaa' } ]
    const token = generateToken(user);
    res.json({ res: 1, player: user, token });
  } catch (err) {
    log("Erreur lors de la connexion:", err);
    return res.status(500).send(err);
  }
};

exports.register = async (req, res) => {
  const pushToken = req.body.token;
  const id = req.body.id;
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  await query(
    `update push_tokens ${pushToken ? "set token = ?, longitude = ?, latitude = ?, last_position_at = NOW()" : "set longitude = ?, latitude = ?, last_position_at = NOW()"} where user_id = ?`,
    pushToken
      ? [pushToken, longitude, latitude, id]
      : [longitude, latitude, id],
  );
  res.json({ ok: true });
};

exports.positions = async (req, res) => {
  const idTournament = req.params.id;
  const positions = await query(
    "SELECT p.latitude, p.longitude, p.last_position_at, pl.id_tournament, pl.numero, pl.pseudo FROM users u LEFT JOIN push_tokens p ON u.id = p.user_id LEFT JOIN players pl ON u.id = pl.id_user WHERE id_tournament = ?",
    [idTournament],
  );
  console.log(positions);

  res.status(200).json(positions);
};

exports.verifToken = async (req, res) => {
  const token = req.body.token;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ res: true, player: decoded.player });
  } catch (err) {
    res.json({ res: false });
  }
};

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

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = (
      await query("select * from users where verification_token = ?", [token])
    )[0];
    if (!user) {
      return res.status(200).send("Token invalide");
    }
    await query(
      "update users set is_verified = 1, verification_token = NULL where id = ?",
      [user.id],
    );
    await query("insert into push_tokens (user_id) values (?)", [user.id]);
    res.send("Email vérifié avec succès");
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};
