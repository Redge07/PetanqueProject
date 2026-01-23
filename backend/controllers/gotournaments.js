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

// Fonction qui aide la fonction pour attribué 3 adversaire a chaque joueur pour le mode classement
function roundRobinPairs(ids) {
  const n = ids.length;
  const arr = [...ids];
  const rounds = [];

  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    for (let i = 0; i < n / 2; i++) {
      pairs.push([arr[i], arr[n - 1 - i]]);
    }
    rounds.push(pairs);

    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop());
    arr.splice(0, arr.length, fixed, ...rest);
  }
  return rounds;
}

// Fonction pour que tous les joueurs ait 3 adversaire aléatoirement et dans le meme ordre
function generateMatches(players, nbAdversaires = 3) {
  const ids = players.map((p) => p.numero);

  const allRounds = roundRobinPairs(ids);

  const chosen = [...allRounds]
    .sort(() => Math.random() - 0.5)
    .slice(0, nbAdversaires);

  const matches = {};
  ids.forEach((id) => (matches[id] = Array(nbAdversaires).fill(null)));

  chosen.forEach((pairs, roundIdx) => {
    pairs.forEach(([a, b]) => {
      matches[a][roundIdx] = b;
      matches[b][roundIdx] = a;
    });
  });

  return matches;
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
                          ],
                        );
                      }
                      // Les joueurs qui vont attendre que les autres finissent leur premier match
                      for (let i = 0; i < listPlayers.length; i++) {
                        if (
                          i == listPlayers.length - 1 &&
                          listPlayers.length % 2 != 0
                        ) {
                          connection.query(
                            "update players set class = ? where numero = ? and id_tournament = ?",
                            [p2 / 2, listPlayers[i].numero, req.params.id],
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
                            ],
                          );
                        }
                      }
                      // Sinon faut lancer le mode cascade
                    } else if (style == "cascade") {
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
                          ],
                        );
                      }
                      // Sinon c'est le mode classement
                    } else {
                      // Pour lancer le tournoi il faut etre soit 4 ou alors etre plus de 7 et nombre paire de participant
                      if (
                        (listPlayers.length > 7 || listPlayers.length == 4) &&
                        listPlayers.length % 2 == 0
                      ) {
                        // Récupérer les matches de tous les joueurs (3 adversaire par joueur)
                        //
                        const result = generateMatches(listPlayers, 3);
                        const matches = [];
                        // On crée la variable match proprement qui nous permettra de bien remplir la table matches
                        // C'est un objet : { 1 : [4,5,2], 2: [3,6,1] ...}
                        // Donc le length est égale au nombre de joueurs en tout
                        for (let i = 1; i <= listPlayers.length; i++) {
                          result[i].forEach((a, index) => {
                            const key = `${Math.min(i, a)}-${Math.max(i, a)}`;
                            if (!matches.find((m) => m.key == key)) {
                              matches.push({
                                key,
                                idA: i,
                                idB: a,
                                pseudoA: listPlayers.find((p) => p.numero == i)
                                  .pseudo,
                                pseudoB: listPlayers.find((p) => p.numero == a)
                                  .pseudo,
                                round: index + 1,
                              });
                            }
                          });
                        }
                        // Tous les joueurs ont leur planning de match connu dans la colonne "matches" de le table "Players"
                        listPlayers.forEach((p) => {
                          connection.query(
                            "update players set id_versus = ?, class = ?, round = 1, groupe = ?, matches = ? where numero = ? and id_tournament = ?",
                            [
                              [result[p.numero][0]],
                              0,
                              null,
                              result[p.numero].join("-"),
                              p.numero,
                              p.id_tournament,
                            ],
                          );
                        });
                        // On remplit la table "matches"
                        matches.forEach((m) => {
                          connection.query(
                            "insert into matches (id_tournament, round, id_playerA, id_playerB, pseudoA, pseudoB, scoreA, scoreB, id_winner) values(?,?,?,?,?,?,0,0,0)",
                            [
                              req.params.id,
                              m.round,
                              m.idA,
                              m.idB,
                              m.pseudoA,
                              m.pseudoB,
                            ],
                          );
                        });
                        // Sinon faut indiquer que le nombre de joueur inscrit n'est pas bon pour commencer un tournoi en mode "classement"
                      } else {
                        return res
                          .status(200)
                          .send(
                            "Il faut au moins 8 joueurs ou alors 4 joueurs et que se soit un nombre de joueurs pair",
                          );
                      }
                    }
                    // Et forcément j'actualise le fait que le tournoi a commencé
                    connection.query(
                      "update tournaments set start = 1 where id = ? ",
                      [req.params.id],
                    );
                    res.status(200).send("Tournoi lancé");
                  },
                );
              },
            );
          },
        );
      } else {
        res.status(200).send("Il faut au moins 2 joueurs");
      }
    },
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
                    p.id_tournament == req.params.id,
                );
                // Si il n'y a aucun joueur qui peut etre le prochain adversaire du gagnant, alors on passe le joueur au tour suivant mais avec aucun adversaire pour le moment
                if (!player_waiting) {
                  connection.query(
                    "update players set id_versus = 0, class = ? where numero = ? and id_tournament = ?",
                    [tour / 2, win, req.params.id],
                    (err, results) => {
                      res.send("Victoire validé");
                    },
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
                        },
                      );
                    },
                  );
                }
              },
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
                      },
                    );
                  },
                );
              },
            );
          }
        },
      );
    },
  );
};

