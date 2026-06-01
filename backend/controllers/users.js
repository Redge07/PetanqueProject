const { query, withTransaction } = require("../constants/query");
const bcrypt = require("bcrypt");

// API pour mettre a jour des données d'un utilisateur quand il se connecte
exports.register = async (req, res) => {
  try {
    const pushToken = req.body.token;
    const id = req.body.id;
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;
    // Il met a jour la position et le token qui permet d'envoyer des notifications a l'utilisateur
    await query(
      `update push_tokens ${pushToken ? "set token = ?, longitude = ?, latitude = ?, last_position_at = NOW()" : "set longitude = ?, latitude = ?, last_position_at = NOW()"} where user_id = ?`,
      pushToken
        ? [pushToken, longitude, latitude, id]
        : [longitude, latitude, id],
    );
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// API pour récupérer le profil d'un utilisateur
exports.getProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const user = (
      await query("SELECT id, pseudo, email FROM users WHERE id = ?", [id])
    )[0];
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const organized = await query(
      "SELECT id, name, style, start FROM tournaments WHERE admin = ? ORDER BY id DESC LIMIT 10",
      [id],
    );

    const currentPlayer = (
      await query(
        "SELECT p.id_tournament, t.name, t.style FROM players p JOIN tournaments t ON p.id_tournament = t.id WHERE p.id_user = ?",
        [id],
      )
    )[0] || null;

    return res.status(200).json({ user, organized, currentPlayer });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

// API pour changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { oldPassword, newPassword } = req.body;
    const user = (
      await query("SELECT * FROM users WHERE id = ?", [id])
    )[0];
    if (!user) return res.status(404).json({ res: 0, message: "Utilisateur introuvable" });

    if (user.password) {
      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid)
        return res.status(200).json({ res: 0, message: "Ancien mot de passe incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);
    return res.status(200).json({ res: 1, message: "Mot de passe mis à jour" });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

// API pour supprimer un compte (RGPD)
exports.deleteAccount = async (req, res) => {
  try {
    const id = req.params.id;
    await withTransaction(async (conn) => {
      await query("DELETE FROM players WHERE id_user = ?", [id], conn);
      await query("DELETE FROM push_tokens WHERE user_id = ?", [id], conn);
      const tournois = await query("SELECT id FROM tournaments WHERE admin = ?", [id], conn);
      for (const t of tournois) {
        await query("DELETE FROM players WHERE id_tournament = ?", [t.id], conn);
        await query("DELETE FROM matches WHERE id_tournament = ?", [t.id], conn);
        await query("DELETE FROM matches2 WHERE id_tournament = ?", [t.id], conn);
        await query("DELETE FROM tournaments WHERE id = ?", [t.id], conn);
      }
      await query("DELETE FROM users WHERE id = ?", [id], conn);
    });
    return res.status(200).json({ res: 1, message: "Compte supprimé avec succès" });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

// API pour récupérer les positions de tous les joueurs d'un tournoi
exports.positions = async (req, res) => {
  const idTournament = req.params.id;
  const positions = await query(
    "SELECT p.latitude, p.longitude, p.last_position_at, pl.id_tournament, pl.numero, pl.pseudo FROM users u LEFT JOIN push_tokens p ON u.id = p.user_id LEFT JOIN players pl ON u.id = pl.id_user WHERE id_tournament = ?",
    [idTournament],
  );
  res.status(200).json(positions);
};
