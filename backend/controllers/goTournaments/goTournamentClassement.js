const { query } = require("../../constants/query");
const { updatePlayers } = require("../../constants/updatePlayers");

// Fonction pour aider la création de 3 adversaire différent par joueur
function roundRobinPairs(ids) {
  const n = ids.length;
  const arr = [...ids];
  const rounds = [];

  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    for (let i = 0; i < n / 2; i++) {
      pairs.push([arr[i], arr[n - 1 - i]]);
    }
    rounds.push(pairs);

    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop());
    arr.splice(0, arr.length, fixed, ...rest);
  }
  return rounds;
}

// Fonction pour que chaque joueur ai 3 adversaire différent et dans un ordre cohérent
function generateMatches(players, nbAdversaires = 3) {
  const ids = players.map((p) => p.numero);

  const allRounds = roundRobinPairs(ids);

  const chosen = [...allRounds]
    .sort(() => Math.random() - 0.5)
    .slice(0, nbAdversaires);

  const matches = {};
  ids.forEach((id) => (matches[id] = Array(nbAdversaires).fill(null)));

  chosen.forEach((pairs, roundIdx) => {
    pairs.forEach(([a, b]) => {
      matches[a][roundIdx] = b;
      matches[b][roundIdx] = a;
    });
  });

  return matches;
}

// API pour lançer le tournoi en mode classement
exports.goTournamentClassement = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const listPlayers = await query(
      "select * from players where id_tournament = ?",
      [idTournament],
    );
    // Pour pouvoir lançer le tournoi il faut soit 4 joueurs, soit + de 7 joueurs et un nombre paire
    if (
      (listPlayers.length <= 7 && listPlayers.length != 4) ||
      listPlayers.length % 2 != 0
    )
      return res
        .status(200)
        .send(
          "Il faut au moins 8 joueurs ou alors 4 joueurs et que se soit un nombre de joueurs pair",
        );
    await query("update tournaments set start = ? where id = ?", [
      1,
      idTournament,
    ]);
    // On récupère un tableau qui montre les 3 adversaires de chaque joueur
    const result = generateMatches(listPlayers, 3);
    // Tableau qui va se remplir petit a petit des matches qui vont etre crées
    const matches = [];
    // On parcourt chaque joueurs i
    for (let i = 1; i <= listPlayers.length; i++) {
      // On parcourt chaque adversaire du joueur i
      result[i].forEach((a, index) => {
        // On crée une clé du match pour éviter les doublons
        const key = `${Math.min(i, a)}-${Math.max(i, a)}`;
        // Si le tableau matches ne contient pas encore ce match il faut l'ajouter dans le tableau
        if (!matches.find((m) => m.key == key)) {
          matches.push({
            key,
            idA: i,
            idB: a,
            pseudoA: listPlayers.find((p) => p.numero == i).pseudo,
            pseudoB: listPlayers.find((p) => p.numero == a).pseudo,
            round: index + 1,
          });
        }
      });
    }
    // Maintenant on a tous les matches et il faut les insérer dans la tables
    let number = 1;
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      await query(
        "insert into matches2 (id_tournament, number, round, id_playerA, id_playerB, pseudo_A, pseudo_B, score_A, score_B, id_winner, end) values(?,?,?,?,?,?,?,0,0,0,?)",
        [
          req.params.id,
          number,
          m.round,
          m.idA,
          m.idB,
          m.pseudoA,
          m.pseudoB,
          // Si c'est un match du round 1 on met 0 pour dire qu'il est en cours, sinon -2 pour dire que c'est un match qui n'a 0 joueur dispo en lui pour le moment
          m.round == 1 ? 0 : -2,
        ],
      );
      number++;
    }
    // On a crée tous les matchs, maintenant il faut mettre a jour les infos des joueurs
    await updatePlayers(
      listPlayers.map((player) => player.numero),
      idTournament,
    );
    res.status(200).send("Go tournoi !");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
