const express = require("express");
const app = express();
const port = 5000;
const mysql = require("mysql2");

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "petanque",
});

app.get("/", (req, res) => {
  res.send("Salut");
});

app.use("/players", require("./routes/players"));

// //--------------------------Log & Sign-----------------------------

// // Api pour l'inscription
// app.post("/inscription", (req, res) => {
//   const { pseudo, password } = req.body;
//   connection.query(
//     "select * from users where pseudo = ?",
//     [pseudo],
//     (err, results) => {
//       if (results.length > 0) {
//         return res.json({ res: "Il y a deja un pseudo portant ce nom" });
//       } else {
//         connection.query(
//           "insert into users (pseudo, password) values (?, ?)",
//           [pseudo, password],
//           (err, results) => {
//             connection.query(
//               "select * from users where pseudo = ?",
//               [pseudo],
//               (err, results) => {
//                 if (results.length > 0) {
//                   // results = [ { id: 6, pseudo: 'Regis', password: 'aaaaaa' } ]
//                   res.json({ res: 1, player: results[0] });
//                 } else {
//                   res.json({ res: 0 });
//                 }
//               }
//             );
//           }
//         );
//       }
//     }
//   );
// });

// // Api pour la connexion
// app.post("/connexion", (req, res) => {
//   const { pseudo, password } = req.body;
//   connection.query(
//     "select * from users where pseudo = ? and password = ?",
//     [pseudo, password],
//     (err, results) => {
//       if (results.length > 0) {
//         // results = [ { id: 6, pseudo: 'Regis', password: 'aaaaaa' } ]
//         res.json({ res: 1, player: results[0] });
//       } else {
//         res.json({ res: 0 });
//       }
//     }
//   );
// });

//-------------------------Organisateur------------------------------------

// Api pour lister tous les tournois que le compte en question a crée
app.get("/get_tournament/:admin", (req, res) => {
  connection.query(
    "select * from tournaments where admin = ?",
    [req.params.admin],
    (err, results) => {
      if (results.length > 0) {
        res.json({ res: 1, results });
      } else {
        res.json({ res: 0 });
      }
    }
  );
});

// Api pour crée un tournoi quand on est connecté en tant qu'utilisateur
app.post("/create_tournament/:admin", (req, res) => {
  const { name } = req.body;
  connection.query(
    "insert into tournaments (name, admin) values(?, ?)",
    [name, req.params.admin],
    (err, results) => {
      res.send(`Votre tournoi ${name} a bien été crée`);
    }
  );
});

// Supprimer un tournoi
app.delete("/delete_tournament/:id", (req, res) => {
  connection.query(
    "delete from tournaments where id = ?",
    [req.params.id],
    (err, results) => {
      res.send(`Le tournoi numéro ${req.params.id} à bien été supprimé`);
    }
  );
});

//----------------Players----------------------------------------

// API pour récupérer la situation d'un utilisateur sur sa situation de joueur
app.get("/charge_player/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    // On regarde si il est enregistré comme un joueur
    "select * from players where id_user = ?",
    [id],
    (err, results) => {
      const player = results[0];
      // Si il n'est pas dans la liste alors ce n'est pas un joueur
      if (results.length == 0) {
        res.json({ res: 0 });
        // Si il est dans la liste alors c'est un joueur et on va voir sa situation précise
      } else {
        // Si le jouuer n'a pas gagné le tournoi on continue le processus normal
        if (player.class != 0.5) {
          // On va récupérer le tournoi auquel il est attribué en tant que joueur
          connection.query(
            "select * from tournaments where id = ?",
            [player.id_tournament],
            (err, results) => {
              const tournament = results[0];
              // Si la colonne valider du joueur est a 0 alors sa demande est en attente
              if (player.valider == 0) {
                res.json({
                  res: 1,
                  pseudo: player.pseudo,
                  tournamentName: tournament.name,
                });
                // Sinon ca veut dire que sa demande a été accepté et donc il participe a un tournoi
              } else {
                // Si le tournoi n'a pas commencé, alors le joueur a juste a attendre que ca commence
                if (tournament.start == 0) {
                  res.json({
                    res: 2,
                    pseudo: player.pseudo,
                    tournamentName: tournament.name,
                  });
                  // Sinon ca veut dire que le tournoi a commencé
                } else {
                  // On va vérifié l'adversaire du joueur
                  connection.query(
                    "select * from players where id_user = ?",
                    [player.id_versus],
                    (err, results) => {
                      // Si ca retourne rien alors il n'a pas encore d'adversaire attribué
                      if (results.length == 0) {
                        res.json({
                          res: 3,
                          pseudo: player.pseudo,
                          tournamentName: tournament.name,
                          pseudoVersus: "Pas d'adversaire encore",
                          class: player.class,
                        });
                        // Sinon il a bien un adversaire attribué
                      } else {
                        const playerVersus = results[0];
                        res.json({
                          res: 4,
                          pseudo: player.pseudo,
                          tournamentName: tournament.name,
                          idVersus: playerVersus.id_user,
                          pseudoVersus: playerVersus.pseudo,
                          class: player.class,
                        });
                      }
                    }
                  );
                }
              }
            }
          );
          // Le joueur a déjà gagné le tournoi
        } else {
          res.json({
            res: 5,
            msg: "Félicitations vous etes le grand vainqueur",
          });
        }
      }
    }
  );
});