// Fonction qui nous donne des infos utile sur le gagnant ou le perdant
// Pour le gagnant on retourne l'information si le prochain tour va necessité un barrage et le nombre de matchs du prochain tour
// Pour le perdant on retourne le nouveau groupe puisqu'il descend et aussi le nombre de match de son prochain tour
const verif_impaire = (groupe, round, nb_joueurs, lose = 0) => {
  // Objet qui présente le potentiel parcourt d'un joueur, donc pour le C c'est un gars qui a perdu les 2 premiers et a gagné le dernier, et la dernière valeur représente le groupe mets sous forme d'entier, donc A = 1
  // Des l'entrée on connait le parcours du joueur grace a son groupe
  const groupes = {
    A: [0, 0, 0, 1],
    B: [1, 0, 0, 2],
    B2: [0, 1, 0, 3],
    C: [1, 1, 0, 4],
  };
  const newGroupes = { 1: "A", 2: "B", 3: "B2", 4: "C" };
  // On récupère le nombre de gagnant qu'il y aura a un certain tour, on commence toujours avec le nombre de joueurs inscrit au tournoi de base
  // Donc la on connait deja le nombre de joueurs qui seront au round 2
  let nb_qualif = nb_joueurs / 2;
  // Variable situation pour connaitre le nombre de match et si on aura besoin d'un barrage pour le prochain round
  let situation;
  // i représentera le round, i = 0 veut dire round 1
  for (let i = 0; i < round; i++) {
    situation = {
      // Si un nombre de gagnant impair alors un match de plus pour faire le barrage
      nb_matchs: (nb_qualif % 2 == 0 ? nb_qualif : nb_qualif + 1) / 2,
      impair: nb_qualif % 2 == 0 ? false : true,
    };

    // On connait donc la situation pour le prochain round
    // Maintenant on calcul le nombre de qualifier pour la prochaine boucle, pour le premier tour de boucle on connait deja le nombre de joueurs qui seront censé etre au 3eme round
    nb_qualif =
      (situation.impair
        ? // En connaissant son parcours, on peut savoir si au round i il gagne ou perd par rapport a son groupe, par exemple dans tous les cas un i = 0 (round 1) qui est groupe C a perdu au premier match (forcément, je refait l'arbre de probabilité en gros)
          groupes[groupe][i] == 1
          ? // + 1 car on va récupérer le perdant du barrage du groupe d'au-dessus
            nb_qualif + 1
          : // - 1 car on va perdre le perdant du barrage
            nb_qualif - 1
        : nb_qualif) / 2;
    // en finissant le 2eme tour de boucle on connait deja le nombre de joueurs qui sont censé se qualifier apres le 3eme match de poule (donc le nombre de joueurs qui vont rejoindre l'arbre)
    // Et donc on enverra l'info au gagnant du 3eme round comment il doit se placer pour la suite (combien en pechage et tout)
    if (i == 1 && round == 3) {
      const p2 = 2 ** Math.floor(Math.log2(nb_qualif));
      const prelim = (nb_qualif - p2) * 2;
      return [nb_qualif, prelim, p2];
    }
  }
  // Calcul du groupe pour le perdant
  const newGroupe =
    // En ayant mis les groupes sous forme de numéro on peut trouver le prochain groupe du perdant avecune simple addition du round auquel il a perdu
    newGroupes[groupes[groupe][groupes[groupe].length - 1] + round];
  // En fonction de si il s'agit d'une défaite ou d'une victoire on renvoie pas la meme réponse
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
            .map((p) => p.num_match),
        ),
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
      // On récupère l'info de si les arbres de chaque groupe ont une phase de pechage en cours ou fini
      const pechage = {
        PA: results[0].PA,
        PB: results[0].PB,
        PB2: results[0].PB2,
        PC: results[0].PC,
      };
      connection.query(
        "select * from players where id_tournament = ?",
        [req.params.id],
        (err, results) => {
          // On récupère tous les joueurs du tournoi
          const listPlayers = results;
          // Si il s'agit d'un match qui est dans l'arbre
          if (round == 4) {
            if ((groupe == "B" || groupe == "B2") && tour == 1) {
              return updateBigFinaleB(listPlayers);
            }
            // On récupère les joueurs qui sont dans le meme groupe et dans le tour d'au-dessus
            const nb_joueurs_suite = listPlayers.filter(
              (p) => p.groupe == groupe && p.class == tour / 2,
            );
            // Ensuite on récupère l'adversaire potentiel et on met a jour les infos du gagnant, du perdant et du potentiel adversaire
            const nb_matchs = tour / 2;
            const { adversaire, num_match } = returnAdversaire(
              nb_matchs,
              nb_joueurs_suite,
            );
            const newTour = tour / 2;
            console.log(newTour);
            console.log(adversaire);

            if (newTour == 0.5 && groupe != "B" && groupe != "B2") {
              const vainqueur = `vainqueur${groupe}`;
              connection.query(
                `update tournaments set ${vainqueur} = ? where id = ?`,
                [
                  listPlayers.find((p) => p.numero == win).pseudo,
                  req.params.id,
                ],
              );
            }

            if (newTour == 0.25) {
              const vainqueur = `vainqueur${groupe}`;
              connection.query(
                `update tournaments set ${vainqueur} = ? where id = ?`,
                [
                  listPlayers.find((p) => p.numero == win).pseudo,
                  req.params.id,
                ],
              );
            }

            updatePlayers(
              adversaire,
              newTour,
              num_match,
              4,
              groupe,
              0,
              listPlayers,
              nb_joueurs,
            );
            // Si il s'agit d'un match qui conclut la phase de poules pour les 2 joueurs (donc passer au faits que le gagnant passe a l'arbre)
          } else if (round == 3 && barrage == 0) {
            // Récupérer les infos de l'arbre pour savoir le nombre de qualifiers (en géneral) pour l'arbre du groupe en question, le nombre de joueurs qui seront en pechage et le nombre de joueurs souhaité pour passer a un arbre classique (puissance de 2)
            const infosArbre = verif_impaire(groupe, round, nb_joueurs, 0);
            // Les joueurs qui sont deja dans l'arbre
            let nb_joueurs_suite = listPlayers.filter(
              (p) => p.groupe == groupe && p.class < nb_joueurs,
            );
            if (
              infosArbre[2] / (infosArbre[1] == 0 ? 2 : 1) == 0.5 &&
              groupe != "B" &&
              groupe != "B2"
            ) {
              const vainqueur = `vainqueur${groupe}`;
              connection.query(
                `update tournaments set ${vainqueur} = ? where id = ?`,
                [
                  listPlayers.find((p) => p.numero == win).pseudo,
                  req.params.id,
                ],
              );
            }
            if (
              infosArbre[2] / (infosArbre[1] == 0 ? 2 : 1) == 0.5 &&
              (groupe == "B" || groupe == "B2")
            ) {
              return updateBigFinaleB(listPlayers);
            }
            if (nb_joueurs_suite.length == 0) {
              // Si y'a pas de joueur dans le tournoi en arbre encore alors c'est le premier a entré dans l'arbre
              updatePlayers(
                false,
                infosArbre[2] / (infosArbre[1] == 0 ? 2 : 1),
                1,
                4,
                groupe,
                0,
                listPlayers,
                nb_joueurs,
              );
              // Le premier joueur qui rentre permet de savoir si le groupe en question a une phase de pechage en cours (donc la le premier joueur déclenche le fait qu'il faut une phase de pechage)
              if (infosArbre[1] != 0) {
                connection.query(
                  `update tournaments set P${groupe} = 1 where id = ${req.params.id}`,
                );
              }
              // Sinon un joueur a deja intégré l'arbre
            } else {
              // Si y'a une phase de pechage en cours, alors le joueur vas y passer
              if (pechage["P" + groupe] == 1) {
                nb_joueurs_suite = nb_joueurs_suite.filter(
                  (p) => p.class == infosArbre[2],
                );
                const nb_matchs = infosArbre[1] / 2;
                const { adversaire, num_match } = returnAdversaire(
                  nb_matchs,
                  nb_joueurs_suite,
                );
                // Si le joueur prend la dernière place qui avait dans la phase de pechage alors il l'a cloture (plus personne ne pourra intégré cette phase et passera directement au tour suivant)
                if (adversaire && num_match == infosArbre[1] / 2) {
                  connection.query(
                    `update tournaments set P${groupe} = 0 where id = ${req.params.id}`,
                  );
                }
                const newTour = infosArbre[2];
                updatePlayers(
                  adversaire,
                  newTour,
                  num_match,
                  4,
                  groupe,
                  0,
                  listPlayers,
                  nb_joueurs,
                );
                // Il n'y a pas de phase de pechage en cours (soit y'en a pas de base soit un joueur a deja pris la dernière place qui restait), mettre le joueur dans la phase d'au-dessus (au final le tour classique pour débuter l'arbre)
              } else {
                nb_joueurs_suite = nb_joueurs_suite.filter(
                  (p) => p.class == infosArbre[2] / 2,
                );
                const nb_matchs = infosArbre[2] / 2;
                const { adversaire, num_match } = returnAdversaire(
                  nb_matchs,
                  nb_joueurs_suite,
                );
                const newTour = infosArbre[2] / 2;
                updatePlayers(
                  adversaire,
                  newTour,
                  num_match,
                  4,
                  groupe,
                  0,
                  listPlayers,
                  nb_joueurs,
                );
              }
            }
            // Sinon c'est un match qui s'est fini dans la phase de poules et le gagnant et perdant vont continuer le tournoi dans leur groupes respectif
          } else {
            // On récupère les joueurs qui représente les futurs adversaire du gagnant en fonction de ses caractéristiques, exception pour un joueur qui est en barrage car il est dans une situation ou si ils gagnent il reste dans le meme round au final
            const nb_joueurs_suite = listPlayers.filter(
              (p) =>
                p.groupe == groupe &&
                p.round == parseInt(round) + (barrage == 1 ? 0 : 1) &&
                p.id_tournament == req.params.id,
            );
            // On récupère l'info si le prochain round du gagnant nécessitera un barrage ou pas et aussi le nombre de match du prochain round concerné
            const impair = verif_impaire(
              groupe,
              barrage == 1 ? parseInt(round) - 1 : round,
              nb_joueurs,
              0,
            );
            // Si le prochain tour est un tour qui nécessite un barrage et que le joueur sera placé sur le match qui concerne le barrage (concerne uniquement les joueurs qui ont gagné un match qui n'est pas un barrage evidemment)
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
                  p.id_tournament == req.params.id,
              );
              // Actualisé les données du gagnant et le faire affronter potentiellement un adversaire de barrage
              updatePlayers(
                adversaire,
                nb_joueurs,
                1,
                round + 1,
                groupe,
                1,
                listPlayers,
                nb_joueurs,
              );
              // Sinon le gagnant sera placés dans un match normal au prochain tour
            } else {
              const { adversaire, num_match } = returnAdversaire(
                impair[1],
                nb_joueurs_suite,
              );
              updatePlayers(
                adversaire,
                nb_joueurs,
                num_match,
                parseInt(round) + (barrage == 1 ? 0 : 1),
                groupe,
                0,
                listPlayers,
                nb_joueurs,
                barrage == 1 && 1,
              );
            }
          }
        },
      );
    },
  );

  // Fonction qui met a jour les données du gagnant ou du perdant et change les données du potentiel adversaire
  // Si il s'agit d'un gagnant la fonction renverra vers une nouvelle fonction pour gérer le cas du perdant, si il s'agit du perdant ca veut dire que les données du perdant et du gagnant ont été changer et donc on peut renvoyer la réponse de l'API a l'utilisateur
  const updatePlayers = (
    adversaire,
    tour,
    num_match,
    round,
    groupe,
    barrage,
    listPlayers = false,
    nb_joueurs = false,
    // dit que le joueur vient d'un match de barrage (fromBarrage plutot)
    goBarrage = 0,
    looser = 0,
  ) => {
    if (adversaire) {
      connection.query(
        "update players set id_versus = ?, class = ?, round = ?, groupe = ?, num_match = ?, barrage = ? where numero = ? and id_tournament = ?",
        [
          adversaire.numero,
          adversaire.class,
          adversaire.round,
          adversaire.groupe,
          adversaire.num_match,
          adversaire.barrage,
          looser == 1 ? lose : win,
          req.params.id,
        ],
        () => {
          connection.query(
            "update players set id_versus = ? where numero = ? and id_tournament = ?",
            [looser == 1 ? lose : win, adversaire.numero, req.params.id],
            () =>
              looser == 1
                ? res.send("Victoire validé")
                : handleLooser(listPlayers, nb_joueurs, goBarrage == 1 ? 1 : 0),
          );
        },
      );
    } else {
      connection.query(
        "update players set id_versus = 0, class = ?, round = ?, groupe = ?, num_match = ?, barrage = ? where numero = ? and id_tournament = ?",
        [
          tour,
          round,
          groupe,
          num_match,
          barrage,
          looser == 1 ? lose : win,
          req.params.id,
        ],
        () =>
          looser == 1
            ? res.send("Victoire validé")
            : handleLooser(listPlayers, nb_joueurs, goBarrage == 1 ? 1 : 0),
      );
    }
  };

  // Fonction qui s'enchaine quand les données du gagnant ont bien été mise a jour, et la on actualise les données du perdant
  const handleLooser = (listPlayers, nb_joueurs, barrage) => {
    // Si le perdant a perdu son dernier match ou il a perdu dans l'arbre alors on le supprime
    if (round >= 3 && barrage == 0) {
      connection.query(
        "delete from players where numero = ? and id_tournament = ?",
        [lose, req.params.id],
        () => res.send("Victoire validé"),
      );
      // Sinon on va le faire rétrograder au groupe d'en-dessous
    } else {
      // On récupère le joueurs qui a perdu
      const looser = listPlayers.find(
        (p) => p.numero == lose && p.id_tournament == req.params.id,
      );
      // On récupère le prochain groupe du perdant puisqu'il a perdu et le nombre de mmatch du prochain round, change en fonction si le gars a perdu en barrage ou pas
      const verif_looser = verif_impaire(
        looser.groupe,
        barrage == 1 ? parseInt(looser.round) - 1 : looser.round,
        nb_joueurs,
        1,
      );
      // Les joueurs qui peuvent etre potentiellement l'adversaire de celui qui a perdu
      const nb_joueurs_suite = listPlayers.filter(
        (p) =>
          p.id_tournament == req.params.id &&
          p.round == parseInt(looser.round) + (barrage == 1 ? 0 : 1) &&
          p.groupe == verif_looser[0],
      );
      const { adversaire, num_match } = returnAdversaire(
        verif_looser[1],
        nb_joueurs_suite,
      );
      updatePlayers(
        adversaire,
        nb_joueurs,
        num_match,
        parseInt(looser.round) + (barrage == 1 ? 0 : 1),
        verif_looser[0],
        0,
        0,
        0,
        0,
        1,
      );
    }
  };
  const updateBigFinaleB = (listPlayers) => {
    connection.query(
      "delete from players where numero = ? and id_tournament = ?",
      [lose, req.params.id],
      () => {
        const adversaire = listPlayers.find(
          (p) => p.class == 0.5 && p.groupe == "B",
        );

        if (adversaire) {
          return connection.query(
            "update players set id_versus = ?, class = 0.5, round = 4, groupe = 'B', num_match = 1 where numero = ? and id_tournament = ?",
            [adversaire.numero, win, req.params.id],
            () => {
              connection.query(
                "update players set id_versus = ? where numero = ? and id_tournament = ?",
                [win, adversaire.numero, req.params.id],
                () => {
                  return res.send("Victoire validé");
                },
              );
            },
          );
        } else {
          return connection.query(
            "update players set id_versus = 0, class = 0.5, round = 4, groupe = 'B', num_match = 1 where numero = ? and id_tournament = ?",
            [win, req.params.id],
            () => {
              return res.send("Victoire validé");
            },
          );
        }
      },
    );
  };
};

