const { query } = require("../constants/query");
const { updatePlayers } = require("../constants/updatePlayers");

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

exports.goTournamentClassement = async (req, res) => {
  try {
    const idTournament = req.params.id;
    const listPlayers = await query(
      "select * from players where id_tournament = ?",
      [idTournament],
    );
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
    const result = generateMatches(listPlayers, 3);
    const matches = [];
    for (let i = 1; i <= listPlayers.length; i++) {
      result[i].forEach((a, index) => {
        const key = `${Math.min(i, a)}-${Math.max(i, a)}`;
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
    let number = 1;
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      await query(
        "insert into matches2 (id_tournament, number, round, id_playerA, id_playerB, pseudo_A, pseudo_B, score_V, score_L, id_winner, end) values(?,?,?,?,?,?,?,0,0,0,?)",
        [
          req.params.id,
          number,
          m.round,
          m.idA,
          m.idB,
          m.pseudoA,
          m.pseudoB,
          m.round == 1 ? 0 : -1,
        ],
      );
      number++;
    }
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
