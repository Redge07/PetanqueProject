const connection = require("../config/db");

function getRandomElements(arr, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(index, 1)[0]); // enlève de la liste
  }

  return result;
}

function shuffleArray(array) {
  const arr = [...array]; // copie pour ne pas modifier l'original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // index aléatoire
    [arr[i], arr[j]] = [arr[j], arr[i]]; // échange
  }
  return arr;
}

// API pour lancer le tournoi
exports.go_tournament = (req, res) => {
  // Dans un premier temps je supprime les joueurs qui n'ont pas été accepté au tournoi
  connection.query(
    "select * from players where id_tournament = ? and valider = 1",
    [req.params.id],
    (err, results) => {
      if (results.length > 1) {
        const listPlayers = results;
        connection.query(
          "select * from tournaments where id = ?",
          [req.params.id],
          (err, results) => {
            const style = results[0].style;

            // Je supprime tous les joueurs qui ne sont pas inscrit
            connection.query(
              "delete from players where id_tournament = ? and valider = 0",
              [req.params.id],
              (err, results) => {
                connection.query(
                  "update tournaments set nb_joueurs = ? where id = ?",
                  [listPlayers.length, req.params.id],
                  () => {
                    if (style == "arbre") {
                      // On va attribuer a chaque joueur sont futurs adversaire et a quelle tour du tournoi il va commencer

                      const nb_players = listPlayers.length;
                      const p2 = 2 ** Math.floor(Math.log2(nb_players));
                      const prelim = (nb_players - p2) * 2;
                      const tirage = getRandomElements(listPlayers, prelim);
                      // Les joueurs tirés aléatoirement qui vont disputer un match en plus
                      for (let i = 0; i < tirage.length; i++) {
                        connection.query(
                          "update players set id_versus = ?, class = ? where numero = ? and id_tournament = ?",
                          [
                            i % 2 == 0
                              ? tirage[i + 1].numero
                              : tirage[i - 1].numero,
                            p2,
                            tirage[i].numero,
                            req.params.id,
                          ]
                        );
                      }
                      // Les joueurs qui vont attendre que les autres finissent leur premeir match
                      for (let i = 0; i < listPlayers.length; i++) {
                        if (
                          i == listPlayers.length - 1 &&
                          listPlayers.length % 2 != 0
                        ) {
                          connection.query(
                            "update players set class = ? where numero = ? and id_tournament = ?",
                            [p2 / 2, listPlayers[i].numero, req.params.id]
                          );
                        } else {
                          connection.query(
                            "update players set id_versus = ?, class = ? where numero = ? and id_tournament = ?",
                            [
                              i % 2 == 0
                                ? listPlayers[i + 1].numero
                                : listPlayers[i - 1].numero,
                              p2 / 2,
                              listPlayers[i].numero,
                              req.params.id,
                            ]
                          );
                        }
                      }
                    } else {
                      const listPlayersM = shuffleArray(listPlayers);
                      for (let i = 0; i < listPlayersM.length; i++) {
                        connection.query(
                          "update players set id_versus = ?, class = 0, round = 1, groupe = ? where numero = ? and id_tournament = ?",
                          [
                            i % 2 == 0
                              ? listPlayersM[i + 1].numero
                              : listPlayersM[i - 1].numero,
                            "A",
                            listPlayersM[i].numero,
                            req.params.id,
                          ]
                        );
                      }
                    }
                    // Et forcément j'actualise le fait que le tournoi a commencé
                    connection.query(
                      "update tournaments set start = 1 where id = ? ",
                      [req.params.id]
                    );
                    res.status(200).send("Tournoi lancé");
                  }
                );
              }
            );
          }
        );
      } else {
        res.status(200).send("Il faut au moins 2 joueurs");
      }
    }
  );
};

