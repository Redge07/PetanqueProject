const { createArbre } = require("../constants/createArbre");
const { query } = require("../constants/query");

exports.goTournamentCascade = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const listPlayers = await query(
      "select * from players where id_tournament = ?",
      [idTournament]
    );
    if (listPlayers.length < 8)
      return res.status(200).send("Il faut au moins 8 joueurs");
    await query("update tournaments set start = ? where id = ?", [
      1,
      idTournament,
    ]);
    const nb_joueurs = listPlayers.length;
    let number = 1;
    const groupes = ["A", "B", "B2", "C"];
    const barrages = {
      A: [
        [0, 1],
        [1, 1],
        [1, 1],
      ],
      B: [
        [0, 0],
        [0, 1],
        [1, 1],
      ],
      B2: [
        [0, 0],
        [0, 0],
        [0, 1],
      ],
      C: [
        [0, 0],
        [0, 0],
        [0, 1],
      ],
    };
    for (const groupe of groupes) {
      console.log("groupe : " + groupe);

      let nb_matches = nb_joueurs / 2;
      console.log("matches : " + nb_matches);
      for (let i = 0; i < 3; i++) {
        console.log("round : " + i);

        let barrage = false;
        if (!Number.isInteger(nb_matches) && barrages[groupe][i][0]) {
          barrage = true;
          console.log("barrage");
        }
        if (barrages[groupe][i][1]) {
          for (let j = 0; j < Math.ceil(nb_matches); j++) {
            await query(
              "insert into matches2 (id_tournament, number, end, round, class, groupe, barrage) values(?,?,0,?,0,?,?)",
              [idTournament, number, i + 1, groupe, barrage && j == 0 ? 1 : 0]
            );
            number++;
          }
        }
        if (barrage) nb_matches = Math.floor(nb_matches);
        nb_matches = nb_matches / 2;
      }
      if (nb_matches != 0.5)
        await createArbre(
          Math.ceil(nb_matches) * 2,
          idTournament,
          false,
          4,
          groupe
        );
    }
    res.status(200).send("Go tournoi !");
  } catch (err) {
    res.status(500).send(err);
  }
};
