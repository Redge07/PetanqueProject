const connection = require("../config/db");

// API pour créer automatiquement X joueurs dans un tournoi donné
exports.create_players = (req, res) => {
  const idTournament = req.params.id;
  const { nbPlayers, groupe = "A" } = req.body; // ex : { nbPlayers: 30 }

  if (!nbPlayers || nbPlayers < 2)
    return res.status(400).json({ message: "Nombre de joueurs invalide" });

  const players = [];
  for (let i = 1; i <= nbPlayers; i++) {
    players.push([
      `Test${i}`, // pseudo
      0, // id_versus
      nbPlayers, // class
      idTournament, // id_tournament
      -1, // id_user
      1, // valider
      i, // numero
      1, // round
      groupe, // groupe
      null, // num_match
      null, // barrage
    ]);
  }

  const sql = `
    INSERT INTO players
    (pseudo, id_versus, class, id_tournament, id_user, valider, numero, round, groupe, num_match, barrage)
    VALUES ?
  `;

  connection.query(sql, [players], (err) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      message: `${nbPlayers} joueurs créés pour le tournoi ${idTournament}`,
    });
  });
};

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
                          "update players set id_versus = ?, class = ?, round = 1, groupe = ? where numero = ? and id_tournament = ?",
                          [
                            i % 2 == 0
                              ? listPlayersM[i + 1].numero
                              : listPlayersM[i - 1].numero,
                            listPlayers.length,
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
const verif_impaire = (groupe, round, nb_joueurs, lose = 0) => {
  const groupes = {
    A: [0, 0, 0, 1],
    B: [1, 0, 0, 2],
    B2: [0, 1, 0, 3],
    C: [1, 1, 0, 4],
  };
  const newGroupes = { 1: "A", 2: "B", 3: "B2", 4: "C" };
  let nb_qualif = nb_joueurs / 2;
  let situation;
  for (let i = 0; i < round; i++) {
    situation = {
      nb_matchs: (nb_qualif % 2 == 0 ? nb_qualif : nb_qualif + 1) / 2,
      impair: nb_qualif % 2 == 0 ? false : true,
    };
    nb_qualif =
      (situation.impair
        ? groupes[groupe][i] == 1
          ? nb_qualif + 1
          : nb_qualif - 1
        : nb_qualif) / 2;
    if (i == 1 && round == 3) {
      const p2 = 2 ** Math.floor(Math.log2(nb_qualif));
      const prelim = (nb_qualif - p2) * 2;
      return [nb_qualif, prelim, p2];
    }
  }
  const newGroupe =
    newGroupes[groupes[groupe][groupes[groupe].length - 1] + round];
  return lose == 1
    ? [newGroupe, situation.nb_matchs]
    : [situation.impair, situation.nb_matchs];
};

// Fonction pour récupérer le potentiel nouveaux adversaire du gagnant ou du perdant
const returnAdversaire = (infos, nb_joueurs_suite) => {
  let adversaire;
  let num_match;
  const num_max = Math.max(0, ...nb_joueurs_suite.map((p) => p.num_match));
  // Si tous les matchs ont deja été comblé au moins une fois par un joueur
  if (num_max == infos) {
    // On récupère un adversaire qui n'a pas encore d'adversaire, et parmieux on prend celui qui le num_match le plus petit
    adversaire = nb_joueurs_suite.find(
      (p) =>
        p.num_match ==
        Math.min(
          ...nb_joueurs_suite
            .filter((p) => p.id_versus == 0)
            .map((p) => p.num_match)
        )
    );
    num_match = adversaire.num_match;
  } else {
    // On récupère le numéro de match qui sera attribué au gagnant
    num_match = nb_joueurs_suite.length + 1;
  }
  return { adversaire, num_match };
};

// Fonction qui gère le fait qu'un joueur est gagné son match dans un tournoi cascade
exports.win_player_cascade = (req, res) => {
  // On récupère le numéro du gagnant et du perdant, le round du match qu'il a gagné (donc si c'est son premier par exemple)
  const { win, lose, round, groupe, barrage, tour } = req.body;
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
          if (round == 4) {
            const nb_joueurs_suite = listPlayers.filter(
              (p) => p.groupe == groupe && p.class == tour / 2
            );
            const nb_matchs = tour / 2;
            const { adversaire, num_match } = returnAdversaire(
              nb_matchs,
              nb_joueurs_suite
            );
            const newTour = tour / 2;
            updatePlayers(adversaire, newTour, num_match);
          } else if (round == 3 && barrage == 0) {
            const infosArbre = verif_impaire(groupe, round, nb_joueurs, 0);
            let nb_joueurs_suite = listPlayers.filter(
              (p) => p.groupe == groupe && p.class < nb_joueurs
            );
            // Si y'a pas de joueur dans le tournoi en arbre encore alors c'est le premier a entré dans l'arbre
            if (nb_joueurs_suite.length == 0) {
              updatePlayers(
                false,
                infosArbre[2] / (infosArbre[1] == 0 ? 2 : 1),
                1
              );
              // Sinon un joueur a deja intégré l'arbre
            } else {
              // Si y'a une phase de pechage
              if (infosArbre[1] != 0) {
                // Si il n'y a plus de joueur dans la phase de pechage alors faut passer a la phase au-dessus
                if (
                  nb_joueurs_suite.filter((p) => p.class == infosArbre[2])
                    .length == 0
                ) {
                  nb_joueurs_suite = nb_joueurs_suite.filter(
                    (p) => p.class == infosArbre[2] / 2
                  );
                  const nb_matchs = infosArbre[2] / 2;
                  const { adversaire, num_match } = returnAdversaire(
                    nb_matchs,
                    nb_joueurs_suite
                  );
                  const newTour = infosArbre[2] / 2;
                  updatePlayers(adversaire, newTour, num_match);
                } else {
                  const num_max = Math.max(
                    0,
                    ...nb_joueurs_suite
                      .filter((p) => p.class == infosArbre[2])
                      .map((p) => p.num_match)
                  );
                  // Si la moitié des places ont été comblé
                  if (num_max == infosArbre[1] / 2) {
                    const longueur = nb_joueurs_suite.filter(
                      (p) => p.class == infosArbre[2] && p.num_match == num_max
                    ).length;
                    // Si toutes les places en pechages sont prises
                    if (longueur == 2 || longueur == 0) {
                      nb_joueurs_suite = nb_joueurs_suite.filter(
                        (p) => p.class == infosArbre[2] / 2
                      );
                      const nb_matchs = infosArbre[2] / 2;
                      const { adversaire, num_match } = returnAdversaire(
                        nb_matchs,
                        nb_joueurs_suite
                      );
                      const newTour = infosArbre[2] / 2;
                      updatePlayers(adversaire, newTour, num_match);
                    } else {
                      nb_joueurs_suite = nb_joueurs_suite.filter(
                        (p) => p.class == infosArbre[2]
                      );
                      const { adversaire, num_match } = returnAdversaire(
                        infosArbre[1] / 2,
                        nb_joueurs_suite
                      );
                      updatePlayers(adversaire, infosArbre[2], num_match);
                    }
                  } else {
                    connection.query(
                      "update players set id_versus = 0, class = ?, round = 4, num_match = ? where numero = ? and id_tournament = ?",
                      [infosArbre[2], num_max + 1, win, req.params.id],
                      () => handleLooser()
                    );
                  }
                }
              } else {
                nb_joueurs_suite = nb_joueurs_suite.filter(
                  (p) => p.class == infosArbre[2] / 2
                );
                const nb_matchs = infosArbre[2] / 2;
                const { adversaire, num_match } = returnAdversaire(
                  nb_matchs,
                  nb_joueurs_suite
                );
                const newTour = infosArbre[2] / 2;
                updatePlayers(adversaire, newTour, num_match);
              }
            }
          } else {
            // On récupère les joueurs qui représente les futurs adversaire du gagnant en fonction de ses caractéristiques, exception pour un joueur qui est en barrage car il est dans une situation ou si ils gagnent il reste dans le meme round au final
            const nb_joueurs_suite = listPlayers.filter(
              (p) =>
                p.groupe == groupe &&
                p.round == parseInt(round) + (barrage == 1 ? 0 : 1) &&
                p.id_tournament == req.params.id
            );
            const max_num = Math.max(
              ...nb_joueurs_suite.map((p) => p.num_match)
            );
            // On récupère l'info si le prochain round du gagnant nécessitera un barrage ou pas et aussi le nombre de match du prochain round concerné
            const impair = verif_impaire(
              groupe,
              barrage == 1 ? parseInt(round) - 1 : round,
              nb_joueurs,
              0
            );

            // Si le prochain tour est un tour qui nécessite un barrage et que le joueur sera placé sur le match qui concerne le barrage
            if (
              impair[0] &&
              (nb_joueurs_suite.length == 0 ||
                nb_joueurs_suite.filter((p) => p.id_versus == 0).length ==
                  impair[1]) &&
              barrage != 1
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
              const { adversaire, num_match } = returnAdversaire(
                impair[1],
                nb_joueurs_suite,
                max_num
              );
              // On actualise les données du gagnant
              connection.query(
                "update players set id_versus = ?, round = ?, num_match = ?, barrage = 0 where numero = ? and id_tournament = ?",
                [
                  adversaire ? adversaire.numero : 0,
                  parseInt(round) + (barrage == 1 ? 0 : 1),
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
                      () =>
                        handleLooser(listPlayers, nb_joueurs, barrage == 1 && 1)
                    );
                  } else {
                    handleLooser(listPlayers, nb_joueurs, barrage == 1 && 1);
                  }
                }
              );
            }
          }
        }
      );
    }
  );

  const updatePlayers = (adversaire, tour, num_match) => {
    if (adversaire) {
      connection.query(
        "update players set id_versus = ?, class = ?, round = ?, num_match = ? where numero = ? and id_tournament = ?",
        [
          adversaire.numero,
          adversaire.class,
          adversaire.round,
          adversaire.num_match,
          win,
          req.params.id,
        ],
        () => {
          connection.query(
            "update players set id_versus = ? where numero = ? and id_tournament = ?",
            [win, adversaire.numero, req.params.id],
            () => handleLooser()
          );
        }
      );
    } else {
      connection.query(
        "update players set id_versus = 0, class = ?, round = 4, num_match = ? where numero = ? and id_tournament = ?",
        [tour, num_match, win, req.params.id],
        () => handleLooser()
      );
    }
  };

  // Fonction qui s'enchaine quand les données du gagnant ont bien été mise a jour, et la on actualise les données du perdant
  const handleLooser = (listPlayers = 0, nb_joueurs = 0, barrage = 0) => {
    if (round >= 3 && barrage == 0) {
      connection.query(
        "delete from players where numero = ? and id_tournament = ?",
        [lose, req.params.id],
        () => res.send("Victoire validé")
      );
    } else {
      // On récupère le joueurs qui a perdu
      const looser = listPlayers.find(
        (p) => p.numero == lose && p.id_tournament == req.params.id
      );
      // On récupère le prochain groupe du perdant puisqu'il a perdu et le nombre de mmatch du prochain round, change en fonction si le gars a perdu en barrage ou pas
      const verif_looser = verif_impaire(
        looser.groupe,
        barrage == 1 ? parseInt(looser.round) - 1 : looser.round,
        nb_joueurs,
        1
      );

      // Les joueurs qui peuvent etre potentiellement l'adversaire de celui qui a perdu
      const nb_joueurs_suite = listPlayers.filter(
        (p) =>
          p.id_tournament == req.params.id &&
          p.round == parseInt(looser.round) + (barrage == 1 ? 0 : 1) &&
          p.groupe == verif_looser[0]
      );
      const { adversaire, num_match } = returnAdversaire(
        verif_looser[1],
        nb_joueurs_suite
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
    }
  };
};
