const { createArbre } = require("../../constants/createArbre");
const { query } = require("../../constants/query");
const { updatePlayers } = require("../../constants/updatePlayers");

// Fonction pour mélanger un tableau
function shuffleArray(array) {
  const arr = [...array]; // copie pour ne pas modifier l'original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // index aléatoire
    [arr[i], arr[j]] = [arr[j], arr[i]]; // échange
  }
  return arr;
}

// API pour démarrer un tournoi en cascade
exports.goTournamentCascade = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const listPlayers = await query(
      "select * from players where id_tournament = ?",
      [idTournament],
    );
    if (listPlayers.length < 8)
      return res.status(200).send("Il faut au moins 8 joueurs");
    await query("update tournaments set start = ? where id = ?", [
      1,
      idTournament,
    ]);
    const nb_joueurs = listPlayers.length;
    const listPlayersM = shuffleArray(listPlayers);

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
        [1, 0],
        [0, 1],
      ],
      C: [
        [0, 0],
        [0, 0],
        [0, 1],
      ],
    };
    for (const groupe of groupes) {
      let nb_matches = nb_joueurs / 2;
      for (let i = 0; i < 3; i++) {
        const barrage =
          !Number.isInteger(nb_matches) && barrages[groupe][i][0] == 1;

        nb_matches = Math.ceil(nb_matches);

        if (barrages[groupe][i][1]) {
          for (let j = 0; j < nb_matches; j++) {
            const test = await query(
              "insert into matches2 (id_tournament, number, id_playerA, pseudo_A, id_playerB, pseudo_B, end, round, class, groupe, barrage) values(?,?,?,?,?,?,0,?,0,?,?)",
              [
                idTournament,
                number,
                groupe == "A" && i == 0 ? listPlayersM[j * 2].numero : 0,
                groupe == "A" && i == 0 ? listPlayersM[j * 2].pseudo : "",
                groupe == "A" && i == 0 ? listPlayersM[j * 2 + 1].numero : 0,
                groupe == "A" && i == 0 ? listPlayersM[j * 2 + 1].pseudo : "",
                i + 1,
                groupe,
                barrage && j == 0 ? 1 : 0,
              ],
            );
            console.log(test);

            number++;
          }
        }
        if (barrage) nb_matches = nb_matches - 1;

        nb_matches = nb_matches / 2;
      }

      if (nb_matches != 0.5)
        await createArbre(nb_matches * 2, idTournament, false, 4, groupe);
    }
    await query(
      "insert into matches2 (id_tournament, number, round, class, groupe) values (?, 1, 4, ?, ?)",
      [idTournament, 0.5, "B"],
    );
    await updatePlayers(
      listPlayers.map((player) => player.numero),
      idTournament,
    );
    res.status(200).send("Go tournoi !");
  } catch (err) {
    res.status(500).send(err);
  }
};