// API pour gérer lorsqu'un match du mode classement en phase de poule finit, gérer le vainqueur et le perdant
exports.win_player_classement = (req, res) => {
  const { win, lose, scoreWin, scoreLose } = req.body;
  connection.query(
    "select * from players where id_tournament = ?",
    [req.params.id],
    (err, results) => {
      const listPlayers = results;
      // Je sélectionne le match qui correspond a l'affrontement en le win et le lose
      connection.query(
        "SELECT * FROM matches WHERE ((id_PlayerA = ? AND id_PlayerB = ?) OR (id_PlayerA = ? AND id_PlayerB = ?)) AND id_tournament = ?",
        [win, lose, lose, win, req.params.id],
        (err, results) => {
          const match = results[0];
          // J'enregistre le score et le gagnant de ce match en question
          connection.query(
            "update matches set scoreA = ?, scoreB = ?, id_winner = ? where ((id_PlayerA = ? AND id_PlayerB = ?) OR (id_PlayerA = ? AND id_PlayerB = ?)) AND id_tournament = ?",
            [
              match.id_playerA == win ? scoreWin : scoreLose,
              match.id_playerB == win ? scoreWin : scoreLose,
              win,
              win,
              lose,
              lose,
              win,
              req.params.id,
            ],
            () => {
              // Si le vainqueur a gagné son troisième match de poule alors on le fait passer au round 4 pour dire qu'il est potentiellment pret pour continuer dans le tournoi en arbre mais on sait pas si il aura assez de points justement
              if (
                listPlayers.find(
                  (p) => p.numero == win && p.id_tournament == req.params.id,
                ).round == 3
              ) {
                // Faire passer le vainqueur et le perdant au round 4
                connection.query(
                  "update players set id_versus = 0, round = 4 where numero = ? and id_tournament = ?",
                  [win, req.params.id],
                  () => {
                    connection.query(
                      "update players set id_versus = 0, round = 4 where numero = ? and id_tournament = ?",
                      [lose, req.params.id],
                      () => res.send("victoire validé"),
                    );
                  },
                );
                // Sinon alors les joueurs vont continuer dans la suite de la phase de poule normalement avec la fonction updatePlayers
              } else {
                updatePlayers(listPlayers, win);
              }
            },
          );
        },
      );
    },
  );

  // Fonction qui met a jour les prochains adversaire du vainqueur et du looser pour la phase de poule
  const updatePlayers = (listPlayers, numero) => {
    const players = listPlayers.find(
      (p) => p.numero == numero && p.id_tournament == req.params.id,
    );
    const adversaire = listPlayers.find(
      (p) => p.numero == players.matches.split("-")[players.round],
    );
    // On met a jour les données du gagnant ou du perdant
    connection.query(
      "update players set id_versus = ?, round = ? where numero = ? and id_tournament = ?",
      [
        players.round == adversaire.round - 1 ? adversaire.numero : 0,
        players.round + 1,
        numero,
        req.params.id,
      ],
      () => {
        // Si y'a bien un adversaire alors on met ces données a jour
        if (players.round == adversaire.round - 1) {
          connection.query(
            "update players set id_versus = ? where numero = ? and id_tournament = ?",
            [numero, adversaire.numero, req.params.id],
            () =>
              numero == win
                ? updatePlayers(listPlayers, lose)
                : res.send("Victoire validé"),
          );
          // Sinon on passe a la suite, si on vient de finir de mettre a jour les données du vainqueur faut bien les faire aussi pour le perdant, sinon ça veut dire qu'on a mis a jour les données du perdant et qu'on peut dire qu'on a validé la fin du match et que tout est a jour
        } else {
          numero == win
            ? updatePlayers(listPlayers, lose)
            : res.send("Victoire validé");
        }
      },
    );
  };
};

