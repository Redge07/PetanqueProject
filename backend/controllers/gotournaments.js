const connection = require("../config/db");

function getRandomElements(arr, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(index, 1)[0]); // enlève de la liste
  }

  return result;
}

function shuffleArray(array) {
  const arr = [...array]; // copie pour ne pas modifier l'original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // index aléatoire
    [arr[i], arr[j]] = [arr[j], arr[i]]; // échange
  }
  return arr;
}

// API pour lancer le tournoi
exports.go_tournament = (req, res) => {
  // Dans un premier temps je supprime les joueurs qui n'ont pas été accepté au tournoi
  connection.query(
    "select * from players where id_tournament = ? and valider = 1",
    [req.params.id],
    (err, results) => {
      if (results.length > 1) {
        const listPlayers = results;
        connection.query(
          "select * from tournaments where id = ?",
          [req.params.id],
          (err, results) => {
            const style = results[0].style;

            // Je supprime tous les joueurs qui ne sont pas inscrit
            connection.query(
              "delete from players where id_tournament = ? and valider = 0",
              [req.params.id],
              (err, results) => {
                if (style == "arbre") {
                  // On va attribuer a chaque joueur sont futurs adversaire et a quelle tour du tournoi il va commencer

                  const nb_players = listPlayers.length;
                  const p2 = 2 ** Math.floor(Math.log2(nb_players));
                  const prelim = (nb_players - p2) * 2;
                  const tirage = getRandomElements(listPlayers, prelim);
                  // Les joueurs tirés aléatoirement qui vont disputer un match en plus
                  for (let i = 0; i < tirage.length; i++) {
                    connection.query(
                      "update players set id_versus = ?, class = ? where numero = ? and id_tournament = ?",
                      [
                        i % 2 == 0
                          ? tirage[i + 1].numero
                          : tirage[i - 1].numero,
                        p2,
                        tirage[i].numero,
                        req.params.id,
                      ]
                    );
                  }
                  // Les joueurs qui vont attendre que les autres finissent leur premeir match
                  for (let i = 0; i < listPlayers.length; i++) {
                    if (
                      i == listPlayers.length - 1 &&
                      listPlayers.length % 2 != 0
                    ) {
                      connection.query(
                        "update players set class = ? where numero = ? and id_tournament = ?",
                        [p2 / 2, listPlayers[i].numero, req.params.id]
                      );
                    } else {
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
                  }
                } else {
                  const listPlayersM = shuffleArray(listPlayers);
                  for (let i = 0; i < listPlayersM.length; i++) {
                    connection.query(
                      "update players set id_versus = ?, class = 0, num_match = 1, groupe = ? where numero = ? and id_tournament = ?",
                      [
                        i % 2 == 0
                          ? listPlayersM[i + 1].numero
                          : listPlayersM[i - 1].numero,
                        "A",
                        listPlayersM[i].numero,
                        req.params.id,
                      ]
                    );
                  }
                }
                // Et forcément j'actualise le fait que le tournoi a commencé
                connection.query(
                  "update tournaments set start = 1 where id = ? ",
                  [req.params.id]
                );
                res.status(200).send("Tournoi lancé");
              }
            );
          }
        );
      } else {
        res.status(200).send("Il faut au moins 2 joueurs");
      }
    }
  );
};

// API qui gère la victoire d'un joueur et donc on doit actualiser les données des joueurs
exports.win_player = (req, res) => {
  // On récupère l'id du vainqueur, l'id du perdant et à quelle tour il est actuellement dans le tournoi
  const { win, lose, tour, num_match, groupe } = req.body;
  connection.query(
    "select * from tournaments where id = ?",
    [req.params.id],
    (err, results) => {
      if (results[0].style == "arbre") {
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
                "select * from players where numero = ? and id_tournament = ?",
                [win, req.params.id],
                (err, results) => {
                  connection.query(
                    "update tournaments set start = 2, vainqueur = ? where id = ?",
                    [results[0].pseudo, req.params.id],
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
              );
            }
          }
        );
      } else if (results[0].style == "cascade") {
        connection.query(
          "select * from players where id_tournament = ?",
          [req.params.id],
          (err, results) => {
            const player_waiting = results.find(
              (p) =>
                p.id_versus == 0 &&
                p.id_tournament == req.params.id &&
                p.num_match == num_match + 1 &&
                p.groupe == groupe
            );
            if (!player_waiting) {
              connection.query(
                "update players set id_versus = 0, num_match = ? where numero = ? and id_tournament = ?",
                [num_match + 1, win, req.params.id],
                (err, results) => {}
              );
            } else {
            }
          }
        );
      }
    }
  );
};
