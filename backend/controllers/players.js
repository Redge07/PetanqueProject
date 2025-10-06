const connection = require("../config/db");

// API pour récupérer la situation d'un utilisateur sur sa situation de joueur
exports.charge = (req, res) => {
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
                    numero: player.numero,
                    tournamentName: tournament.name,
                  });
                  // Sinon ca veut dire que le tournoi a commencé
                } else {
                  // On va vérifié l'adversaire du joueur
                  connection.query(
                    "select * from players where numero = ? and id_tournament = ?",
                    [player.id_versus, player.id_tournament],
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
                          idVersus: playerVersus.numero,
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
};

// API qui va renvoyer la requete d'un joueur pour trouver un tournoi et vouloir s'inscrire
exports.search = (req, res) => {
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
};

// API qui inscrit la demande d'un joueur a un tournoi
exports.add_player = (req, res) => {
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
};

// API qui désinscrit un joueur d'un tournoi
exports.delete_player = (req, res) => {
  connection.query(
    "delete from players where id_user = ?",
    [req.params.id],
    (err, results) => {
      res.json({ res: "Vous vous etes désinscrit du tournoi" });
    }
  );
};
