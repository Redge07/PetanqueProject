const { query } = require("../constants/query");
const { updatePlayers } = require("../constants/updatePlayers");

exports.winnerArbre = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const { win, lose, pseudoWin, tour } = req.body;
    await query(
      "update matches2 set id_winner = ?, end = 1 where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
      [win, idTournament, win, win],
    );
    if (tour == 1) {
      await query(
        "delete from players where numero = ? and id_tournament = ?",
        [lose, idTournament],
      );
      await query(
        "update players set id_versus = 0, class = ? where id_tournament = ?",
        [0.5, idTournament],
      );
      await query(
        "update tournaments set vainqueur = ?, start = 2 where id = ?",
        [pseudoWin, idTournament],
      );
      return res.status(200).send("Victoire validé");
    }
    const matches = await query(
      "select * from matches2 where id_tournament = ? and class = ? and id_playerB = 0",
      [idTournament, tour / 2],
    );
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
      `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ?`,
      [win, pseudoWin, idTournament, matchNumber],
    );
    await updatePlayers([win, lose], idTournament);
    return res.status(200).send("Victoire validé");
  } catch (err) {
    return res.status(500).send(err);
  }
};

exports.winnerCascade = async (req, res) => {
  console.log("winner cascade");

  try {
    const idTournament = req.params.id;
    const { win, lose, pseudoWin, pseudoLose, tour, barrage, groupe, round } =
      req.body;
    await query(
      "update matches2 set id_winner = ?, end = 1 where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
      [win, idTournament, win, win],
    );
    console.log("barrage : " + barrage);

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
        const matchNumber =
          lettre == "A" ? minNumberNoPlayerA : minNumberNoPlayerB;
        await query(
          `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ? and class = 0`,
          [
            i == 0 ? win : lose,
            i == 0 ? pseudoWin : pseudoLose,
            idTournament,
            matchNumber,
          ],
        );
      }
    } else if (round == 3) {
      let matches = await query(
        "select * from matches2 where id_tournament = ? and groupe = ? and class > 0 and id_playerB = 0",
        [idTournament, groupe],
      );
      if (matches.filter((m) => m.class >= 1).length == 0) {
        if (groupe == "A" || groupe == "C") {
          await query(
            `update tournaments set vainqueur${groupe} = ? where id = ?`,
            [pseudoWin, idTournament],
          );
          await query(
            "delete from players where numero = ? and id_tournament = ?",
            [lose, idTournament],
          );
          await query(
            "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
            [0.5, idTournament, win],
          );
          return res.status(200).send("Victoire validé");
        } else {
          const lettre =
            matches.find((m) => m.class == 0.5).id_playerA == 0 ? "A" : "B";
          await query(
            `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and class = 0.5`,
            [win, pseudoWin, idTournament],
          );
        }
      } else {
        const tour = Math.max(...matches.map((m) => m.class));
        matches = matches.filter((m) => m.class == tour);
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
        const matchNumber =
          lettre == "A" ? minNumberNoPlayerA : minNumberNoPlayerB;
        await query(
          `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ? and groupe = ? and class >= 1`,
          [win, pseudoWin, idTournament, matchNumber, groupe],
        );
      }
    } else {
      if (tour == 1) {
        console.log("tour1");

        if (groupe == "A" || groupe == "C") {
          console.log("pas b");

          await query(
            `update tournaments set vainqueur${groupe} = ? where id = ?`,
            [pseudoWin, idTournament],
          );
          await query(
            "delete from players where numero = ? and id_tournament = ?",
            [lose, idTournament],
          );
          await query(
            "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
            [0.5, idTournament, win],
          );
          return res.status(200).send("Victoire validé");
        } else {
          console.log("oui b");

          const match = await query(
            "select * from matches2 where id_tournament = ? and class = 0.5",
            [idTournament],
          );
          console.log("id");
          console.log(match);

          const lettre = match[0].id_playerA == 0 ? "A" : "B";
          await query(
            `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and class = 0.5`,
            [win, pseudoWin, idTournament],
          );
        }
      } else if (tour == 0.5) {
        await query(
          `update tournaments set vainqueur${groupe} = ? where id = ?`,
          [pseudoWin, idTournament],
        );
        await query(
          "delete from players where numero = ? and id_tournament = ?",
          [lose, idTournament],
        );
        await query(
          "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
          [0.25, idTournament, win],
        );
        return res.status(200).send("Victoire validé");
      } else {
        const matches = await query(
          "select * from matches2 where id_tournament ? and groupe = ? and class = ? and id_playerB = 0",
          [idTournament, groupe, tour / 2],
        );
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
        const matchNumber =
          lettre == "A" ? minNumberNoPlayerA : minNumberNoPlayerB;
        await query(
          `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ? and class >= 1 and groupe = ?`,
          [win, pseudoWin, idTournament, matchNumber, groupe],
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
