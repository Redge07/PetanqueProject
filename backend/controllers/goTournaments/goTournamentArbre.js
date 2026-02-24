const { createArbre } = require("../../constants/createArbre");
const { query, withTransaction } = require("../../constants/query");
const { updatePlayers } = require("../../constants/updatePlayers");

const status = {
  noEnough: 0,
  premium: 1,
  valid: 2,
};

const { Expo } = require("expo-server-sdk");

const expo = new Expo();

// API pour lançer officiellement un tournoi en mode arbre
exports.goTournamentArbre = async (req, res) => {
  try {
    const idTournament = req.params.id;
    let listPlayers = [];
    let groupe = "";
    let round = 0;
    const body = Object.keys(req.body || {}).length;
    let notifs = [];

    const message = await withTransaction(async (conn) => {
      // Si on a pas envoyé un body à l'API alors ça veut dire qu'on lançe un arbre classique
      if (!body) {
        // On récupère tous les joueurs inscrit du tournoi
        listPlayers = await query(
          "select * from players where id_tournament = ? and valider = 1",
          [idTournament],
          conn,
        );
        const tournament = (
          await query(
            "select premium from tournaments where id = ?",
            [idTournament],
            conn,
          )
        )[0];
        // On accepte pas de lançer le tournoi si on voit qu'il y a moins de 2 joueurs inscrit
        if (listPlayers.length < 2)
          return {
            res: status.noEnough,
            message: "Il faut au moins 2 joueurs",
          };
        if (listPlayers.length > 11 && tournament.premium == 0)
          return {
            res: status.premium,
            message: "Vous etes dans le cas d'un tournoi payant",
          };
        await query(
          "update tournaments set start = ? where id = ?",
          [1, idTournament],
          conn,
        );
        // Comme on lançe le tournoi avec les joueurs inscrit on peut supprimer les joueurs qui avaient fait la demande d'inscription qui ont pas été inscrit
        await query(
          "delete from players where id_tournament = ? and valider = 0",
          [idTournament],
          conn,
        );
        // throw new Error("TEST ROLLBACK");
        // Si il y a bien un body envoyé à l'API alors ça veut dire qu'on lançe un arbre mais dans le mode du tournoi en classement, on lançe un arbre pour un groupe précis (groupe A, B ou C)
      } else {
        round = 4;
        // Si on crée pour le groupe A, alors qon initialise la variable groupe à "A" et on prend la listPlayers de ce tournoi en arbre précis sera avec la listPlayers des joueurs du groupe "A"
        if (req.body.listPlayersA) {
          console.log("groupeA");

          listPlayers = req.body.listPlayersA;
          groupe = "A";
          console.log(listPlayers);
        } else if (req.body.listPlayersB) {
          console.log("groupeB");
          listPlayers = req.body.listPlayersB;
          groupe = "B";
          console.log(listPlayers);
        } else if (req.body.listPlayersC) {
          console.log("groupeC");
          listPlayers = req.body.listPlayersC;
          groupe = "C";
          console.log(listPlayers);
        }
        // Si la listPlayers du groupe en question ne contient seulement un joueur alors on déclare cette unique joueur comme vainqueur de son groupe (on modifie le joueur, on ajoute le vainqueur du groupe dans la table tournaments)
        if (listPlayers.length == 1) {
          await query(
            "update players set id_versus = 0, class = ? where id_tournament = ? and numero = ?",
            [0.5, idTournament, listPlayers[0].numero],
            conn,
          );
          await query(
            `update tournaments set vainqueur${groupe} = ? where id = ?`,
            [listPlayers[0].pseudo, idTournament],
            conn,
          );
          // Si on est dans le groupe C ça veut dire qu'on a déjà crée les tournoi en arbre du groupe A et B et que on peut supprimer tous les joueurs qui ont pas été selectionné pour faire les tournoi des groupes A, B et C
          if (groupe == "C")
            await query(
              "delete from players where id_versus = 0 and id_tournament = ?",
              [idTournament],
              conn,
            );
          return "Oui";
        }
        // Si le groupe n'a pas de joueur, c'est qu'on ne souhaite pas faire de tournoi pour ce groupe
        if (!listPlayers.length) {
          // Pareil si c'est on est au groupe C alors on supprimer tous les joueurs sélectionné
          if (groupe == "C")
            await query(
              "delete from players where id_versus = 0 and id_tournament = ?",
              [idTournament],
              conn,
            );
          return "pas de joueur pour ce groupe";
        }
      }
      // C'est le moment de créer le tournoi en arbre, que se soit pour un arbre classqiue ou l'arbre d'un groupe d'un tournoi en mode classement
      let { prelim, p2, tirage, number } = await createArbre(
        listPlayers,
        idTournament,
        true,
        round,
        groupe,
        conn,
      );

      // Les matches préliminaire ont été crée et rempli de joueur, il faut maintenant ajouter les quelques joueurs qui attendent au tour d'apres
      // On récupère le numéro de match qui représente le début des matches apres les matches préliminaire
      const numberStart = prelim / 2 + 1;
      number = numberStart;
      let lettre = "A";
      // ListPlayers représente les joueurs qui attendent d'etre placé la phase au dessus des barrages, en envoyant a createArbre ça a vraiment modifié la variable d'origine
      for (let i = 0; i <= listPlayers.length - 1; i++) {
        // p2 représente le nombre de joueurs qui doivent etre dans la phase au-dessus, donc divisé par 2 c'est le nombre de matches (p2 = 8 alors 4 matches et donc quart de finale enfaite)

        // Si on arrive au joueur qui dépasse le nombre matches ça veut dire que tous les matches on deja leur joueur A, donc les prochains joueurs seront des joueurs B et le numéro recommence a numéro start car le joueur B affrontera un joueur A qui a déjà était placé, donc ils auront le meme numéro de match
        if (i == p2 / 2) {
          number = numberStart;
          lettre = "B";
        }
        await query(
          `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ? and groupe = ?`,
          [
            listPlayers[i].numero,
            listPlayers[i].pseudo,
            idTournament,
            number,
            groupe,
          ],
          conn,
        );
        number++;
      }
      // Le joueur est placé dans la table matches et faut juste mettre ces infos a jour dans la table players
      notifs = await updatePlayers(
        [
          ...listPlayers.map((player) => player.numero),
          ...tirage.map((player) => player.numero),
        ],
        idTournament,
        conn,
        true,
      );
      // On a fini de créer le tournoi pour le groupe en question, si c'est le groupe C alors faut supprimer les joueurs non sélectionnées pour la suite du tournoi

      if (groupe == "C")
        await query(
          "delete from players where id_versus = 0 and id_tournament = ?",
          [idTournament],
          conn,
        );
      return {
        res: status.valid,
        message: "Le tournoi a été crée",
      };
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
