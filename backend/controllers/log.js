const { query } = require("../constants/query");

// API pour l'inscription d'un utilisateur
exports.inscription = async (req, res) => {
  try {
    const { pseudo, password } = req.body;
    let user = (
      await query("select * from users where pseudo = ?", [pseudo])
    )[0];
    // Si il y a déjà un utilisateur avec le pseudo renseigné alors on peut pas s'inscrire
    if (user)
      return res
        .status(200)
        .json({ res: "Il y a deja un pseudo portant ce nom" });
    // Sinon on peut inscrire le pseudo dans la table
    await query("insert into users (pseudo, password) values (?, ?)", [
      pseudo,
      password,
    ]);
    user = (await query("select * from users where pseudo = ?", [pseudo]))[0];
    query("insert into push_tokens (user_id) values (?)", [user.id]);
    console.log(user);
    return res.status(200).json({ res: 1, player: user });
  } catch (err) {
    return res.status(500).send(err);
  }
};

// API pour la connexion d'un utilisateur
exports.connection = async (req, res) => {
  const { pseudo, password } = req.body;
  const user = await query(
    "select * from users where pseudo = ? and password = ?",
    [pseudo, password],
  );
  if (user[0]) {
    // results = [ { id: 6, pseudo: 'Regis', password: 'aaaaaa' } ]

    res.json({ res: 1, player: user[0] });
  } else {
    res.json({ res: 0 });
  }
};

exports.register = async (req, res) => {
  const pushToken = req.body.token;
  const id = req.body.id;
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  await query(
    "update push_tokens set token = ?, longitude = ?, latitude = ?, last_position_at = NOW() where user_id = ?",
    [pushToken, longitude, latitude, id],
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

exports.getToken = async (req, res) => {
  const id = req.params.id;
  res.status(200).json({ token: "JWT : " + id });
};
