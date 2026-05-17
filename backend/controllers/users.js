const { query } = require("../constants/query");

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

// API pour récupérer les positions de tous les joueurs d'un tournoi
exports.positions = async (req, res) => {
  const idTournament = req.params.id;
  const positions = await query(
    "SELECT p.latitude, p.longitude, p.last_position_at, pl.id_tournament, pl.numero, pl.pseudo FROM users u LEFT JOIN push_tokens p ON u.id = p.user_id LEFT JOIN players pl ON u.id = pl.id_user WHERE id_tournament = ?",
    [idTournament],
  );
  console.log(positions);

  res.status(200).json(positions);
};
