const connection = require("../config/db");

// Api pour lister tous les tournois que le compte en question a crée
exports.charge = (req, res) => {
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
};

// Api pour crée un tournoi quand on est connecté en tant qu'utilisateur
exports.create = (req, res) => {
  const { name } = req.body;
  connection.query(
    "insert into tournaments (name, admin) values(?, ?)",
    [name, req.params.admin],
    (err, results) => {
      res.send(`Votre tournoi ${name} a bien été crée`);
    }
  );
};

// Supprimer un tournoi
exports.delete = (req, res) => {
  connection.query(
    "delete from players where id_tournament = ?",
    [req.params.id],
    (err, results) => {
      connection.query(
        "delete from tournaments where id = ?",
        [req.params.id],
        (err, results) => {
          res.send(`Le tournoi numéro ${req.params.id} à bien été supprimé`);
        }
      );
    }
  );
};
