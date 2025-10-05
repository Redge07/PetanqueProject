const connection = require("../config/db");

function getRandomElements(arr, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(index, 1)[0]); // enlève de la liste
  }

  return result;
}

// API pour lancer le tournoi
exports.go_tournament = (req, res) => {
  // Dans un premier temps je supprime les joueurs qui n'ont pas été accepté au tournoi
  connection.query(
    "delete from players where id_tournament = ? and valider = 0",
    [req.params.id],
    (err, results) => {
      // Je récupère tous les joueurs qui sont inscrit
      connection.query(
        "select * from players where id_tournament = ? and valider = 1",
        [req.params.id],
        (err, results) => {
          // On va attribuer a chaque joueur sont futurs adversaire et a quelle tour du tournoi il va commencer
          const listPlayers = results;
          const nb_players = results.length;
          const p2 = 2 ** Math.floor(Math.log2(nb_players));
          const prelim = (nb_players - p2) * 2;
          const tirage = getRandomElements(listPlayers, prelim);
          // Les joueurs tirés aléatoirement qui vont disputer un match en plus
          for (let i = 0; i < tirage.length; i++) {
            connection.query(
              "update players set id_versus = ?, class = ? where numero = ? and id_tournament = ?",
              [
                i % 2 == 0 ? tirage[i + 1].numero : tirage[i - 1].numero,
                p2,
                tirage[i].numero,
                req.params.id,
              ]
            );
          }
          // Les joueurs qui vont attendre que les autres finissent leur premeir match
          for (let i = 0; i < listPlayers.length; i++) {
            connection.query(
              "update players set id_versus = ?, class = ? where numero = ? and id_tournament = ?",
              [
                i % 2 == 0
                  ? listPlayers[i + 1].numero
                  : listPlayers[i - 1].numero,
                p2 / 2,
                listPlayers[i].numero,
                req.params.id,
              ]
            );
          }
          // Et forcément j'actualise le fait que le tournoi a commencé
          connection.query("update tournaments set start = 1 where id = ? ", [
            req.params.id,
          ]);
          res.status(200).send("Tournoi lancé");
        }
      );
    }
  );
};

// API qui gère la victoire d'un joueur et donc on doit actualiser les données des joueurs
exports.win_player = (req, res) => {
  // On récupère l'id du vainqueur, l'id du perdant et à quelle tour il est actuellement dans le tournoi
  const { win, lose, tour } = req.body;
  // Directement on supprime le joueur qui a perdu, car il ne participe plus au tournoi et donc il n'a plus le statut de joueur
  connection.query(
    "delete from players where numero = ? and id_tournament = ?",
    [lose, req.params.id],
    (err, results) => {
      // Si le joueur n'a pas gagné la finale alors c'est le processus normal
      if (tour != 1) {
        // On récupère tous les joueurs du tournoi
        connection.query(
          "select * from players where id_tournament = ?",
          [req.params.id],
          (err, results) => {
            // On essaye de récupérer un joueur qui pourrait potentiellement etre le prochain adversaire du gagnant en vérifiant certains attributs
            const player_waiting = results.find(
              (p) =>
                p.id_versus == 0 &&
                p.class == tour / 2 &&
                p.id_tournament == req.params.id
            );
            // Si il n'y a aucun joueur qui peut etre le prochain adversaire du gagnant, alors on passe le joueur au tour suivant mais avec aucun adversaire pour le moment
            if (!player_waiting) {
              connection.query(
                "update players set id_versus = 0, class = ? where numero = ? and id_tournament = ?",
                [tour / 2, win, req.params.id],
                (err, results) => {
                  res.send("Victoire validé");
                }
              );
              // Sinon on a bien trouvé un joueur qui rempli les cases pour etre le prochain adversaire du gagnant
            } else {
              // Donc on actualise les attributs du gagnant
              connection.query(
                "update players set id_versus = ?, class = ? where numero = ? and id_tournament = ?",
                [player_waiting.numero, tour / 2, win, req.params.id],
                (err, results) => {
                  // On actualise aussi les attributs du joueur qui attendait son prochain adversaire
                  connection.query(
                    "update players set id_versus = ? where numero = ? and id_tournament = ?",
                    [win, player_waiting.numero, req.params.id],
                    (err, results) => {
                      res.send("Victoire validé");
                    }
                  );
                }
              );
            }
          }
        );
        // Ca veut dire que le joueur a gagné la finale
      } else {
        // Donc on dit que le tournoi est terminé
        connection.query(
          "update tournaments set start = 2 where id = ?",
          [req.params.id],
          (err, results) => {
            // Et on actualise le joueur en tant que vainqueur
            connection.query(
              "update players set class = 0.5 where numero = ? and id_tournament = ?",
              [win, req.params.id],
              (err, results) => {
                res.send("Victoire validé");
              }
            );
          }
        );
      }
    }
  );
};
