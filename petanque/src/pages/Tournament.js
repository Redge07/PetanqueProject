import React, { useEffect, useState, useContext } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { UsersContext } from "../App";
import axios from "axios";
import Order from "../components/Order";
import { linkBackend } from "../constants/LinkBackend";

const Tournament = () => {
  // State qui récupère l'id de l'url pour savoir quel tournoi on doit afficher
  const { idTournament } = useParams();
  // State qui récupère une variable global pour savoir si on est connecté
  const { login } = useContext(UsersContext);
  const navigate = useNavigate();
  // State qui va récupérer tous les joueurs qui sont en lien avec le tournoi, vérifie aussi si le tournoi a commencé, si res = 0 alors le tournoi n'a pas commencé et on doit afficher les joueurs, sinon res = 1 et ca a commencé
  const [listPlayers, setListPlayers] = useState([]);
  // State qui gère les message quand on supprime ou qu'on accepte un joueur
  const [responseAPI, setResponseAPI] = useState({ res: 0 });
  // State qui affiche le message quand le tournoi est bien lancé
  const [responseGoTournament, setResponseGoTournament] = useState("");
  // State qui dit que tel joueur a gagné
  const [responseWin, setResponseWin] = useState("");
  // State qui va nous aider quand faudra afficher les matchs trié par leurs catégories
  const [pairesInfos, setPaireInfos] = useState({});
  // State qui permet de gérer l'affichage du classement des poules
  const [order, setOrder] = useState(false);
  // State pour avoir les données du classement
  const [dataOrder, setDataOrder] = useState([]);
  // State pour préciser si le choix des valeurs des arbres de classement est cohérent
  const [errorLengthArbre, setErrorLengthArbre] = useState("");
  useEffect(() => {
    if (!login) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    axios
      .get(linkBackend + "gotournaments/charge_classement/" + idTournament)
      .then((res) => setDataOrder(res.data));
  }, [order]);

  // Fonction qui recharge la page, on sait si le tournoi a commencé et quels sont les joueurs qui y participe
  const recharge = () => {
    setResponseAPI({ res: 0 });
    // Fonction pour connaitre les groupes, round et tour qui se déroulent pour voir les trucs qu'on affiche seulement
    const createPaires = (matches) => {
      let groupes = [];
      let rounds = [];
      let tours = [];
      matches.forEach((match) => {
        const groupe = match.groupe;
        if (!groupes.includes(groupe)) {
          groupes.push(groupe);
        }
        const round = match.round;
        if (!rounds.includes(parseInt(round))) {
          rounds.push(parseInt(round));
        }
        const tour = match.class;
        if (!tours.includes(parseFloat(tour))) {
          tours.push(parseFloat(tour));
        }
      });
      return { rounds, groupes, tours };
    };
    axios
      .get(linkBackend + "tournaments/charge/" + idTournament)
      .then((res) => {
        console.log(res.data);
        setListPlayers(res.data);
        setResponseWin("");
        const { rounds, groupes, tours } = createPaires(res.data.results);
        setPaireInfos({ rounds, groupes, tours });
      });
  };

  // Fonction pour supprimer un joueur du tournoi en attente
  const handleDeleteAttente = (value) => {
    axios
      .delete(linkBackend + "tournaments/delete_players_attente/" + value)
      .then((res) => {
        setResponseAPI(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour supprimer un joueur du tournoi en valid
  const handleDeleteValid = (value) => {
    axios
      .delete(
        linkBackend + "tournaments/delete_players_valid/" + idTournament,
        { data: { numero: value } }
      )
      .then((res) => {
        setResponseAPI(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour accepté un joueur
  const handleValid = (value) => {
    axios
      .put(linkBackend + "tournaments/valid/" + idTournament, {
        id_user: value,
      })
      .then((res) => {
        console.log(res.data);
        setResponseAPI(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour ajouter un joueur manuellement
  const handleAddPlayer = (e) => {
    e.preventDefault();
    axios
      .post(linkBackend + "tournaments/add_player/" + idTournament, {
        pseudo: e.target.elements.pseudo.value,
      })
      .then((res) => {
        console.log(res.data);
        setResponseAPI(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction pour connaitre le nombre de joueurs en attente et confirmé
  const countPlayer = (value) => {
    if (value == 0) {
      let listPlayersAttente = listPlayers.results.filter(
        (p) => p.valider == 0
      );
      return listPlayersAttente.length;
    } else {
      let listPlayersValider = listPlayers.results.filter(
        (p) => p.valider == 1
      );
      return listPlayersValider.length;
    }
  };

  // Fonction quand je décide de démarrer le tournoi
  const handleGoTournament = () => {
    axios
      .put(linkBackend + "gotournaments/go_tournament/" + idTournament)
      .then((res) => {
        setResponseGoTournament(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction quand je déclare le vainqueur dans un tournoi arbre
  const handleWinnerArbre = (win, lose, tour) => {
    axios
      .put(linkBackend + "gotournaments/win_player_arbre/" + idTournament, {
        win: win,
        lose: lose,
        tour: tour,
      })
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction quand je déclare le vainqueur
  const handleWinnerCascade = (win, lose, round, groupe, barrage, tour) => {
    axios
      .put(linkBackend + "gotournaments/win_player_cascade/" + idTournament, {
        win,
        lose,
        round,
        groupe,
        barrage,
        tour,
      })
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  // Fonction quand je déclare un vainqueur de phase de poule en mode classement
  const handleWinnerClassement = (e, numeroA, numeroB) => {
    e.preventDefault();
    if (e.target.elements.scoreA.value == e.target.elements.scoreB.value) {
      setResponseWin("Il ne peut pas y avoir d'égalité ou de cases vides");
    } else {
      // On récupère l'id du gagnant et du perdant et le score du gagnant et du perdant
      const [win, lose, scoreWin, scoreLose] =
        Number(e.target.elements.scoreA.value) >
        Number(e.target.elements.scoreB.value)
          ? [
              numeroA,
              numeroB,
              e.target.elements.scoreA.value,
              e.target.elements.scoreB.value,
            ]
          : [
              numeroB,
              numeroA,
              e.target.elements.scoreB.value,
              e.target.elements.scoreA.value,
            ];
      axios
        .put(
          linkBackend + "gotournaments/win_player_classement/" + idTournament,
          {
            win,
            lose,
            scoreWin,
            scoreLose,
          }
        )
        .then((res) => {
          setResponseWin(res.data);
          setTimeout(() => {
            recharge();
          }, 1000);
        });
    }
  };

  // Fonction quand je déclare un vainqueur de l'arbre du mode classement
  const handleWinnerClassementArbre = (win, lose, tour, groupe) => {
    axios
      .put(
        linkBackend +
          "gotournaments/win_player_classement_arbre/" +
          idTournament,
        { win, lose, tour, groupe }
      )
      .then((res) => {
        setResponseWin(res.data);
        setTimeout(() => {
          recharge();
        }, 1000);
      });
  };

  console.log(dataOrder);

  // Fonction pour lancer les arbres du mode classement quand tous les matches de phase de poules sont fini
  const handleGoArbreClassement = (e) => {
    e.preventDefault();

    const A = Number(e.target.elements.A.value);
    const B = Number(e.target.elements.B.value);
    const C = Number(e.target.elements.C.value);

    if (A + B + C > dataOrder.length) {
      setErrorLengthArbre(
        "Il n'y a pas assez de joueurs pour crée les tournois que vous avez préciser"
      );
    } else if ((B == 0) & (C > 0)) {
      setErrorLengthArbre(
        "Vous ne pouvez pas créer de tournoi pour le groupe C et ne pas en faire pour le groupe B"
      );
    } else {
      const listPlayersA = dataOrder
        .sort((a, b) => b.points - a.points)
        .slice(0, A);
      const listPlayersB =
        B == 0
          ? null
          : dataOrder.sort((a, b) => b.points - a.points).slice(A, A + B);
      const listPlayersC =
        e.target.elements.C.value == 0
          ? null
          : dataOrder
              .sort((a, b) => b.points - a.points)
              .slice(A + B, A + B + C);
      axios
        .put(
          linkBackend + "gotournaments/create_arbre_classement/" + idTournament,
          { listPlayersA, listPlayersB, listPlayersC }
        )
        .then((res) => {
          setResponseWin(res.data);
          setTimeout(() => {
            recharge();
          }, 1000);
        });
    }
  };

  useEffect(() => {
    recharge();
  }, []);
  return (
    <div>
      <h2>Tournament {idTournament}</h2>
      {/* Si le tournoi n'a pas commencé on va afficher les joueurs en attente et accepté */}
      {listPlayers.res == 0 && (
        <div>
          <div>
            <h3>Joueurs en attente</h3>
            <p>
              Il y a {countPlayer(0)}{" "}
              {countPlayer(0) > 1 ? "joueurs" : "joueur"} en attente
            </p>
            <ul>
              {/* On liste les joueurs qui sont en attente en filtrant avec le colonne "valider" */}
              {listPlayers.results
                .filter((j) => j.valider == 0)
                .map((j) => (
                  <li key={j.id_user}>
                    {/* Pseudo du joueur */}
                    <span>{j.pseudo}</span>
                    {/* Bouton pour supprimer ce joueur */}
                    <button onClick={() => handleDeleteAttente(j.id_user)}>
                      Supprimer
                    </button>
                    {/* Bouton pour accepté ce joueur */}
                    <button onClick={() => handleValid(j.id_user)}>
                      Accepté
                    </button>
                    {/* Message qui va apparaitre quand on va supprimer ou accepté un joueur, vérifie si on parle d'une suppression ou d'une validation et vérifie l'id pour bien affiché ce message au joueur concerné */}
                    {responseAPI.res == 1 && responseAPI.id == j.id_user && (
                      <p>{responseAPI.msg}</p>
                    )}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            {/* On va lister tous les joueurs qui n'ont pas encore été accepté pour ce tournoi en question dans la base de données */}
            <h3>Joueurs accepté</h3>
            <p>
              Il y a {countPlayer(1)}{" "}
              {countPlayer(1) > 1 ? "joueurs" : "joueur"} accepté
            </p>
            <ul>
              {listPlayers.results
                .filter((j) => j.valider == 1)
                .map((j) => (
                  <li key={j.numero}>
                    <span>{j.pseudo}</span>
                    <span> numéro : {j.numero}</span>
                    <button onClick={() => handleDeleteValid(j.numero)}>
                      Supprimer
                    </button>
                    {responseAPI.res == 1 && responseAPI.numero == j.numero && (
                      <p>{responseAPI.msg}</p>
                    )}
                  </li>
                ))}
            </ul>
          </div>
          <h3>Ajouté un joueur manuellement</h3>
          {/* Form pour ajouter un joueur manuellement */}
          <form onSubmit={handleAddPlayer}>
            <input
              type="text"
              name="pseudo"
              placeholder="Entrez un pseudo..."
            />
            <input type="submit" value="Inscrire le joueur" />
          </form>
          <button onClick={handleGoTournament}>Lancer le tournoi</button>
          <p>{responseGoTournament}</p>
        </div>
      )}
      {/* Le tournoi a commencé */}
      {listPlayers.res == 1 && (
        <div>
          <h2>Go Tournoi</h2>
          {/* Le tournoi en question est en arbre */}
          {listPlayers.style == "arbre" && (
            <div>
              <h3>Tournoi en Arbre</h3>
              <p>{responseWin}</p>
              <div>
                {/* Je vais trier les affichage par les tours des joueurs */}
                {pairesInfos.tours
                  .sort((a, b) => a - b)
                  .map((t) => {
                    return (
                      <div key={t}>
                        <h2>Matchs de 1/{t}</h2>
                        {/* Une fois que c'est trier, j'affiche les matches qui correspondent aux filtres */}
                        {listPlayers.results
                          .filter((versus) => versus.class == t)
                          .map((p, i) => (
                            <div key={p.key}>
                              <p>
                                Match {i + 1} : {p.joueurA.pseudo}, numéro :{" "}
                                {p.joueurA.numero} vs{" "}
                                {p.joueurB
                                  ? p.joueurB.pseudo +
                                    ", numéro : " +
                                    p.joueurB.numero
                                  : "Pas encore d'adversaire attribué"}{" "}
                                en 1/{p.class}
                              </p>
                              {p.joueurB && (
                                <div>
                                  <button
                                    onClick={() =>
                                      handleWinnerArbre(
                                        p.joueurA.numero,
                                        p.joueurB.numero,
                                        p.class
                                      )
                                    }
                                  >
                                    Victoire de {p.joueurA.pseudo}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleWinnerArbre(
                                        p.joueurB.numero,
                                        p.joueurA.numero,
                                        p.class
                                      )
                                    }
                                  >
                                    Victoire de {p.joueurB.pseudo}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          {/* Le tournoi en question est en cascade */}
          {listPlayers.style == "cascade" && (
            <div>
              <h3>Tournoi en Cascade</h3>
              <p>{responseWin}</p>
              <div>
                {/* On tri par les groupes */}
                {pairesInfos.groupes
                  .sort(
                    (a, b) =>
                      ["A", "B", "B2", "C"].indexOf(a) -
                      ["A", "B", "B2", "C"].indexOf(b)
                  )
                  .map((g) => {
                    // Si y'a personne dans ce groupe on peut arreter la et ne rien n'afficher
                    if (
                      listPlayers.results.filter((v) => v.groupe == g).length ==
                      0
                    ) {
                      return null;
                    } else {
                      return (
                        <div key={g}>
                          <h2>Groupe {g}</h2>
                          {/* Ensuite on tri par les rounds */}
                          {pairesInfos.rounds
                            .sort((a, b) => b - a)
                            .map((r) => {
                              // Si y'a personne dans ce round et dans ce groupe on peut arreter la et ne rien n'afficher
                              if (
                                listPlayers.results.filter(
                                  (v) => v.groupe == g && v.round == r
                                ).length == 0
                              ) {
                                return null;
                              } else {
                                return (
                                  <div key={r}>
                                    {r == 4 ? null : <h3>Round {r}</h3>}
                                    {pairesInfos.tours
                                      .sort((a, b) => a - b)
                                      .map((t) => {
                                        // On récupère tous les matchs qui correspondent a ce groupe, ce round et ce tour la
                                        const versusMain =
                                          listPlayers.results.filter(
                                            (versus) =>
                                              versus.groupe == g &&
                                              versus.round == r &&
                                              versus.class == t
                                          );
                                        // Si y'a aucun match dans ce round, ce groupe et ce tour on peut arreter la et ne rien n'afficher
                                        if (versusMain.length == 0) {
                                          return null;
                                        } else {
                                          return (
                                            <div key={t}>
                                              {r < 4 || t == 0.5 ? null : t ==
                                                1 ? (
                                                <h3>La finale</h3>
                                              ) : (
                                                <h3>1/{t} de finale</h3>
                                              )}
                                              {/* J'affiche les confrontations qui respectent les filtres */}
                                              {versusMain.map((versus) => {
                                                const vainqueur = `vainqueur${g}`;
                                                if (
                                                  listPlayers.vainqueur[
                                                    vainqueur
                                                  ]
                                                ) {
                                                  return (
                                                    <p>
                                                      Le vainqueur du groupe {g}{" "}
                                                      est{" "}
                                                      {
                                                        listPlayers.vainqueur[
                                                          vainqueur
                                                        ]
                                                      }
                                                    </p>
                                                  );
                                                } else {
                                                  return (
                                                    <div key={versus.key}>
                                                      {/* Montre infos entre joueur A et joueur B potentiel */}
                                                      <p>
                                                        Le joueur numéro{" "}
                                                        {versus.joueurA.numero}{" "}
                                                        ({versus.joueurA.pseudo}
                                                        ){" "}
                                                        {versus.joueurB
                                                          ? `affronte le joueur numéro ${versus.joueurB.numero} (${versus.joueurB.pseudo})`
                                                          : "n'a pas encore d'adversaire attitré"}
                                                        {/* Précise si s'agit d'un match de barrage */}
                                                        {versus.barrage ==
                                                          1 && (
                                                          <span
                                                            style={{
                                                              color: "red",
                                                            }}
                                                          >
                                                            {" "}
                                                            Il s'agit d'un match
                                                            de barrage
                                                          </span>
                                                        )}
                                                      </p>
                                                      {/* Si y'a bien joueur B pour le match alors on peut déclarer un vainqueur et donc afficher les boutons*/}
                                                      {versus.joueurB && (
                                                        <div>
                                                          <button
                                                            onClick={() =>
                                                              handleWinnerCascade(
                                                                versus.joueurA
                                                                  .numero,
                                                                versus.joueurB
                                                                  .numero,
                                                                r,
                                                                g,
                                                                versus.barrage,
                                                                versus.class
                                                              )
                                                            }
                                                          >
                                                            Victoire de{" "}
                                                            {
                                                              versus.joueurA
                                                                .pseudo
                                                            }
                                                          </button>
                                                          <button
                                                            onClick={() =>
                                                              handleWinnerCascade(
                                                                versus.joueurB
                                                                  .numero,
                                                                versus.joueurA
                                                                  .numero,
                                                                r,
                                                                g,
                                                                versus.barrage,
                                                                versus.class
                                                              )
                                                            }
                                                          >
                                                            Victoire de{" "}
                                                            {
                                                              versus.joueurB
                                                                .pseudo
                                                            }
                                                          </button>
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                }
                                              })}
                                            </div>
                                          );
                                        }
                                      })}
                                  </div>
                                );
                              }
                            })}
                        </div>
                      );
                    }
                  })}
              </div>
            </div>
          )}
          {listPlayers.style == "classement" && (
            <div>
              <button onClick={() => setOrder(false)}>Matchs</button>
              <button onClick={() => setOrder(true)}>Classement</button>
              {dataOrder.length != 0 &&
                dataOrder.filter((j) => j.nb_matchs_jouer == 3).length ==
                  dataOrder.length &&
                listPlayers.results.filter((m) => m.joueurB).length == 0 &&
                listPlayers.results.filter((m) => m.class == 0.5).length ==
                  0 && (
                  <div>
                    <form onSubmit={handleGoArbreClassement}>
                      {["A", "B", "C"].map((g) => {
                        return (
                          <div>
                            <span>Taille de l'arbre du groupe {g}</span>
                            <select
                              name={g}
                              defaultValue={g === "A" ? "8" : "0"}
                            >
                              {g == "A" ? null : (
                                <option value="0">Pas de tournoi</option>
                              )}
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="4">4</option>
                              <option value="8">8</option>
                              <option value="16">16</option>
                              <option value="32">32</option>
                            </select>
                            <br />
                          </div>
                        );
                      })}
                      <input type="submit" value="Go Tournoi en arbres" />
                    </form>
                    <p>{errorLengthArbre}</p>
                  </div>
                )}
              {!order && (
                <div>
                  <h3>Tournoi en Classement</h3>
                  <p>{responseWin}</p>
                  {pairesInfos.rounds
                    .sort((a, b) => b - a)
                    .map((r) => {
                      if (r == 4) {
                        return (
                          <div>
                            {pairesInfos.groupes
                              .sort(
                                (a, b) =>
                                  ["A", "B", "C"].indexOf(a) -
                                  ["A", "B", "C"].indexOf(b)
                              )
                              .map((g) => {
                                return (
                                  <div>
                                    {g ? <h2>Groupe {g}</h2> : null}
                                    {pairesInfos.tours
                                      .sort((a, b) => a - b)
                                      .map((t) => {
                                        if (
                                          listPlayers.results.filter(
                                            (m) => m.groupe == g && m.class == t
                                          ).length == 0 ||
                                          !g
                                        ) {
                                          return null;
                                        } else {
                                          return (
                                            <div>
                                              {t == 1 ? (
                                                <h3>La finale</h3>
                                              ) : t == 0.5 ? null : (
                                                <h3>1/{t} de finale</h3>
                                              )}
                                              {listPlayers.results
                                                .filter(
                                                  (m) =>
                                                    m.groupe == g &&
                                                    m.class == t
                                                )
                                                .map((m) => {
                                                  const vainqueur = `vainqueur${g}`;
                                                  if (
                                                    listPlayers.vainqueur[
                                                      vainqueur
                                                    ]
                                                  ) {
                                                    return (
                                                      <p>
                                                        Le gagnant est{" "}
                                                        {
                                                          listPlayers.vainqueur[
                                                            vainqueur
                                                          ]
                                                        }
                                                      </p>
                                                    );
                                                  } else {
                                                    return (
                                                      <div key={m.key}>
                                                        {/* Montre infos entre joueur A et joueur B potentiel */}
                                                        <p>
                                                          Le joueur numéro{" "}
                                                          {m.joueurA.numero} (
                                                          {m.joueurA.pseudo}){" "}
                                                          {m.joueurB
                                                            ? `affronte le joueur numéro ${m.joueurB.numero} (${m.joueurB.pseudo})`
                                                            : "n'a pas encore d'adversaire attitré"}
                                                        </p>
                                                        {/* Si y'a bien joueur B pour le match alors on peut déclarer un vainqueur et donc afficher les boutons*/}
                                                        {m.joueurB && (
                                                          <div>
                                                            <button
                                                              onClick={() =>
                                                                handleWinnerClassementArbre(
                                                                  m.joueurA
                                                                    .numero,
                                                                  m.joueurB
                                                                    .numero,
                                                                  m.class,
                                                                  m.groupe
                                                                )
                                                              }
                                                            >
                                                              Victoire de{" "}
                                                              {m.joueurA.pseudo}
                                                            </button>
                                                            <button
                                                              onClick={() =>
                                                                handleWinnerClassementArbre(
                                                                  m.joueurB
                                                                    .numero,
                                                                  m.joueurA
                                                                    .numero,
                                                                  m.class,
                                                                  m.groupe
                                                                )
                                                              }
                                                            >
                                                              Victoire de{" "}
                                                              {m.joueurB.pseudo}
                                                            </button>
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  }
                                                })}{" "}
                                            </div>
                                          );
                                        }
                                      })}
                                  </div>
                                );
                              })}
                          </div>
                        );
                        // return <h3>On verra plus tard round 4 (arbre)</h3>;
                      } else {
                        return (
                          <div key={r}>
                            <h3>Round {r}</h3>
                            {listPlayers.results
                              .filter((m) => m.round == r)
                              .map((m) => {
                                const number =
                                  m.joueurA.matches.split("-")[m.round - 1];
                                const potentielAdversaire =
                                  listPlayers.results.find(
                                    (m) =>
                                      m.joueurA.numero == number ||
                                      (m.joueurB
                                        ? m.joueurB.numero == number
                                        : m.joueurA.numero == number)
                                  );
                                const pseudo =
                                  potentielAdversaire.joueurA.numero == number
                                    ? potentielAdversaire.joueurA.pseudo
                                    : potentielAdversaire.joueurB.pseudo;
                                return (
                                  <div key={m.key}>
                                    <p>
                                      {m.joueurA.pseudo} vs{" "}
                                      {m.joueurB ? m.joueurB.pseudo : pseudo}
                                    </p>
                                    <form
                                      onSubmit={(e) =>
                                        handleWinnerClassement(
                                          e,
                                          m.joueurA.numero,
                                          m.joueurB.numero
                                        )
                                      }
                                    >
                                      <input
                                        type="number"
                                        defaultValue={0}
                                        placeholder={`Entrer le score de ${m.joueurA.pseudo}`}
                                        disabled={!m.joueurB}
                                        name="scoreA"
                                      />
                                      <input
                                        type="number"
                                        defaultValue={1}
                                        placeholder={`Entrer le score de ${
                                          m.joueurB ? m.joueurB.pseudo : pseudo
                                        }`}
                                        disabled={!m.joueurB}
                                        name="scoreB"
                                      />
                                      <input
                                        type="submit"
                                        value="Valider"
                                        disabled={!m.joueurB}
                                      />
                                    </form>
                                  </div>
                                );
                              })}
                          </div>
                        );
                      }
                    })}
                </div>
              )}
              {order && (
                <div>
                  <Order dataOrder={dataOrder} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Le tournoi est fini est on affiche le vainqueur */}
      {listPlayers.res == 2 && (
        <div>
          <h1>{listPlayers.msg}</h1>
        </div>
      )}
      <NavLink to="/Home">Retour</NavLink>
    </div>
  );
};

export default Tournament;
