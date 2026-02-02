const { query } = require("./query");

// Fonction pour gérer un match qui annonce le gagnant d'un tournoi
exports.defineBigWinner = async (
  win,
  lose,
  idTournament,
  pseudoWin,
  groupe,
  // Par défaut un gagnant aura touujours son tour a 0.5 car il a gagné un fianl qui a le tour 1, mais sauf dans le cas ou c'est le match de la grande finale du B car c'est un match de tour 0.5 et donc le gagnant aura un tour a 0.25
  tour = 0.5,
) => {
  // On supprime le joueur qui a perdu car dans tous les cas le gagnat gagne tout et le perdant est définitivement éliminé
  await query("delete from players where numero = ? and id_tournament = ?", [
    lose,
    idTournament,
  ]);
  // On donne les infos d'un gagnant pour le joueurs dans la table players
  await query(
    "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
    [tour, idTournament, win],
  );
  // Si la fonction a récupéré un groupe ça veut dire que c'est le gagnat d'un groupe et donc on enregistre le gagnat du groupe dans la table tournaments
  if (groupe) {
    await query(`update tournaments set vainqueur${groupe} = ? where id = ?`, [
      pseudoWin,
      idTournament,
    ]);
    // Sinon c'est le gagnant du mode arbre et on enregistre le vainqueur final du tournoi
  } else {
    await query(
      "update tournaments set vainqueur = ?, start = 2 where id = ?",
      [pseudoWin, idTournament],
    );
  }
};