// API pour gérer les matches qui finissent dans l'arbre du mode classement
exports.win_player_classement_arbre = (req, res) => {
  const { win, lose, tour, groupe } = req.body;
  // On supprime définitivement le joueur qui a perdu
  connection.query(
    "delete from players where numero = ? and id_tournament = ?",
    [lose, req.params.id],
    () => {
      // On va placer le vainqueur dans le tour suivant
      connection.query(
        "select * from players where id_tournament = ? and groupe = ?",
        [req.params.id, groupe],
        (err, results) => {
          if (tour / 2 == 0.5) {
            const vainqueur = `vainqueur${groupe}`;
            connection.query(
              `update tournaments set ${vainqueur} = ? where id = ?`,
              [results[0].pseudo, req.params.id],
            );
          }
          const nb_joueurs_suite = results.filter((j) => j.class == tour / 2);
          const num_max = Math.max(
            0,
            ...nb_joueurs_suite.map((j) => j.num_match),
          );
          // Ca veut dire qu'il n'aura pas encore d'adversaire attribué et donc qu'on peut modifier les données du gagnat et donner la réponse l'API et partir
          if (num_max < tour / 2) {
            connection.query(
              "update players set id_versus = 0, class = ?, num_match = ? where numero = ? and id_tournament = ?",
              [tour / 2, num_max + 1, win, req.params.id],
              () => res.send("Victoire validé"),
            );
            // Sinon il aura un adversaire attribué
          } else {
            const adversaire = nb_joueurs_suite.find(
              (j) =>
                j.num_match ==
                Math.min(
                  ...nb_joueurs_suite
                    .filter((j) => j.id_versus == 0)
                    .map((j) => j.num_match),
                ),
            );
            // On modifie les données du gagnant et de l'adversaire, et on peut finir l'API
            connection.query(
              "update players set id_versus = ?, class = ?, num_match = ? where numero = ? and id_tournament = ?",
              [
                adversaire.numero,
                adversaire.class,
                adversaire.num_match,
                win,
                req.params.id,
              ],
              () => {
                connection.query(
                  "update players set id_versus = ? where numero = ? and id_tournament = ?",
                  [win, adversaire.numero, req.params.id],
                  () => {
                    res.send("Victoire validé");
                  },
                );
              },
            );
          }
        },
      );
    },
  );
};