// API qui va renvoyer la requete d'un joueur pour trouver un tournoi et vouloir s'inscrire
app.get("/search_tournament/:id", (req, res) => {
  const idTournament = req.params.id;
  // On cherche l'id du tournoi dans la table
  connection.query(
    "select * from tournaments where id = ?",
    [idTournament],
    (err, results) => {
      const tournament = results[0];
      // Si ca retourne rien, alors l'id ne correspond a aucun tournoi
      if (results.length == 0) {
        res.json({ res: 0 });
        // Sinon ca veut dire qu'un tournoi existe bien
      } else {
        // Si il n'a pas commencé
        if (tournament.start == 0) {
          res.json({
            res: 1,
            id: tournament.id,
            name: tournament.name,
          });
          // Sinon il a deja commencé
        } else {
          res.json({ res: 2, name: tournament.name });
        }
      }
    }
  );
});

// API qui inscrit la demande d'un joueur a un tournoi
app.post("/add_player_to_tournament/", (req, res) => {
  const { idUser, idTournament, pseudo } = req.body;
  connection.query(
    "insert into players (pseudo, id_versus, class, id_tournament, id_user, valider) values (?, 0, 0, ?, ?, 0)",
    [pseudo, idTournament, idUser],
    (err, results) => {
      res.json({
        res: "Vous avez été ajouté au tournoi numéro " + idTournament,
      });
    }
  );
});

// API qui désinscrit un joueur d'un tournoi
app.delete("/delete_inscription/:id", (req, res) => {
  connection.query(
    "delete from players where id_user = ?",
    [req.params.id],
    (err, results) => {
      res.json({ res: "Vous vous etes désinscrit du tournoi" });
    }
  );
});

//-----------------------Tournament------------------------------

// API pour savoir si le tournoi a commencé et pour récupérer les joueurs
app.get("/recup_players_tournament/:id", (req, res) => {
  // On récupère le tournoi
  connection.query(
    "select * from tournaments where id = ?",
    [req.params.id],
    (err, results) => {
      // Si le tournoi n'a pas commencé
      if (results[0].start == 0) {
        // On récupère tous les joueurs en lien avec le tournoi
        connection.query(
          "select * from players where id_tournament = ?",
          [req.params.id],
          (err, results) => {
            res.json({ res: 0, results: results });
          }
        );
        // Sinon le tournoi n'a pas commencé
      } else if (results[0].start == 1) {
        // Je récupère tous les joueurs qui sont inscrits
        connection.query(
          "select * from players where id_tournament = ?",
          [req.params.id],
          // Tous les joueurs ont deja leur adversaire attribué mais on fait un beau algo pour envoyer les confrontations correctement au front-end
          (err, results) => {
            // On déclare le tableau qui contiendra les matches au propres
            let matches = [];
            // On fait un tour de tous les joueurs (forcément il y a des doublons car 2 jouers se rencontrent forcément)
            for (let i = 0; i < results.length; i++) {
              const key = [
                Math.min(results[i].id_user, results[i].id_versus),
                Math.max(results[i].id_user, results[i].id_versus),
              ].join("-");

              let match = matches.find((m) => m.key == key);
              if (!match) {
                match = {
                  key,
                  joueurA: null,
                  joueurB: null,
                  class: results[i].class,
                };
                matches.push(match);
              }
              if (!match.joueurA) {
                match.joueurA = {
                  id: results[i].id_user,
                  pseudo: results[i].pseudo,
                };
              } else {
                match.joueurB = {
                  id: results[i].id_user,
                  pseudo: results[i].pseudo,
                };
              }
            }
            res.json({ res: 1, results: matches });
          }
        );
        // Le tournoi est fini et il y a un vainqueur
      } else {
        connection.query(
          "select * from players where id_tournament = ?",
          [req.params.id],
          (err, results) => {
            res.json({ res: 2, msg: "Le vainqueur est " + results[0].pseudo });
          }
        );
      }
    }
  );
});

