const { query, withTransaction } = require("../../constants/query");
const { defineBigWinner } = require("../../constants/defineBigWinner");
const { placePlayerMatches2 } = require("../../constants/placePlayerMatches2");
const { updatePlayers } = require("../../constants/updatePlayers");

const { Expo } = require("expo-server-sdk");
const expo = new Expo();
// API pour déclarer un vainqueur dans un tournoi en mode cascade
exports.cascade = async (req, res) => {
  try {
    const idTournament = req.params.id;
    let notifs = [];
    // On récupère les données du body
    const { win, lose, pseudoWin, pseudoLose, tour, barrage, groupe, round } =
      req.body;
    const message = await withTransaction(async (conn) => {
      // On dit que le match en question est terminé
      await query(
        "update matches2 set id_winner = ?, end = 1 where end = 0 and id_tournament = ? and (id_playerA = ? or id_playerB = ?)",
        [win, idTournament, win, win],
        conn,
      );
      // Si on a faire à un match de phase de groupe (ou de barrage car le vainqueur du baarrage continue dans la phas d epoule dans tous les cas)
      if (round < 3 || barrage) {
        // On donne des numéro a chaque groupe qui nous aideront pour donner le nouveau groupe du perdant
        const numGroupe = { A: 1, B: 2, B2: 3, C: 4 };
        const newGroupes = { 1: "A", 2: "B", 3: "B2", 4: "C" };
        // Boucle pour gérer le cas du vainqueur et du perdant
        for (let i = 0; i < 2; i++) {
          let newGroupe = "";
          if (i == 0) {
            // Pour le gagnant on sait deja qu'il gardera le meme groupe
            newGroupe = groupe;
          } else {
            // On donne le nouveau groupe au perdant, on utilise les numéros de groupe qu'on déclaré plus haut
            newGroupe =
              newGroupes[numGroupe[groupe] + (barrage ? round - 1 : round)];
          }
          // On récupère les matches ou le joueur pourra se retrouver (que se soit le gagnant ou le perdant)
          const matches = await query(
            "select * from matches2 where id_tournament = ? and id_playerB = 0 and round = ? and groupe = ?",
            [idTournament, barrage ? round : round + 1, newGroupe],
            conn,
          );

          // On place le joeueur dans l'un des matches récupérés
          await placePlayerMatches2(
            matches,
            i == 0 ? win : lose,
            i == 0 ? pseudoWin : pseudoLose,
            idTournament,
            "= 0",
            newGroupe,
            conn,
          );
        }
        // Sinon on est dans le dernier match de la phase de poule donc la faut gérer le fait que le gagnat passe dans l'arbre
      } else if (round == 3) {
        // On récupère les matches dans lequel le gagnant pourra se retrouver
        let matches = await query(
          "select * from matches2 where id_tournament = ? and groupe = ? and class > 0 and id_playerB = 0",
          [idTournament, groupe],
          conn,
        );
        // Si au final le dernier match de la phase donne le grand gagnant du groupe (on voit qu'il n'y a pas de match dans l'arbre pour ce groupe ci)
        if (matches.filter((m) => m.class >= 1).length == 0) {
          // On peut déclarer le vainqueur du tournoi directement pour le groupe A ou C
          if (groupe == "A" || groupe == "C") {
            await defineBigWinner(
              win,
              lose,
              idTournament,
              pseudoWin,
              groupe,
              conn,
            );
            return "Victoire validé";
            // Par contre pour le groupe B ou B2 dans tous les cas il y aura la grande finale du B a jouer
          } else {
            // On récupère le match qui représente la grande finale du B
            const match = (
              await query(
                "select * from matches2 where id_tournament = ? and class = ?",
                [idTournament, 0.5],
                conn,
              )
            )[0];
            // Et on, place le vainqueur dans le match
            const lettre = match.id_playerA == 0 ? "A" : "B";
            await query(
              `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and class = 0.5`,
              [win, pseudoWin, idTournament],
              conn,
            );
          }
          // Sinon le gagnant du toisième match peut bien etre placé dans l'arbre normalement
        } else {
          // On récupère les matches qui ont un joueur B vide (ce qui veut dire que ce match n'est pas completé) et parmi ces matches on prend le numéro du tour le plus élevé qui apparait (car 4 veut dire quart de finale eton veut ça plutot que 2 qui veut dire demi finale par exemple)
          const tour = Math.max(
            ...matches.filter((m) => m.id_playerB == 0).map((m) => m.class),
          );
          // On récupère tous les matches qui correspondent a ce tour et on sait que le joueur doit etre placé parmi ces matches la
          matches = matches.filter((m) => m.class == tour);
          // On place le joueur dans l'un de ces matches
          await placePlayerMatches2(
            matches,
            win,
            pseudoWin,
            idTournament,
            ">= 1",
            groupe,
            conn,
          );
        }
        // Sinon autre possibilité, le gagnant a gagné un match dans l'arbre
      } else {
        // Si il a gagné une finale de groupe
        if (tour == 1) {
          // On peut déclarer le vainqueur du tournoi directement pour le groupe A ou C
          if (groupe == "A" || groupe == "C") {
            // ------------------- Code à replacer (déclarer un gagnant) -------------------
            await defineBigWinner(
              win,
              lose,
              idTournament,
              pseudoWin,
              groupe,
              conn,
            );
            return "Victoire validé";
            // Sinon on doit le placer dans la grande finale du B
          } else {
            const match = await query(
              "select * from matches2 where id_tournament = ? and class = 0.5",
              [idTournament],
              conn,
            );
            const lettre = match[0].id_playerA == 0 ? "A" : "B";
            await query(
              `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and class = 0.5`,
              [win, pseudoWin, idTournament],
              conn,
            );
          }
          // Si le gagnant gagne la grande finale du B
        } else if (tour == 0.5) {
          await defineBigWinner(
            win,
            lose,
            idTournament,
            pseudoWin,
            groupe,
            conn,
            0.25,
          );
          return "Victoire validé";
          // Sinon c'est juste un match classque ou le gagnant continue son chemin dans l'arbre
        } else {
          const matches = await query(
            "select * from matches2 where id_tournament = ? and groupe = ? and class = ? and id_playerB = 0",
            [idTournament, groupe, tour / 2],
            conn,
          );
          await placePlayerMatches2(
            matches,
            win,
            pseudoWin,
            idTournament,
            ">= 1",
            groupe,
            conn,
          );
        }
      }
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