// API qui gère la victoire d'un joueur et donc on doit actualiser les données des joueurs pour un tournoi Arbre
exports.win_player_arbre = (req, res) => {
  // On récupère l'id du vainqueur, l'id du perdant et à quelle tour il est actuellement dans le tournoi
  const { win, lose, tour } = req.body;
  connection.query(
    "select * from tournaments where id = ?",
    [req.params.id],
    (err, results) => {
      // Directement on supprime le joueur qui a perdu, car il ne participe plus au tournoi et donc il n'a plus le statut de joueur
      connection.query(
        "delete from players where numero = ? and id_tournament = ?",
        [lose, req.params.id],
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
                    "update players set id_versus = 0, class = ? where numero = ? and id_tournament = ?",
                    [tour / 2, win, req.params.id],
                    (err, results) => {
                      res.send("Victoire validé");
                    }
                  );
                  // Sinon on a bien trouvé un joueur qui rempli les cases pour etre le prochain adversaire du gagnant
                } else {
                  // Donc on actualise les attributs du gagnant
                  connection.query(
                    "update players set id_versus = ?, class = ? where numero = ? and id_tournament = ?",
                    [player_waiting.numero, tour / 2, win, req.params.id],
                    (err, results) => {
                      // On actualise aussi les attributs du joueur qui attendait son prochain adversaire
                      connection.query(
                        "update players set id_versus = ? where numero = ? and id_tournament = ?",
                        [win, player_waiting.numero, req.params.id],
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
              "select * from players where numero = ? and id_tournament = ?",
              [win, req.params.id],
              (err, results) => {
                connection.query(
                  "update tournaments set start = 2, vainqueur = ? where id = ?",
                  [results[0].pseudo, req.params.id],
                  (err, results) => {
                    // Et on actualise le joueur en tant que vainqueur
                    connection.query(
                      "update players set class = 0.5 where numero = ? and id_tournament = ?",
                      [win, req.params.id],
                      (err, results) => {
                        res.send("Victoire validé");
                      }
                    );
                  }
                );
              }
            );
          }
        }
      );
    }
  );
};

// Fonction qui nous donne des infos utile sur le gagnant ou le perdant
// Pour le gagnant on retourne l'information si le prochain tour va necessité un barrage et le nombre de matchs du prochain tour
// Pour le perdant on retourne le nouveau groupe puisqu'il descend et aussi le nombre de match de son prochain tour
const verif_impaire = (groupe, round, nb_joueurs, lose) => {
  if (groupe == "A" && round == 1) {
    // Si le 2 eme tour aura un nombre pair ou impair de joueur
    if ((nb_joueurs / 2) % 2 != 0) {
      return [lose == 1 ? "B" : true, Math.ceil(nb_joueurs / 2 / 2)];
    } else {
      return [lose == 1 ? "B" : false, Math.ceil(nb_joueurs / 2 / 2)];
    }
  } else if (groupe == "A" && round == 2) {
    nb_joueurs = nb_joueurs / 2;
    // Si le 2 eme tour aura un nombre pair ou impair de joueur
    if (nb_joueurs % 2 != 0) {
      nb_joueurs = (nb_joueurs - 1) / 2;
      // Si le 3 eme tour aura un nombre pair ou impair de joueur
      if (nb_joueurs % 2 != 0) {
        return [lose == 1 ? "B2" : true, Math.ceil(nb_joueurs / 2)];
      } else {
        return [lose == 1 ? "B2" : false, Math.ceil(nb_joueurs / 2)];
      }
    } else {
      nb_joueurs = nb_joueurs / 2;
      // Si le 3 eme tour aura un nombre pair ou impair de joueur
      if (nb_joueurs % 2 != 0) {
        return [lose == 1 ? "B2" : true, Math.ceil(nb_joueurs / 2)];
      } else {
        return [lose == 1 ? "B2" : false, Math.ceil(nb_joueurs / 2)];
      }
    }
  } else if (groupe == "B" && round == 2) {
    nb_joueurs = nb_joueurs / 2;
    // Si le 2 eme tour aura un nombre pair ou impair de joueur
    if (nb_joueurs % 2 != 0) {
      nb_joueurs = (nb_joueurs + 1) / 2;
      // Si le 3 eme tour aura un nombre pair ou impair de joueur
      if (nb_joueurs % 2 != 0) {
        return [lose == 1 ? "C" : true, Math.ceil(nb_joueurs / 2)];
      } else {
        return [lose == 1 ? "C" : false, Math.ceil(nb_joueurs / 2)];
      }
    } else {
      nb_joueurs = nb_joueurs / 2;
      // Si le 3 eme tour aura un nombre pair ou impair de joueur
      if (nb_joueurs % 2 != 0) {
        return [lose == 1 ? "C" : true, Math.ceil(nb_joueurs / 2)];
      } else {
        return [lose == 1 ? "C" : false, Math.ceil(nb_joueurs / 2)];
      }
    }
  }
};