// API pour supprimer un joueur
app.delete("/delete_player/:id", (req, res) => {
  connection.query(
    "delete from players where id_user = ?",
    [req.params.id],
    (err, results) => {
      // Renvoyer un message pour dire que ce joueur a bien été supprimer
      res.json({
        res: 1,
        id: req.params.id,
        msg: "Le joueur a été supprimé du tournoi",
      });
    }
  );
});

app.put("/valid_player/:id", (req, res) => {
  connection.query(
    "update players set valider = 1 where id_user = ?",
    [req.params.id],
    (err, results) => {
      // Renvoyer un message pour dire que ce joueur a bien été accepté
      res.json({
        res: 1,
        id: req.params.id,
        msg: "Le joueur a été ajouté au tournoi",
      });
    }
  );
});

//------------------------Go_Tournament-----------------------

function getRandomElements(arr, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(index, 1)[0]); // enlève de la liste
  }

  return result;
}

// API pour lancer le tournoi
app.put("/go_tournament/:id", (req, res) => {
  // Dans un premier temps je supprime les joueurs qui n'ont pas été accepté au tournoi
  connection.query(
    "delete from players where id_tournament = ? and valider = 0",
    [req.params.id],
    (err, results) => {
      // Je récupère tous les joueurs qui sont inscrit
      connection.query(
        "select * from players where id_tournament = ? and valider = 1",
        [req.params.id],
        // On va attribuer a chaque joueur sont futurs adversaire et a quelle tour du tournoi il va commencer
        (err, results) => {
          const listPlayers = results;
          const nb_players = results.length;
          const p2 = 2 ** Math.floor(Math.log2(nb_players));
          const prelim = (nb_players - p2) * 2;
          const tirage = getRandomElements(listPlayers, prelim);
          // Les joueurs tirés aléatoirement qui vont disputer un match en plus
          for (let i = 0; i < tirage.length; i++) {
            connection.query(
              "update players set id_versus = ?, class = ? where id_user = ?",
              [
                i % 2 == 0 ? tirage[i + 1].id_user : tirage[i - 1].id_user,
                p2,
                tirage[i].id_user,
              ]
            );
          }
          // Les joueurs qui vont attendre que les autres finissent leur premeir match
          for (let i = 0; i < listPlayers.length; i++) {
            connection.query(
              "update players set id_versus = ?, class = ? where id_user = ?",
              [
                i % 2 == 0
                  ? listPlayers[i + 1].id_user
                  : listPlayers[i - 1].id_user,
                p2 / 2,
                listPlayers[i].id_user,
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
});

// API qui gère la victoire d'un joueur et donc on doit actualiser les données des joueurs
app.put("/win_player/:id", (req, res) => {
  // On récupère l'id du vainqueur, l'id du perdant et à quelle tour il est actuellement dans le tournoi
  const { win, lose, tour } = req.body;
  // Directement on supprime le joueur qui a perdu, car il ne participe plus au tournoi et donc il n'a plus le statut de joueur
  connection.query(
    "delete from players where id_user = ?",
    [lose],
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
                "update players set id_versus = 0, class = ? where id_user = ?",
                [tour / 2, win],
                (err, results) => {
                  res.send("Victoire validé");
                }
              );
              // Sinon on a bien trouvé un joueur qui rempli les cases pour etre le prochain adversaire du gagnant
            } else {
              // Donc on actualise les attributs du gagnant
              connection.query(
                "update players set id_versus = ?, class = ? where id_user = ?",
                [player_waiting.id_user, tour / 2, win],
                (err, results) => {
                  // On actualise aussi les attributs du joueur qui attendait son prochain adversaire
                  connection.query(
                    "update players set id_versus = ? where id_user = ?",
                    [win, player_waiting.id_user],
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
              "update players set class = 0.5 where id_user = ?",
              [win],
              (err, results) => {
                res.send("Victoire validé");
              }
            );
          }
        );
      }
    }
  );
});

app.listen(port, () => {
  console.log("Go server");
});
