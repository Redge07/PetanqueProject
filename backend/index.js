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

// Pour trouver les tournois quand un joueur entre un id
app.get("/get_tournament_players/:id", (req, res) => {
  connection.query(
    "select * from tournaments where id = ?",
    [req.params.id],
    (err, results) => {
      if (results.length > 0) {
        res.json({ res: 1, results });
      } else {
        res.json({ res: 0 });
      }
    }
  );
});

// Récupérer les joueurs d'un tournoi
app.get("/get_players/:id_tournament", (req, res) => {
  connection.query(
    "select * from players where id_tournament = ? and valider = 1",
    [req.params.id_tournament],
    (err, results) => {
      res.json(results);
    }
  );
});

// Récupérer les joueurs d'un tournoi qui attendent confirmation
app.get("/get_players_waiting/:id_tournament", (req, res) => {
  connection.query(
    "select * from players where id_tournament = ? and valider = 0",
    [req.params.id_tournament],
    (err, results) => {
      res.json(results);
    }
  );
});

// API pour vérifier qu'un tournoi a commencé
app.get("/verif_start_tournament/:id", (req, res) => {
  connection.query(
    "select start from tournaments where id = ?",
    [req.params.id],
    (err, results) => {
      res.send(results[0].start);
    }
  );
});

// API Pour récupérer toutes les confrontations du tournoi en question
app.get("/get_versus/:id", (req, res) => {
  connection.query(
    "select * from players where id_tournament = ?",
    [req.params.id],
    (err, results) => {
      res.json(results);
    }
  );
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

// Api pour afficher les tournois en cours d'un joueurs
app.get("/get_tournament_user/:id", (req, res) => {
  connection.query(
    "select * from players where id_user = ?",
    [req.params.id],
    (err, results) => {
      if (results.length > 0) {
        let id_tournament = results[0].id_tournament;
        let valider = results[0].valider;
        connection.query(
          "select * from tournaments where id = ?",
          [id_tournament],
          (err, results) => {
            if (results.length === 0) {
              // Aucun tournoi trouvé
              connection.query("delete from players where id_tournament = ?", [
                id_tournament,
              ]);
              return res.json({ res: 0, error: "Tournoi introuvable" });
            }
            res.json({ res: 1, results: results[0], valider: valider });
          }
        );
      } else {
        res.json({ res: -1 });
      }
    }
  );
});

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

// Api pour faire en sorte que le joueur soit accepté au tournoi
app.put("/confirm_player/:id", (req, res) => {
  connection.query(
    "update players set valider = 1 where id = ?",
    [req.params.id],
    (err, results) => {
      res.send("Changé");
    }
  );
});

// API qui lance le tournoi, donc qui attribut pour chaque joueurs leur adversaire
app.put("/start_tournament/:id", (req, res) => {
  connection.query(
    "select * from players where id_tournament = ? and valider = 1",
    [req.params.id],
    (err, results) => {
      let list_id = [];
      for (let i = 0; i < results.length; i++) {
        list_id.push(results[i].id);
      }
      list_id.sort(() => Math.random() - 0.5);
      let matchs = [];
      for (let i = 0; i < list_id.length; i += 2) {
        matchs.push([list_id[i], list_id[i + 1]]);
      }
      const tour = matchs.length;
      for (let i = 0; i < matchs.length; i++) {
        connection.query(
          "update players set id_versus = ?, class = ? where id = ?",
          [matchs[i][1], tour, matchs[i][0]]
        );
        connection.query(
          "update players set id_versus = ?, class = ? where id = ?",
          [matchs[i][0], tour, matchs[i][1]]
        );
      }
      res.send("Le tournoi a commencé !!!");
    }
  );
  connection.query("update tournaments set start = 1 where id = ?", [
    req.params.id,
  ]);
});

// API qui gèrent le fait qu'un joueur gagne un match
app.put("/win_player/", (req, res) => {
  const { win, lose } = req.body;
  connection.query(
    "select class from players where id = ?",
    [win],
    (err, results) => {
      const tour = parseInt(results[0].class);
      const newTour = tour / 2;
      connection.query("update players set class = ? where id = ?", [
        newTour,
        win,
      ]);
      connection.query("update players set id_versus = 0 where id = ?", [win]);
      connection.query("delete from players where id = ?", [lose]);
    }
  );
});

// Ajouter un joueur a un tournoi
app.post("/add_player/:id_tournament", (req, res) => {
  const { pseudo, iduser } = req.body;
  connection.query(
    "select * from players where id_user = ?",
    [iduser],
    (err, results) => {
      if (results.length > 0) {
        res.json({
          res: 0,
          msg: "Ce joueur a deja fait une demande ou participe deja a un tournoi",
        });
      } else {
        connection.query(
          "insert into players (pseudo, id_tournament, id_user, valider) values (?, ?, ?, 0)",
          [pseudo, req.params.id_tournament, iduser],
          (err, results) => {
            res.json({
              res: 1,
              msg: `Le joueur ${pseudo} à eté ajouté au tournoi`,
            });
          }
        );
      }
    }
  );
});

// Api pour supprimer un utilisateurs
app.delete("/:id", (req, res) => {
  connection.query(
    "delete from users where id = ?",
    [req.params.id],
    (err, results) => {
      res.send(`Le user avec l'id ${req.params.id} à été supprimé`);
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

// Supprimer un joueur d'un tournoi
app.delete("/delete_player_tournament/:id", (req, res) => {
  connection.query(
    "delete from players where id = ?",
    [req.params.id],
    (err, results) => {
      res.send(`Le joueur numéro ${req.params.id} à été supprimé`);
    }
  );
});

app.delete("/delete_player_tournament_via_iduser/:id", (req, res) => {
  connection.query(
    "delete from players where id_user = ?",
    [req.params.id],
    (err, results) => {
      res.send(`Le joueur numéro ${req.params.id} à été supprimé`);
    }
  );
});

app.listen(port, () => {
  console.log("Go server");
});
