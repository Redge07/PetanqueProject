const connection = require("../config/db");

// Api pour l'inscription
exports.inscription = (req, res) => {
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
};

// Api pour la connexion
exports.connection = (req, res) => {
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
};
