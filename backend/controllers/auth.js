const { query, withTransaction } = require("../constants/query");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { sendMail, sendResetPasswordMail } = require("../constants/sendMail");

const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware : vérifie que le token JWT est présent et valide
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Token manquant" });
  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// Middleware : vérifie que l'utilisateur connecté est bien l'organisateur du tournoi (:id)
exports.verifyOrganizer = async (req, res, next) => {
  try {
    const idTournament = req.params.id;
    const [tournament] = await query(
      "select admin from tournaments where id = ?",
      [idTournament],
    );
    if (!tournament)
      return res.status(404).json({ message: "Tournoi introuvable" });
    if (String(tournament.admin) !== String(req.user.id))
      return res.status(403).json({ message: "Accès refusé" });
    next();
  } catch {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Fonction pour générer un token JWT pour un utilisateur
const generateToken = (user) => {
  return jwt.sign({ user }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

// API pour l'inscription d'un utilisateur
exports.inscription = async (req, res) => {
  try {
    // On récupère l'email, le pseudo et le password rentré par l'utilisateur
    const { pseudo, email, password } = req.body;
    const reponse = await withTransaction(async (conn) => {
      let user = (
        await query("select * from users where email = ?", [email], conn)
      )[0];
      // Si il y a déjà un utilisateur avec l'email renseigné alors on peut pas s'inscrire
      if (user) return { res: 0, message: "Email déjà utilisé" };
      // Sinon on peut lancer l'inscription dans la base de données
      const hashedPassword = await bcrypt.hash(password, 10);
      // On génère un token de vérification aléatoire qui nous permettra d'avoir un lien unique pour valider le fait que l'utilisateur a reçu le mail d'inscription et qu'il clique sur le lien pour valider son inscription
      const verificationToken = crypto.randomBytes(32).toString("hex");
      await query(
        "insert into users (pseudo, email, password, verification_token) values (?, ?, ?, ?)",
        [pseudo, email, hashedPassword, verificationToken],
        conn,
      );
      await sendMail(email, "Vérification de votre compte", verificationToken);
      return { res: 1, message: "Compte crée et mail envoyé" };
    });
    return res.status(200).json(reponse);
  } catch (err) {
    console.log("Erreur lors de l'inscription:", err);
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
    // Si le compte existe bien mais qu'il n'a pas encore été vérifié alors on refuse la connexion (ça veut que la personne n'a pas ouvert le mail d'inscription et n'a pas pas cliqué sur le lien dans le mail)
    if (!user.is_verified) {
      return res.status(200).json({
        res: 0,
        message: "Veuillez vérifier votre email avant de vous connecter",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password ? user.password : "",
    );
    if (!isPasswordValid) {
      return res.json({ res: 0, message: "Email ou mot de passe incorrect" });
    }
    // results = [ { id: 6, pseudo: 'Regis', password: 'aaaaaa' } ]
    // Si tout est bon pour la connexion on peut créer un token qui permettra de revenir sur le site sans avoir besoin de se reconnecter a nouveau
    const token = generateToken(user);
    res.json({ res: 1, user, token, message: "Connexion réussi" });
  } catch (err) {
    console.log("Erreur lors de la connexion:", err);
    return res.status(500).send(err);
  }
};

exports.googleAuth = async (req, res) => {
  const { tokenGoogle } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenGoogle,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const pseudo = payload.name;
    let user = (await query("select * from users where email = ?", [email]))[0];
    if (!user) {
      await query(
        "insert into users (pseudo, email, is_verified) values (?, ?, 1)",
        [pseudo, email],
      );
      user = (await query("select * from users where email = ?", [email]))[0];
      await query("insert into push_tokens (user_id) values (?)", [user.id]);
    }
    const token = generateToken(user);
    res.json({ res: 1, user, token, message: "Connexion réussi" });
  } catch (err) {
    console.log("Erreur lors de la connexion:", err);
    return res.status(500).send(err);
  }
};

// API qui permet de vérifier si le token stocké dans le localStorage est bon et donc permettre a la personne de se connecter snas passer par le formulaire de connexion classique
exports.verifToken = async (req, res) => {
  const token = req.body.token;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ res: true, user: decoded.user });
  } catch (err) {
    console.log(err);
    res.status(401).json({ res: false });
  }
};

// API pour confirmer l'inscription d'un utilisateur de manière officielle
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const message = await withTransaction(async (conn) => {
      const user = (
        await query(
          "select * from users where verification_token = ?",
          [token],
          conn,
        )
      )[0];
      if (!user) {
        return "Token invalide";
      }
      // On dit que le user est officiellement vérifié
      await query(
        "update users set is_verified = 1, verification_token = NULL where id = ?",
        [user.id],
        conn,
      );
      // On en profite pour lui créer une ligne qui permettra de stocker son token de notifications et sa position quand il se connectera pour la première fois
      await query(
        "insert into push_tokens (user_id) values (?)",
        [user.id],
        conn,
      );
      return "Email vérifié avec succès";
    });
    res.status(200).send(message);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

// API pour demander la réinitialisation du mot de passe
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = (
      await query("select * from users where email = ?", [email])
    )[0];
    // Si aucun utilisateur ne correspond à cet email on renvoie quand même un succès
    // pour ne pas révéler si l'email existe ou non en base (sécurité)
    if (!user) {
      return res
        .status(200)
        .json({ message: "Si cet email existe, un mail a été envoyé" });
    }
    // On génère un token aléatoire et une date d'expiration d'1 heure
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await query(
      "update users set reset_token = ?, reset_token_expires = ? where email = ?",
      [resetToken, expires, email],
    );
    // On envoie le mail avec le lien de réinitialisation
    await sendResetPasswordMail(email, resetToken);
    return res
      .status(200)
      .json({ message: "Si cet email existe, un mail a été envoyé" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Une erreur est survenue" });
  }
};

// API pour réinitialiser le mot de passe avec le token reçu par mail
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const message = await withTransaction(async (conn) => {
      // On vérifie que le token existe et n'est pas expiré
      const user = (
        await query(
          "select * from users where reset_token = ? and reset_token_expires > NOW()",
          [token],
          conn,
        )
      )[0];
      if (!user) {
        return { res: 0, message: "Token invalide ou expiré" };
      }
      // On hash le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      // On met à jour le mot de passe et on supprime le token
      await query(
        "update users set password = ?, reset_token = NULL, reset_token_expires = NULL where id = ?",
        [hashedPassword, user.id],
        conn,
      );
      return { res: 1, message: "Mot de passe réinitialisé avec succès" };
    });
    return res.status(200).json(message);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Une erreur est survenue" });
  }
};
