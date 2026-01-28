const { query } = require("../../constants/query");
const { defineBigWinner } = require("../../constants/defineBigWinner");
const { placePlayerMatches2 } = require("../../constants/placePlayerMatches2");
const { updatePlayers } = require("../../constants/updatePlayers");

exports.arbre = async (req, res) => {
  console.log("yo");

  try {
    const idTournament = req.params.id;
    const { win, lose, pseudoWin, tour, groupe = "" } = req.body;
    await query(
      "update matches2 set id_winner = ?, end = 1 where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
      [win, idTournament, win, win],
    );
    if (tour == 1) {
      await defineBigWinner(win, lose, idTournament, pseudoWin, groupe);
      return res.status(200).send("Victoire validé");
    }
    const matches = await query(
      "select * from matches2 where id_tournament = ? and class = ? and id_playerB = 0 and groupe = ?",
      [idTournament, tour / 2, groupe],
    );
    await placePlayerMatches2(
      matches,
      win,
      pseudoWin,
      idTournament,
      ">= 1",
      groupe,
    );

    await updatePlayers([win, lose], idTournament);
    return res.status(200).send("Victoire validé");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
