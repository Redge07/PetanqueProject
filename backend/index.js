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

app.get("/get_players/:id_tournament", (req, res) => {
  connection.query(
    "select pseudo from players where id_tournament = ?",
    [req.params.id_tournament],
    (err, results) => {
      res.json(results);
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
                console.log(results);
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
      console.log(results);

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

app.post("/add_player/:id_tournament", (req, res) => {
  const { pseudo } = req.body;
  connection.query(
    "insert into players (pseudo, id_tournament) values (?, ?)",
    [pseudo, req.params.id_tournament],
    (err, results) => {
      res.send(`Le joueur ${pseudo} à eté ajouté au tournoi`);
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

app.delete("/delete_tournament/:id", (req, res) => {
  connection.query(
    "delete from tournaments where id = ?",
    [req.params.id],
    (err, results) => {
      res.send(`Le tournoi numéro ${req.params.id} à bien été supprimé`);
    }
  );
});

app.listen(port, () => {
  console.log("Go server");
});
