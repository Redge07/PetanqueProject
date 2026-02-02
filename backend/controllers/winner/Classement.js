const { query } = require("../../constants/query");
const { updatePlayers } = require("../../constants/updatePlayers");

// API pour déclarer un vainqueur dans le tournoi en classement
exports.classement = async (req, res) => {
  try {
    // On récupère les données du body
    const { win, lose, scoreWin, scoreLose, round } = req.body;
    const idTournament = req.params.id;
    const matches = await query(
      "select * from matches2 where id_tournament = ?",
      [idTournament],
    );
    // Je récupère le match qui correspond au match entre le gagnant et le perdant que l'API a reçu
    const match = matches.find(
      (match) =>
        (match.id_playerA == win || match.id_playerB == win) &&
        match.end == 0 &&
        match.id_tournament == idTournament,
    );
    // On vérifie si le gagnant est le joueur A ou B du match
    const lettre = match.id_playerA == win ? "A" : "B";
    // On met a jour le match en rentrant les scores et le gagnant
    await query(
      "update matches2 set id_winner = ?, end = 1, score_A = ?, score_B = ? where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
      [
        win,
        lettre == "A" ? scoreWin : scoreLose,
        lettre == "B" ? scoreWin : scoreLose,
        idTournament,
        win,
        win,
      ],
    );
    // Si le match était avant le round 3
    if (round < 3) {
      // Boucle pour le gagnant et le perdant
      for (let i = 0; i < 2; i++) {
        const numero = i == 0 ? win : lose;
        // On cherche le match qui correspond au match suivant du joueur
        const match = matches.find(
          (match) =>
            match.round == round + 1 &&
            match.id_tournament == idTournament &&
            (match.id_playerA == numero || match.id_playerB == numero),
        );
        // On met a jour le status du match avec un + 1 pour l'attribut end, car de base il est a 0, 1 veut dire que le joueur A en est bien ce match la et 2 que le joueur B en est bien a ce match la aussi en plus du A (donc 2 veut dire que les 2 joueurs attitré a ce match son bien arrivé a ce stade dans le tournoi). Il suffit seulement de faire ça car tous les matches de poules ont déjà leur attitré de base
        await query(
          "update matches2 set end = ? where round = ? and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
          [match.end + 1, round + 1, idTournament, numero, numero],
        );
      }
      // On peut mettre a jour les infos des joueurs
      await updatePlayers([win, lose], idTournament);
    }
    // Si c'est un 3 eme match, on doit juste mettre a jour les infos des joueurs et précisé qu'ils n'ont plus d'adversaire et qu'ils passent au round 4. Le match qui vient de se finir a été mis a jour plsu haut et on n'a pas de match d'apres a mettre a jour car la suite c'est un tournoi en arbre qui s'en occupe
    if (round == 3) {
      for (let i = 0; i < 2; i++) {
        const numero = i == 0 ? win : lose;
        await query(
          "update players set id_versus = 0, round = 4, dispo = 0 where id_tournament = ? and numero = ?",
          [idTournament, numero],
        );
      }
    }
    return res.status(200).send("Victoire !");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
