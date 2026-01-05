import React from "react";

const ArbreTournament = () => {
  return (
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
                          ? p.joueurB.pseudo + ", numéro : " + p.joueurB.numero
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
  );
};

export default ArbreTournament;
