const { query } = require("./query");

function getRandomElements(arr, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(index, 1)[0]); // enlève de la liste
  }

  return result;
}

exports.createArbre = async (
  listPlayers,
  idTournament,
  really,
  round,
  groupe,
) => {
  const nb_players = really ? listPlayers.length : listPlayers;
  const p2 = 2 ** Math.floor(Math.log2(nb_players));
  const prelim = (nb_players - p2) * 2;
  const tirage = really && getRandomElements(listPlayers, prelim);

  let number = 0;
  for (let i = 1; i <= p2 / 2; i = i * 2) {
    number = number + i;
  }
  number = number + prelim / 2;

  // Je crée les matches excluant les matches de préliminaire
  for (let i = 1; i <= p2 / 2; i = i * 2) {
    for (let j = 1; j <= i; j++) {
      await query(
        "insert into matches2 (id_tournament, number, end, class, round, groupe) values (?, ?, 0, ?, ?, ?)",
        [idTournament, number, i, round, groupe],
      );
      number--;
    }
  }
  // Je crée les matches préliminaire et j'en profite pour ajouter tous les jouers car ces matches seront forcément rempli des joueurs
  for (let i = 1; i <= prelim / 2; i++) {
    await query(
      "insert into matches2 (id_tournament, number, id_playerA, pseudo_A, id_playerB, pseudo_B, end, class, groupe, round) values (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)",
      [
        idTournament,
        number,
        really ? tirage[(i - 1) * 2].numero : 0,
        really ? tirage[(i - 1) * 2].pseudo : "",
        really ? tirage[(i - 1) * 2 + 1].numero : 0,
        really ? tirage[(i - 1) * 2 + 1].pseudo : "",
        p2,
        groupe,
        round,
      ],
    );
    number--;
  }
  if (really) return { prelim, p2, tirage, number };
};
