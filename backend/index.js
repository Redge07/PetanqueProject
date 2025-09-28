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

// API pour savoir contre qui on doit jouer
app.get("/get_versus_player/:id", (req, res) => {
  connection.query(
    "select * from players where id_user = ?",
    [req.params.id],
    (err, results) => {
      const id_versus = results[0].id_versus;
      const player = results[0];
      connection.query(
        "select pseudo from players where id = ?",
        [id_versus],
        (err, results) => {
          if (id_versus == 0) {
            res.json({
              id: player.id,
              pseudo: player.pseudo,
              tour: player.class,
              versus: "Pas d'adversaire",
            });
          } else {
            res.json({
              id: player.id,
              pseudo: player.pseudo,
              tour: player.class,
              versus: results[0].pseudo,
            });
          }
        }
      );
    }
  );
});

//--------------------------Log & Sign-----------------------------

// Api pour l'inscription
app.post("/inscription", (req, res) => {
  const { pseudo, password } = req.body;
  connection.query(
    "select * from users where pseudo = ?",
    [pseudo],
    (err, results) => {
      if (results.length > 0) {
        return res.json({ res: "Il y a deja un pseudo portant ce nom" });
      } else {
        connection.query(
          "insert into users (pseudo, password) values (?, ?)",
          [pseudo, password],
          (err, results) => {
            connection.query(
              "select * from users where pseudo = ?",
              [pseudo],
              (err, results) => {
                if (results.length > 0) {
                  // results = [ { id: 6, pseudo: 'Regis', password: 'aaaaaa' } ]
                  res.json({ res: 1, player: results[0] });
                } else {
                  res.json({ res: 0 });
                }
              }
            );
          }
        );
      }
    }
  );
});

// Api pour la connexion
app.post("/connexion", (req, res) => {
  const { pseudo, password } = req.body;
  connection.query(
    "select * from users where pseudo = ? and password = ?",
    [pseudo, password],
    (err, results) => {
      if (results.length > 0) {
        // results = [ { id: 6, pseudo: 'Regis', password: 'aaaaaa' } ]
        res.json({ res: 1, player: results[0] });
      } else {
        res.json({ res: 0 });
      }
    }
  );
});

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
                  "select * from players where id = ?",
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
                        idVersus: playerVersus.id,
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
      } else {
        res.json({ res: 1 });
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
        msg: "Le joueur a été ajouté du tournoi",
      });
    }
  );
});

//------------------------Go_Tournament-----------------------

app.put("/go_tournament/:id", (req, res) => {
  connection.query(
    "delete from players where id_tournament = ? and valider = 0",
    [req.params.id]
  );
  connection.query(
    "select * from players where id_tournament = ? and valider = 1",
    [req.params.id],
    (err, results) => {
      let listPlayrs = results;
      let nb_players = results.length;
      let p2 = 2 ** Math.floor(Math.log2(nb_players));
      let prelim = (nb_players - p2) * 2;
      const playersRandom = listPlayrs
        .sort(() => 0.5 - Math.random())
        .slice(0, prelim);
    }
  );
});

app.listen(port, () => {
  console.log("Go server");
});
