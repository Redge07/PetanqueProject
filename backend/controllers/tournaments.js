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
        const vainqueur = {
          vainqueurA: results[0].vainqueurA,
          vainqueurB: results[0].vainqueurB,
          vainqueurC: results[0].vainqueurC,
        };
        console.log(vainqueur);

        const style = results[0].style;

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
                  round: results[i].round,
                  groupe: results[i].groupe,
                  num_match: results[i].num_match,
                  barrage: results[i].barrage,
                  tournament_style: style,
                };
                matches.push(match);
              }
              if (!match.joueurA) {
                match.joueurA = {
                  numero: results[i].numero,
                  pseudo: results[i].pseudo,
                  matches: results[i].matches,
                };
              } else {
                match.joueurB = {
                  numero: results[i].numero,
                  pseudo: results[i].pseudo,
                  matches: results[i].matches,
                };
              }
            }
            res.json({
              res: 1,
              results: matches,
              style: style,
              vainqueur: vainqueur,
            });
          }
        );

        // Le tournoi est fini et il y a un vainqueur
      } else {
        connection.query(
          "select * from tournaments where id = ?",
          [req.params.id],
          (err, results) => {
            res.json({
              res: 2,
              results: [],
              msg: "Le vainqueur est " + results[0].vainqueur,
            });
          }
        );
      }
    }
  );
};

// API pour supprimer un joueur en attente
exports.delete_players_attente = (req, res) => {
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

// API pour supprimer un joueur validé
exports.delete_players_valid = (req, res) => {
  connection.query(
    "delete from players where numero = ? and id_tournament = ?",
    [req.body.numero, req.params.id],
    (err, results) => {
      // Renvoyer un message pour dire que ce joueur a bien été supprimer
      res.json({
        res: 1,
        numero: req.body.numero,
        msg: "Le joueur a été supprimé du tournoi",
      });
    }
  );
};

// API pour accepter la demande d'un joueur
exports.valid = (req, res) => {
  connection.query(
    "select * from players where id_tournament = ? and valider = 1",
    [req.params.id],
    (err, results) => {
      console.log(req.body.id_user);
      connection.query(
        "update players set valider = 1, numero = ? where id_user = ?",
        [results.length + 1, req.body.id_user],
        (err, results) => {
          // Renvoyer un message pour dire que ce joueur a bien été accepté
          res.json({
            res: 1,
            id: req.params.id,
            msg: "Le joueur a été ajouté au tournoi",
          });
        }
      );
    }
  );
};

//API pour ajouter un joueur manuellement
exports.add_player = (req, res) => {
  const { pseudo } = req.body;

  connection.query(
    "select * from players where id_tournament = ? and valider = 1",
    [req.params.id],
    (err, results) => {
      connection.query(
        "insert into players (pseudo, id_versus, class, id_tournament, id_user, valider, numero) values(?, 0, 0, ?, -1, 1, ?)",
        [pseudo, req.params.id, results.length + 1],
        (err, results) => {
          res.send("Le joueur a été ajouté");
        }
      );
    }
  );
};
