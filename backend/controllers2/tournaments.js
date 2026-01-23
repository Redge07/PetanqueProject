const { query } = require("../constants/query");

const status = {
  noStart: 0,
  start: 1,
  end: 2,
};

exports.charge = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const tournament = (
      await query("select * from tournaments where id = ?", [idTournament])
    )[0];
    const vainqueurs = {
      vainqueurA: tournament.vainqueurA,
      vainqueurB: tournament.vainqueurB,
      vainqueurC: tournament.vainqueurC,
    };
    if (tournament.start == 0) {
      const listPlayers = await query(
        "select * from players where id_tournament = ?",
        [idTournament],
      );
      return res.status(200).json({
        res: status.noStart,
        results: listPlayers,
        style: tournament.style,
      });
    }
    const matches = await query(
      "select * from matches2 where id_tournament = ?",
      [idTournament],
    );
    if (tournament.start == 1) {
      return res.status(200).json({
        res: status.start,
        matches,
        style: tournament.style,
        vainqueurs,
      });
    }
    if (tournament.start == 2) {
      return res
        .status(200)
        .json({ res: status.end, matches, vainqueur: tournament.vainqueur });
    }
  } catch (err) {}
};
