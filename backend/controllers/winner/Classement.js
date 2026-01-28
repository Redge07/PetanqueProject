const { query } = require("../../constants/query");
const { updatePlayers } = require("../../constants/updatePlayers");

exports.classement = async (req, res) => {
  try {
    const { win, lose, scoreWin, scoreLose, round } = req.body;
    const idTournament = req.params.id;
    const matches = await query(
      "select * from matches2 where id_tournament = ?",
      [idTournament],
    );
    const match = matches.find(
      (match) =>
        (match.id_playerA == win || match.id_playerB == win) &&
        match.end == 0 &&
        match.id_tournament == idTournament,
    );
    const lettre = match.id_playerA == win ? "A" : "B";
    await query(
      "update matches2 set id_winner = ?, end = 1, score_A = ?, score_B = ? where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
      [
        win,
        lettre == "A" ? scoreWin : scoreLose,
        lettre == "B" ? scoreWin : scoreLose,
        idTournament,
        win,
        win,
      ],
    );
    if (round < 3) {
      for (let i = 0; i < 2; i++) {
        const numero = i == 0 ? win : lose;
        const match = matches.find(
          (match) =>
            match.round == round + 1 &&
            match.id_tournament == idTournament &&
            (match.id_playerA == numero || match.id_playerB == numero),
        );
        await query(
          "update matches2 set end = ? where round = ? and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
          [match.end + 1, round + 1, idTournament, numero, numero],
        );
      }
      await updatePlayers([win, lose], idTournament);
    }
    if (round == 3) {
      for (let i = 0; i < 2; i++) {
        const numero = i == 0 ? win : lose;
        await query(
          "update players set id_versus = 0, round = 4, dispo = 0 where id_tournament = ? and numero = ?",
          [idTournament, numero],
        );
      }
    }
    return res.status(200).send("Victoire !");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
