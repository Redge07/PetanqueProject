const connection = require("../config/db");

// API pour savoir si le tournoi a commencé et pour récupérer les joueurs
exports.charge = (req, res) => {
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
        // Sinon le tournoi a commencé
      } else if (results[0].start == 1) {
        // Je récupère tous les joueurs qui sont inscrits
        connection.query(
          "select * from players where id_tournament = ?",
          [req.params.id],
          // Tous les joueurs ont deja leur adversaire attribué mais on fait un beau algo pour envoyer les confrontations correctement au front-end
          (err, results) => {
            // On déclare le tableau qui contiendra les matches au propres
            let matches = [];
            // On fait un tour de tous les joueurs (forcément il y a des doublons car 2 joueurs se rencontrent forcément)
            for (let i = 0; i < results.length; i++) {
              const key = [
                Math.min(results[i].numero, results[i].id_versus),
                Math.max(results[i].numero, results[i].id_versus),
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
                  id: results[i].numero,
                  pseudo: results[i].pseudo,
                };
              } else {
                match.joueurB = {
                  id: results[i].numero,
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
};

// API pour supprimer un joueur
exports.delete_players = (req, res) => {
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
};

exports.valid = (req, res) => {
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
};
