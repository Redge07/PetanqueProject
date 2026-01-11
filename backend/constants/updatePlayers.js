const { query } = require("./query");

exports.updatePlayers = async (list_id, idTournament) => {
  const tournament = await query(
    "select * from matches2 where end = 0 and id_tournament = ?",
    [idTournament]
  );
  for (let i = 0; i < list_id.length; i++) {
    const id = list_id[i];
    const match = tournament.find(
      (match) => match.id_playerA == id || match.id_playerB == id
    );
    const id_versus = match.id_playerB
      ? match.id_playerA == id
        ? match.id_playerB
        : match.id_playerA
      : 0;
    await query(
      "update players set id_versus = ?, class = ?, round = ?, groupe = ?, barrage = ? where numero = ? and id_tournament = ?",
      [
        id_versus,
        match.class,
        match.round,
        match.groupe,
        match.barrage,
        id,
        idTournament,
      ]
    );
  }
};
