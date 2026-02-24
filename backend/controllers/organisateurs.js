const { query } = require("../constants/query");

// API pour charger les tournois du users
exports.charge = async (req, res) => {
  try {
    const admin = req.params.admin;
    const tournaments = await query(
      "select * from tournaments where admin = ?",
      [admin],
    );
    if (tournaments.length > 0)
      return res.status(200).json({ res: 1, results: tournaments });
    return res.status(200).json({ res: 0 });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// API pour créer un tournoi
exports.create = async (req, res) => {
  try {
    const admin = req.params.admin;
    const { name, style } = req.body;
    await query(
      "insert into tournaments (name, admin, style, premium) values(?, ?, ?, 0)",
      [name, admin, style],
    );
    return res.send(`Votre tournoi ${name} a bien été crée`);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

// API pour supprimer un tournoi
exports.delete = async (req, res) => {
  try {
    const idTournament = req.params.id;
    await query("delete from players where id_tournament = ?", [idTournament]);
    await query("delete from matches where id_tournament = ?", [idTournament]);
    await query("delete from matches2 where id_tournament = ?", [idTournament]);
    await query("delete from tournaments where id = ?", [idTournament]);
    return res
      .status(200)
      .send(`Le tournoi numéro ${idTournament} à bien été supprimé`);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
