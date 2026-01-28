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
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

exports.charge_classement = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const matches = await query(
      "select * from matches2 where id_tournament = ? and round < 4",
      [idTournament],
    );
    let players = [];
    matches.forEach((match) => {
      let playerA = players.find((p) => p.numero == match.id_playerA);
      if (!playerA) {
        players.push({
          numero: match.id_playerA,
          pseudo: match.pseudo_A,
          points:
            match.id_winner == match.id_playerA
              ? match.score_A + 5
              : match.score_A,
          nb_matchs_jouer: match.id_winner > 0 ? 1 : 0,
        });
      } else if (match.id_winner > 0) {
        const points = playerA.points;
        const nb_matchs_jouer = playerA.nb_matchs_jouer;
        playerA.points =
          points +
          (match.id_winner == playerA.numero
            ? match.score_A + 5
            : match.score_A);
        playerA.nb_matchs_jouer = nb_matchs_jouer + 1;
      }
      let playerB = players.find((p) => p.numero == match.id_playerB);
      if (!playerB) {
        players.push({
          numero: match.id_playerB,
          pseudo: match.pseudo_B,
          points:
            match.id_winner == match.id_playerB
              ? match.score_B + 5
              : match.score_B,
          nb_matchs_jouer: match.id_winner > 0 ? 1 : 0,
        });
      } else if (match.id_winner > 0) {
        const points = playerB.points;
        const nb_matchs_jouer = playerB.nb_matchs_jouer;
        playerB.points =
          points +
          (match.id_winner == playerB.numero
            ? match.score_B + 5
            : match.score_B);
        playerB.nb_matchs_jouer = nb_matchs_jouer + 1;
      }
    });
    return res.status(200).json(players);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

exports.delete_players_attente = async (req, res) => {
  try {
    const idUser = req.params.id;
    await query("delete from players where id_user = ?", [idUser]);
    return res.status(200).json({
      res: 1,
      id: idUser,
      msg: "Le joueur a été supprimé du tournoi",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

exports.delete_players_valid = async (req, res) => {
  try {
    const { numero } = req.body;
    const idTournament = req.params.id;
    await query("delete from players where numero = ? and id_tournament = ?", [
      numero,
      idTournament,
    ]);
    return res.status(200).json({
      res: 1,
      numero: req.body.numero,
      msg: "Le joueur a été supprimé du tournoi",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

exports.valid = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const idUser = req.body.id_user;
    const listPlayers = await query(
      "select * from players where id_tournament = ? and valider = 1",
      [idTournament],
    );
    await query(
      "update players set valider = 1, numero = ? where id_user = ?",
      [listPlayers.length + 1, idUser],
    );
    return res.status(200).json({
      res: 1,
      id: idTournament,
      msg: "Le joueur a été ajouté au tournoi",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

exports.add_player = async (req, res) => {
  try {
    const { pseudo } = req.body;
    const idTournament = req.params.id;
    const listPlayers = await query(
      "select * from players where id_tournament = ? and valider = 1",
      [idTournament],
    );
    await query(
      "insert into players (pseudo, id_versus, class, id_tournament, id_user, valider, numero) values(?, 0, 0, ?, -1, 1, ?)",
      [pseudo, idTournament, listPlayers.length + 1],
    );
    return res.status(200).send("Le joueur a été ajouté");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
