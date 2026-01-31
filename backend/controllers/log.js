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
    return res.status(200).json({ res: 1, player: user });
  } catch (err) {
    console.log(err);
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