// API pour pouvoir récupérer les résultats des matches de phase de poule du mode classement et donc pouvoir construire le classment aux utilisateurs
exports.charge_classement = (req, res) => {
  connection.query(
    "select * from matches where id_tournament = ? and round < 4",
    [req.params.id],
    (err, results) => {
      let players = [];
      // Toute l'algo pour ressortir des données en JSON qui montre les points de tous les joueurs proprement
      results.forEach((m) => {
        let playerA = players.find((p) => p.numero == m.id_playerA);
        if (!playerA) {
          players.push({
            numero: m.id_playerA,
            pseudo: m.pseudoA,
            points: m.id_winner == m.id_playerA ? m.scoreA + 5 : m.scoreA,
            nb_matchs_jouer: m.id_winner > 0 ? 1 : 0,
          });
        } else if (m.id_winner > 0) {
          const points = playerA.points;
          const nb_matchs_jouer = playerA.nb_matchs_jouer;
          playerA.points =
            points + (m.id_winner == playerA.numero ? m.scoreA + 5 : m.scoreA);
          playerA.nb_matchs_jouer = nb_matchs_jouer + 1;
        }
        let playerB = players.find((p) => p.numero == m.id_playerB);
        if (!playerB) {
          players.push({
            numero: m.id_playerB,
            pseudo: m.pseudoB,
            points: m.id_winner == m.id_playerB ? m.scoreB + 5 : m.scoreB,
            nb_matchs_jouer: m.id_winner > 0 ? 1 : 0,
          });
        } else if (m.id_winner > 0) {
          const points = playerB.points;
          const nb_matchs_jouer = playerB.nb_matchs_jouer;
          playerB.points =
            points + (m.id_winner == playerB.numero ? m.scoreB + 5 : m.scoreB);
          playerB.nb_matchs_jouer = nb_matchs_jouer + 1;
        }
      });
      res.json(players);
    },
  );
};

