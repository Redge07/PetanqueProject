const { query } = require("../constants/query");
const { updatePlayers } = require("../constants/updatePlayers");

exports.winnerArbre = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const { win, lose, pseudoWin, tour } = req.body;
    await query(
      "update matches2 set id_winner = ?, end = 1 where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
      [win, idTournament, win, win]
    );
    const matches = await query(
      "select * from matches2 where id_tournament = ? and class = ? and id_playerB = 0",
      [idTournament, tour / 2]
    );
    const minNumberNoPlayerA = Math.min(
      ...matches
        .filter((match) => match.id_playerA == 0)
        .map((match) => match.number)
    );
    const minNumberNoPlayerB = Math.min(
      ...matches
        .filter((match) => match.id_playerB == 0)
        .map((match) => match.number)
    );
    const lettre = minNumberNoPlayerA != Infinity ? "A" : "B";
    const matchNumber = lettre == "A" ? minNumberNoPlayerA : minNumberNoPlayerB;
    await query(
      `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ?`,
      [win, pseudoWin, idTournament, matchNumber]
    );
    await updatePlayers([win, lose], idTournament);
    return res.status(200).send("Victoire validé");
  } catch (err) {
    return res.status(500).send(err);
  }
};