// Fonction qui gère le fait qu'un joueur est gagné son match dans un tournoi cascade
exports.win_player_cascade = (req, res) => {
  // On récupère le numéro du gagnant et du perdant, le round du match qu'il a gagné (donc si c'est son premier par exemple)
  const { win, lose, round, groupe, barrage } = req.body;
  connection.query(
    "select * from tournaments where id = ?",
    [req.params.id],
    (err, results) => {
      // On récupère le nombre de joueurs dans le tournoi
      const nb_joueurs = results[0].nb_joueurs;
      connection.query(
        "select * from players where id_tournament = ?",
        [req.params.id],
        (err, results) => {
          // On récupère tous les joueurs du tournoi
          const listPlayers = results;
          // On récupère les joueurs qui représente les futurs adversaire du gagnant en fonction de ses caractéristiques, exception pour un joueur qui est en barrage car il est dans une situation ou si ils gagnent il reste dans le meme round au final
          const nb_joueurs_suite = listPlayers.filter(
            (p) =>
              p.groupe == groupe &&
              p.round == parseInt(round) + (barrage == 1 ? 0 : 1) &&
              p.id_tournament == req.params.id
          );
          // On récupère l'info si le prochain round du gagnant nécessitera un barrage ou pas et aussi le nombre de match du prochain round concerné
          const impair = verif_impaire(groupe, round, nb_joueurs, 0);
          console.log(impair);
          // Si le gagnant a gagné un barrage c'est un cadre spécifique
          if (barrage == 1) {
            const impairBarrage = verif_impaire(
              groupe,
              round - 1,
              nb_joueurs,
              0
            );
            // On récupère le numéro de match qui sera attribué au gagnant
            const num_match = nb_joueurs_suite.length + 1 - impairBarrage[1];
            // Et donc on essaye de trouver un adversaire qui correspond a ce numéro de match
            const adversaire = nb_joueurs_suite.find(
              (p) => p.num_match == num_match
            );
            // On actualise les données du gagnant
            connection.query(
              "update players set id_versus = ?, num_match = ?, barrage = 0 where numero = ? and id_tournament = ?",
              [adversaire.numero, num_match, win, req.params.id],
              () => {
                // Mais aussi les données du joueur qui va recevoir ce gagnant en question
                connection.query(
                  "update players set id_versus = ? where numero = ? and id_tournament = ?",
                  [win, adversaire.numero, req.params.id],
                  () => handleLooser(listPlayers, nb_joueurs, 1)
                );
              }
            );
            // Sinon le cas normal ou le gagnant n'a pas gagné un barrage
          } else {
            // Si le prochain tour est un tour qui nécessite un barrage et que le joueur sera placé sur le match qui concerne le barrage
            if (
              impair[0] &&
              (nb_joueurs_suite.length == 0 ||
                nb_joueurs_suite.length == impair[1])
            ) {
              // Alors on essaye de trouver un adversaire qui est aussi dans le barrage pour le round d'après
              const adversaire = nb_joueurs_suite.find(
                (p) =>
                  p.barrage == 1 &&
                  p.round == parseInt(round) + 1 &&
                  p.groupe == groupe &&
                  p.id_tournament == req.params.id
              );
              // Actualisé les données du gagnant et le faire affronter potentiellement un adversaire de barrage
              connection.query(
                "update players set id_versus = ?, round = ?, num_match = 1, barrage = 1 where numero = ? and id_tournament = ?",
                [
                  // Sinon on dit qui l'aura pas d'adversaire encore
                  adversaire ? adversaire.numero : 0,
                  parseInt(round) + 1,
                  win,
                  req.params.id,
                ],
                () => {
                  // Si y'a bien un adversaire on actualise son nouveau adversaire
                  if (adversaire) {
                    connection.query(
                      "update players set id_versus = ? where numero = ? and id_tournament = ?",
                      [win, adversaire.numero, req.params.id],
                      () => handleLooser(listPlayers, nb_joueurs)
                    );
                  } else {
                    handleLooser(listPlayers, nb_joueurs);
                  }
                }
              );
              // Sinon ça n'a rien avoir avec le barrage donc on continue normalement
            } else {
              // On récupère le numéro du match qui sera attribué au gagnant pour le prochain tour
              const num_match =
                // On vérifie si le nombre de joueur est supérieur ou égale au nombre de match, ce qui voudrait dire que la moitié des places ont été prise et donc on pourra directement attribué un adversaire au gagnant
                nb_joueurs_suite.length >= impair[1]
                  ? nb_joueurs_suite.length + 1 - impair[1]
                  : nb_joueurs_suite.length + 1;
              // On trouve l'adversaire grace au numéro du match
              const adversaire = nb_joueurs_suite.find(
                (p) => p.num_match == num_match
              );
              // On actualise les données du gagnant
              connection.query(
                "update players set id_versus = ?, round = ?, num_match = ?, barrage = 0 where numero = ? and id_tournament = ?",
                [
                  adversaire ? adversaire.numero : 0,
                  parseInt(round) + 1,
                  num_match,
                  win,
                  req.params.id,
                ],
                () => {
                  // Et les données de l'adversaire
                  if (adversaire) {
                    connection.query(
                      "update players set id_versus = ? where numero = ? and id_tournament = ?",
                      [win, adversaire.numero, req.params.id],
                      () => handleLooser(listPlayers, nb_joueurs)
                    );
                  } else {
                    handleLooser(listPlayers, nb_joueurs);
                  }
                }
              );
            }
          }
        }
      );
    }
  );

  // Fonction qui s'enchaine quand les données du gagnant ont bien été mise a jour, et la on actualise les données du perdant
  const handleLooser = (listPlayers, nb_joueurs, barrage = 0) => {
    // On récupère le joueurs qui a perdu
    const looser = listPlayers.find(
      (p) => p.numero == lose && p.id_tournament == req.params.id
    );
    let verif_looser;
    // On récupère le prochain groupe du perdant puisqu'il a perdu et le nombre de mmatch du prochain round, change en fonction si le gars a perdu en barrage ou pas
    if (barrage == 1) {
      verif_looser = verif_impaire(
        looser.groupe,
        parseInt(looser.round) - 1,
        nb_joueurs,
        1
      );
    } else {
      verif_looser = verif_impaire(looser.groupe, looser.round, nb_joueurs, 1);
    }
    // Les joueurs qui peuvent etre potentiellement l'adversaire de celui qui a perdu
    const nb_joueurs_suite = listPlayers.filter(
      (p) =>
        p.id_tournament == req.params.id &&
        p.round == parseInt(looser.round) + (barrage == 1 ? 0 : 1) &&
        p.groupe == verif_looser[0]
    );
    // On récupère le numéro de match pour le perdant dans son prochain round
    const num_match =
      nb_joueurs_suite.length >= verif_looser[1]
        ? nb_joueurs_suite.length + 1 - verif_looser[1]
        : nb_joueurs_suite.length + 1;
    // On récupère l'adversaire qui correspond a ce numéro de tournoi
    const adversaire = nb_joueurs_suite.find(
      (p) =>
        p.id_tournament == req.params.id &&
        p.round == parseInt(looser.round) + (barrage == 1 ? 0 : 1) &&
        p.groupe == verif_looser[0] &&
        p.num_match == num_match
    );
    // On actualise les données du perdant
    connection.query(
      "update players set id_versus = ?, round = ?, groupe = ?, num_match = ?, barrage = 0 where numero = ? and id_tournament = ?",
      [
        adversaire ? adversaire.numero : 0,
        parseInt(looser.round) + (barrage == 1 ? 0 : 1),
        verif_looser[0],
        num_match,
        lose,
        req.params.id,
      ],
      () => {
        // Et on adresse le perdant comme nouvelle adversaire pour l'adversaire du perdant
        if (adversaire) {
          connection.query(
            "update players set id_versus = ? where numero = ? and id_tournament = ?",
            [lose, adversaire.numero, req.params.id],
            () => res.send("Victoire validé")
          );
        } else {
          res.send("Victoire validé");
        }
      }
    );
  };
};
