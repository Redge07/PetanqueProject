const { query } = require("./query");

exports.defineBigWinner = async (
  win,
  lose,
  idTournament,
  pseudoWin,
  groupe,
  tour = 0.5,
) => {
  await query("delete from players where numero = ? and id_tournament = ?", [
    lose,
    idTournament,
  ]);
  await query(
    "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
    [tour, idTournament, win],
  );
  if (groupe) {
    await query(`update tournaments set vainqueur${groupe} = ? where id = ?`, [
      pseudoWin,
      idTournament,
    ]);
  } else {
    await query(
      "update tournaments set vainqueur = ?, start = 2 where id = ?",
      [pseudoWin, idTournament],
    );
  }
};
