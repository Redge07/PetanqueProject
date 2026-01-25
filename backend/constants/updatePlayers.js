const { query } = require("./query");

exports.updatePlayers = async (list_id, idTournament) => {
  const tournament = await query(
    "select * from matches2 where (end = 0 or end = -1) and id_tournament = ?",
    [idTournament],
  );
  let new_list_id = [...list_id];
  list_id.forEach((id) => {
    const match = tournament.find(
      (match) => match.id_playerB == id && match.end == 0,
    );
    if (match) new_list_id.push(match.id_playerA);
  });
  for (let i = 0; i < new_list_id.length; i++) {
    const id = new_list_id[i];
    const match = tournament.find(
      (match) => match.id_playerA == id || match.id_playerB == id,
    );
    if (match) {
      const id_versus = match.id_playerB
        ? match.id_playerA == id
          ? match.id_playerB
          : match.id_playerA
        : 0;
      await query(
        "update players set id_versus = ?, class = ?, round = ?, groupe = ?, dispo = ?, barrage = ? where numero = ? and id_tournament = ?",
        [
          id_versus,
          match.class,
          match.round,
          match.groupe,
          match.end ? 0 : 1,
          match.barrage,
          id,
          idTournament,
        ],
      );
    } else {
      await query(
        "delete from players where id_tournament = ? and numero = ?",
        [idTournament, id],
      );
    }
  }
};
