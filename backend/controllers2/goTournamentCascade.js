const { query } = require("../constants/query");

exports.goTournamentCascade = async () => {
  const idTournament = req.params.id;
  const listPlayers = await query(
    "select * from players where id_tournament = ?",
    [idTournament]
  );
  const nb_joueurs = listPlayers.length;
  let number = 1;
  const groupes = ["A", "B", "B2", "C"];
  const barrages = {
    A: [0, 1, 1],
    B: [0, 0, 1],
    B2: [0, 0, 0],
    C: [0, 0, 0],
  };
  groupes.forEach((groupe) => {
    let nb_matches = nb_joueurs / 2;
    for (let i = 0; i < 3; i++) {
      const barrage = false;
      if (nb_matches % 2 == 0 && barrages[groupe][i]) barrage = true;
      for (let j = 0; j < Math.ceil(nb_matches); j++) {
        query(
          "insert into matches (id_tournament, number, end, round, class, groupe, barrage) values(?,?,0,?,0,?,?)",
          [idTournament, number, i + 1, groupe, barrage && j == 0 ? 1 : 0]
        );
        number++;
      }
      if (barrage) nb_matches = Math.floor(nb_matches);
      nb_matches = nb_matches / 2;
    }
  });
};
