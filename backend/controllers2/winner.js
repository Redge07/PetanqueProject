const { query } = require("../constants/query");
const { updatePlayers } = require("../constants/updatePlayers");

const defineBigWinner = async (
  win,
  lose,
  idTournament,
  pseudoWin,
  groupe,
  tour = 0.5,
) => {
  await query("delete from players where numero = ? and id_tournament = ?", [
    lose,
    idTournament,
  ]);
  await query(
    "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
    [tour, idTournament, win],
  );
  if (groupe) {
    await query(`update tournaments set vainqueur${groupe} = ? where id = ?`, [
      pseudoWin,
      idTournament,
    ]);
  } else {
    await query(
      "update tournaments set vainqueur = ?, start = 2 where id = ?",
      [pseudoWin, idTournament],
    );
  }
};

const placePlayerMatches2 = async (
  matches,
  numero,
  pseudo,
  idTournament,
  tour,
  groupe,
) => {
  const minNumberNoPlayerA = Math.min(
    ...matches
      .filter((match) => match.id_playerA == 0)
      .map((match) => match.number),
  );
  const minNumberNoPlayerB = Math.min(
    ...matches
      .filter((match) => match.id_playerB == 0)
      .map((match) => match.number),
  );
  const lettre = minNumberNoPlayerA != Infinity ? "A" : "B";
  const matchNumber = lettre == "A" ? minNumberNoPlayerA : minNumberNoPlayerB;
  await query(
    `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ? and class ${tour} and groupe = ?`,
    [numero, pseudo, idTournament, matchNumber, groupe],
  );
};

exports.winnerArbre = async (req, res) => {
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
    return res.status(500).send(err);
  }
};

exports.winnerCascade = async (req, res) => {
  try {
    // ------------------------ La Base ------------------------
    const idTournament = req.params.id;
    const { win, lose, pseudoWin, pseudoLose, tour, barrage, groupe, round } =
      req.body;
    await query(
      "update matches2 set id_winner = ?, end = 1 where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
      [win, idTournament, win, win],
    );
    // ---------------------- Match dans la phase ----------------------
    if (round < 3 || barrage) {
      const numGroupe = { A: 1, B: 2, B2: 3, C: 4 };
      const newGroupes = { 1: "A", 2: "B", 3: "B2", 4: "C" };
      for (let i = 0; i < 2; i++) {
        let newGroupe = "";
        if (i == 0) {
          newGroupe = groupe;
        } else {
          newGroupe =
            newGroupes[numGroupe[groupe] + (barrage ? round - 1 : round)];
        }

        const matches = await query(
          "select * from matches2 where id_tournament = ? and id_playerB = 0 and round = ? and groupe = ?",
          [idTournament, barrage ? round : round + 1, newGroupe],
        );
        await placePlayerMatches2(
          matches,
          i == 0 ? win : lose,
          i == 0 ? pseudoWin : pseudoLose,
          idTournament,
          "= 0",
          newGroupe,
        );
      }
      // ----------------------- Dernier Match de la phase --------------------------
    } else if (round == 3) {
      let matches = await query(
        "select * from matches2 where id_tournament = ? and groupe = ? and class > 0 and id_playerB = 0",
        [idTournament, groupe],
      );
      // Si au final le dernier match de la phase donne le grand gagnant du groupe
      if (matches.filter((m) => m.class >= 1).length == 0) {
        if (groupe == "A" || groupe == "C") {
          await defineBigWinner(win, lose, idTournament, pseudoWin, groupe);
          return res.status(200).send("Victoire validé");
        } else {
          // ------------------ Code à regrouper (place le joueur en grande finale du B) ---------------------
          const match = (
            await query(
              "select * from matches2 where id_tournament = ? and class = ?",
              [idTournament, 0.5],
            )
          )[0];
          const lettre = match.id_playerA == 0 ? "A" : "B";
          await query(
            `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and class = 0.5`,
            [win, pseudoWin, idTournament],
          );
        }
        // ------------------- Le gagnant doit etre placé dans l'arbre  ------------------------
      } else {
        const tour = Math.max(
          ...matches.filter((m) => m.id_playerB == 0).map((m) => m.class),
        );
        matches = matches.filter((m) => m.class == tour);
        // ----------------------- Code à regrouper (placer joueur dans matches2) ----------------------
        await placePlayerMatches2(
          matches,
          win,
          pseudoWin,
          idTournament,
          ">= 1",
          groupe,
        );
      }
      // -------------------- Le gagnant a gagné un match dans l'arbre ---------------------
    } else {
      // ------------------- Si il gagne une finale --------------------
      if (tour == 1) {
        if (groupe == "A" || groupe == "C") {
          // ------------------- Code à replacer (déclarer un gagnant) -------------------
          await defineBigWinner(win, lose, idTournament, pseudoWin, groupe);
          return res.status(200).send("Victoire validé");
        } else {
          // ------------------ Code à regrouper (place le joueur en grande finale du B) ---------------------
          const match = await query(
            "select * from matches2 where id_tournament = ? and class = 0.5",
            [idTournament],
          );
          const lettre = match[0].id_playerA == 0 ? "A" : "B";
          await query(
            `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and class = 0.5`,
            [win, pseudoWin, idTournament],
          );
        }
        // -------------- Si le gagnant gagne la grande finale du B ------------------
      } else if (tour == 0.5) {
        await defineBigWinner(win, lose, idTournament, pseudoWin, groupe, 0.25);
        return res.status(200).send("Victoire validé");
        // -------------- Si le gagnant gagne dans arbre et que c'est pas une finale (donc continue) ------------------
      } else {
        const matches = await query(
          "select * from matches2 where id_tournament = ? and groupe = ? and class = ? and id_playerB = 0",
          [idTournament, groupe, tour / 2],
        );
        await placePlayerMatches2(
          matches,
          win,
          pseudoWin,
          idTournament,
          ">= 1",
          groupe,
        );
      }
    }
    await updatePlayers([win, lose], idTournament);
    return res.status(200).send("Victoire validé");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

exports.winnerClassement = async (req, res) => {
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