// Fonction qui mélange l'ordre des joueurs pour avoir des confrontations aléatoires
function melanger(array) {
  const shuffled = [...array]; // on copie pour ne pas modifier l’original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // index aléatoire
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // on échange
  }
  return shuffled;
}

// API qui permet de lançer un tournoi en arbre pour le mode classement une fois que la phase de poule est terminée
exports.create_arbre_classement = async (req, res) => {
  const groupes = ["A", "B", "C", "D"];
  // On récupère toutes la liste de chaque groupe
  let { listPlayersA, listPlayersB, listPlayersC, listPlayersD } = req.body;

  // On mélange chaque liste
  let listPlayers = [
    listPlayersA ? melanger(listPlayersA) : null,
    listPlayersB ? melanger(listPlayersB) : null,
    listPlayersC ? melanger(listPlayersC) : null,
    listPlayersD ? melanger(listPlayersD) : null,
  ];

  // On parcours les groupes
  for (let j = 0; j < listPlayers.length; j++) {
    const g = listPlayers[j];
    // Pour commencer un tournoi en arbre il faut etre 8
    if (g) {
      if (g.length == 1) {
        connection.query(
          "update players set id_versus = 0, class = 0.5, groupe = ? where numero = ? and id_tournament = ?",
          [groupes[j], g[0].numero, req.params.id],
          () => {
            const vainqueur = `vainqueur${groupes[j]}`;
            connection.query(
              `update tournaments set ${vainqueur} = ? where id = ?`,
              [g[0].pseudo, req.params.id],
            );
          },
        );
      } else {
        // On parcourt tous les joueurs de ce groupe en question
        for (let i = 0; i < g.length; i++) {
          const p = g[i];
          // On crée toutes les confrontations du premier tour
          await new Promise((resolve, reject) => {
            connection.query(
              "update players set id_versus = ?, class = ?, groupe = ? where numero = ? and id_tournament = ?",
              [
                i % 2 == 0 ? g[i + 1].numero : g[i - 1].numero,
                g.length / 2,
                groupes[j],
                p.numero,
                req.params.id,
              ],
              () => resolve(),
            );
          });
        }
      }
    }
  }
  // Une fois que le tournoi en arbre est fait on supprime tous le reste de joueurs qui n'ont pas eu d'adversaire attribué car cela veut dire qu'ils n'ont pas passer les poules
  await new Promise((resolve, reject) => {
    connection.query(
      "delete from players where groupe is null and id_tournament = ?",
      [req.params.id],
      () => resolve(),
    );
  });
  res.send("Le tournoi est lancé");
};
