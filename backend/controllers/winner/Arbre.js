const { query, withTransaction } = require("../../constants/query");
const { defineBigWinner } = require("../../constants/defineBigWinner");
const { placePlayerMatches2 } = require("../../constants/placePlayerMatches2");
const { updatePlayers } = require("../../constants/updatePlayers");

const { Expo } = require("expo-server-sdk");
const expo = new Expo();

// API pour déclarer un vainqueur dans un tournoi en mode arbre
exports.arbre = async (req, res) => {
  try {
    const idTournament = req.params.id;
    let notifs = [];
    // On récupère le numéro du gagnant, le numéro du perdant, le pseudo du gagnant, le tour du match qui s'est terminé et le groupe dans lequel s'est déroulé ce match
    const { win, lose, pseudoWin, tour, groupe = "" } = req.body;
    const message = await withTransaction(async (conn) => {
      // Directement on dit que le match en question est terminée
      await query(
        "update matches2 set id_winner = ?, end = 1 where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
        [win, idTournament, win, win],
        conn,
      );
      // Si c'était le match de la finale, alors on déclare le gagnant du tournoi
      if (tour == 1) {
        await defineBigWinner(win, lose, idTournament, pseudoWin, groupe, conn);
        return "Victoire validé";
      }
      // Sinon la suite du tournoi continue et on récupère les matches qui représente le tour suivant
      const matches = await query(
        "select * from matches2 where id_tournament = ? and class = ? and id_playerB = 0 and groupe = ?",
        [idTournament, tour / 2, groupe],
        conn,
      );
      // Une fois qu'on a ses possibles matches suivants, on place le gagnant dans l'un d'eux
      await placePlayerMatches2(
        matches,
        win,
        pseudoWin,
        idTournament,
        ">= 1",
        groupe,
        conn,
      );

      // On met a jour les infos des joueurs dans la table players
      notifs = await updatePlayers([win, lose], idTournament, conn);
      return "Victoire validé";
    });
    notifs.forEach((n) => {
      if (Expo.isExpoPushToken(n.to)) {
        expo.sendPushNotificationsAsync([n]);
      }
    });
    return res.status(200).send(message);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
