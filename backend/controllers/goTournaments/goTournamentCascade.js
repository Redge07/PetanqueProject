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

// Fonction pour mélanger un tableau
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// API pour démarrer un tournoi en cascade
exports.goTournamentCascade = async (req, res) => {
  try {
    const idTournament = req.params.id;
    let notifs = [];
    const message = await withTransaction(async (conn) => {
      const listPlayers = await query(
        "select * from players where id_tournament = ? and valider = 1",
        [idTournament],
        conn,
      );
      const tournament = (
        await query(
          "select premium, prix_entree from tournaments where id = ?",
          [idTournament],
          conn,
        )
      )[0];
      // Pour lançer le tournoi il faut au moins 8 joueurs
      if (listPlayers.length < 8)
        return {
          res: status.noEnough,
          message: "Il faut au moins 8 joueurs",
        };
      if (listPlayers.length > 11 && tournament.premium == 0)
        return {
          res: status.premium,
          message: "Vous etes dans le cas d'un tournoi payant",
        };
      await query(
        "update tournaments set start = ?, nb_joueurs = ? where id = ?",
        [1, listPlayers.length, idTournament],
        conn,
      );
      await query(
        "delete from players where id_tournament = ? and valider = 0",
        [idTournament],
        conn,
      );
      const nb_joueurs = listPlayers.length;
      const listPlayersM = shuffleArray(listPlayers);

      let number = 1;
      const groupes = ["A", "B", "B2", "C"];
      // On représente un peu la parcours de chaque groupe a l'issue des 3 matches
      const barrages = {
        A: [
          [0, 1],
          [1, 1],
          [1, 1],
        ],
        B: [
          [0, 0],
          [0, 1],
          [1, 1],
        ],
        B2: [
          [0, 0],
          [1, 0],
          [0, 1],
        ],
        C: [
          [0, 0],
          [0, 0],
          [0, 1],
        ],
      };
      // Donc on choisit de créer les matches groupe par groupe au lieu round par round
      for (const groupe of groupes) {
        // Nombre de matches au premier tour du groupe
        let nb_matches = nb_joueurs / 2;
        // On  fait une boucle de 3 car il y a 3 matches
        for (let i = 0; i < 3; i++) {
          // Condition pour savoir si le round de ce groupe a besoin d'un barrage ou pas
          // Il faut savoir si le nombre de matches qu'on a calculé pour ce round est un entier et si notre tableau de barrage indique une possibilité de barrage pour ce round du groupe
          const barrage =
            !Number.isInteger(nb_matches) && barrages[groupe][i][0] == 1;

          // Une fois qu'on sait si le match a besoin d'un barrage on arrondit dans tous les cas le nombre de matches au supérieur, donc si on a 8 = 8 mais si on a 7.5 = 8
          nb_matches = Math.ceil(nb_matches);

          // Si le tableau indique que le round de ce groupe a des matches on insère les matches a la BD
          // Par exemple on sait que le groupe C n'a pas de round 2 donc on ne fait rien
          if (barrages[groupe][i][1]) {
            let matchInsert = [];
            for (let j = 0; j < nb_matches; j++) {
              matchInsert.push([
                idTournament,
                number,
                // On peut placer les joueurs si on est au groupe A et au round 1 car c'est le début du tournoi et qu'il faut placer les joueurs
                groupe == "A" && i == 0 ? listPlayersM[j * 2].numero : 0,
                groupe == "A" && i == 0 ? listPlayersM[j * 2].pseudo : "",
                groupe == "A" && i == 0 ? listPlayersM[j * 2 + 1].numero : 0,
                groupe == "A" && i == 0 ? listPlayersM[j * 2 + 1].pseudo : "",
                0,
                i + 1,
                0,
                groupe,
                // On indique que le match est un barrage si on a vu qu'on a besoin d'un barrage dans ce round et on le précise que pour le premier match du round
                barrage && j == 0 ? 1 : 0,
              ]);
              number++;
            }
            await query(
              "insert into matches2 (id_tournament, number, id_playerA, pseudo_A, id_playerB, pseudo_B, end, round, class, groupe, barrage) values ?",
              [matchInsert],
              conn,
            );
          }
          // Si on vient de placer les matches d'un round et que c'était un barrage alors on enlève un match car on a commencé la boucle avec 7.5 et puis on est passé a 8 pour ajouter le barrage mais au final y'a que 7 match qui parle d'une qualification normale
          if (barrage) nb_matches = nb_matches - 1;

          nb_matches = nb_matches / 2;
        }
        // On vient de créer les 3 matches d'un groupe, il faut donc passer a la création de l'arbre pour ce groupe, mais si on voit que le nombre de matches a fini a 0.5 ça veut dire que pour le 3ème round il n'y a seulement qu'un match, donc le vainqueur de ce match est carrément le grand vainqueur du groupe et donc il n'y a pas besoin d'arbre
        if (nb_matches != 0.5)
          await createArbre(
            nb_matches * 2,
            idTournament,
            false,
            4,
            groupe,
            nb_joueurs * tournament.prix_entree,
            conn,
          );
      }
      // Une fois qu'on a crée tous les matches de chaque groupes jusqu'a l'arbre on ajoute la grande finale entre le vainqueur du groupe B et B2
      await query(
        "insert into matches2 (id_tournament, number, round, class, groupe, recompense) values (?, 1, 4, ?, ?, ?)",
        [idTournament, 0.5, "B", nb_joueurs * tournament.prix_entree * 0.045],
        conn,
      );
      // Comme la table matches 2 est complète et représente la vérite on peut copier les infos dans la table players
      notifs = await updatePlayers(
        listPlayers.map((player) => player.numero),
        idTournament,
        conn,
        true,
      );
      return {
        res: status.valid,
        message: "Go tournoi !",
      };
    });
    notifs.forEach((n) => {
      if (Expo.isExpoPushToken(n.to)) {
        expo.sendPushNotificationsAsync([n]);
      }
    });
    res.status(200).send(message);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
