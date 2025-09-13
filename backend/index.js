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

app.get("/get_tournament/:admin", (req, res) => {
  connection.query(
    "select name from tournaments where admin = ?",
    [req.params.admin],
    (err, results) => {
      res.json(results);
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

app.post("/inscription", (req, res) => {
  const { pseudo, password } = req.body;
  connection.query(
    "select * from users where pseudo = ?",
    [pseudo],
    (err, results) => {
      if (results.length > 0) {
        return res.send("Il y a deja un pseudo portant ce nom");
      } else {
        connection.query(
          "insert into users (pseudo, password) values (?, ?)",
          [pseudo, password],
          (err, results) => {
            res.send("Votre compte à bien été crée");
          }
        );
      }
    }
  );
});

app.post("/connexion", (req, res) => {
  const { pseudo, password } = req.body;
  connection.query(
    "select * from users where pseudo = ? and password = ?",
    [pseudo, password],
    (err, results) => {
      if (results.length > 0) {
        res.send("1");
      } else {
        res.send("0");
      }
    }
  );
});

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

app.delete("/:id", (req, res) => {
  connection.query(
    "delete from users where id = ?",
    [req.params.id],
    (err, results) => {
      res.send(`Le user avec l'id ${req.params.id} à été supprimé`);
    }
  );
});

app.listen(port, () => {
  console.log("Go server");
});
