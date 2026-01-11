const { query } = require("../constants/query");
const { updatePlayers } = require("../constants/updatePlayers");

function getRandomElements(arr, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(index, 1)[0]); // enlève de la liste
  }

  return result;
}

exports.goTournamentArbre = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const listPlayers = await query(
      "select * from players where id_tournament = ? and valider = 1",
      [idTournament]
    );
    if (listPlayers.length < 2)
      return res.status(200).send("Il faut au moins 2 joueurs");
    // await query("delete from players where id_tournament = ? and valider = 0", [
    //   idTournament,
    // ]);
    const nb_players = listPlayers.length;
    const p2 = 2 ** Math.floor(Math.log2(nb_players));
    const prelim = (nb_players - p2) * 2;
    const tirage = getRandomElements(listPlayers, prelim);

    let number = 0;
    for (let i = 1; i <= p2 / 2; i = i * 2) {
      number = number + i;
    }
    number = number + prelim / 2;

    // Je crée les matches excluant les matches de préliminaire
    for (let i = 1; i <= p2 / 2; i = i * 2) {
      for (let j = 1; j <= i; j++) {
        await query(
          "insert into matches2 (id_tournament, number, end, class) values (?, ?, 0, ?)",
          [idTournament, number, i]
        );
        number--;
      }
    }
    // Je crée les matches préliminaire et j'en profite pour ajouter tous les jouers car ces matches seront forcément rempli des joueurs
    for (let i = 1; i <= prelim / 2; i++) {
      await query(
        "insert into matches2 (id_tournament, number, id_playerA, pseudo_A, id_playerB, pseudo_B, end, class) values (?, ?, ?, ?, ?, ?, 0, ?)",
        [
          idTournament,
          number,
          tirage[(i - 1) * 2].numero,
          tirage[(i - 1) * 2].pseudo,
          tirage[(i - 1) * 2 + 1].numero,
          tirage[(i - 1) * 2 + 1].pseudo,
          p2,
        ]
      );
      number--;
    }

    // Les matches préliminaire ont été crée et rempli de joueur, il faut maintenant ajouter les quelques joueurs qui attendent au tour d'apres
    const numberStart = prelim / 2 + 1;
    number = numberStart;
    let lettre = "A";

    for (let i = 0; i <= listPlayers.length - 1; i++) {
      if (i == p2 / 2) {
        number = numberStart;
        lettre = "B";
      }
      await query(
        `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ?`,
        [listPlayers[i].numero, listPlayers[i].pseudo, idTournament, number]
      );
      number++;
    }

    await updatePlayers(
      [
        ...listPlayers.map((player) => player.numero),
        ...tirage.map((player) => player.numero),
      ],
      idTournament
    );

    return res.status(200).send("Oui");
  } catch (err) {
    return res.status(500).send(err);
  }
};
