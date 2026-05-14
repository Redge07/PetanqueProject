const { query } = require("./query");

// Fonction pour mélanger l'ordre du tableau de joueur pour avoir un tournoi aléatoire
function getRandomElements(arr, n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(index, 1)[0]); // enlève de la liste
  }

  return result;
}

// Fonction pour créer un arbre
exports.createArbre = async (
  listPlayers,
  idTournament,
  really,
  round,
  groupe,
  cagnotte,
  conn,
) => {
  // La variable really est un booléan, un vrai tournoi c'est quand on lance un tournoi et tous les joueurs attendent le lancement du tournoi et de connaitre leur futurs adversaire. Un faux c'est pour le tournoi en mode cascade, y'aura un tournoi en mode arbre mais on ne peut pas attribuer les joueurs n'est le début de l'arbre car avant ils ont leur phase de round et il n'y a pas de pause entre la phase de round et la phase finale
  // Par exemple ci-dessous pour le tournoi en cascade (donc really a false) la variable listPlayers est deja la nombre de joueurs qui vont participé car on s'est pas qui atteindra ce stade et donc on envoie juste le nombre
  const nb_players = really ? listPlayers.length : listPlayers;
  // Si on a 14 joueurs alors on s'est qu'on peut combler largement un quart de finale avec 8 joeuurs, ce qui veut dire que ça commence officiellement en quart de finale mais avant il y en aura qui vont faire quelque match de huitieme de final (comme un barrage) pour ensuite avoir un vrai tournoi traditionnel avec une puissance de 2
  const p2 = 2 ** Math.floor(Math.log2(nb_players));
  // Calcul pour savoir combien feront le match de barrage, par exemple si on a 12 joueurs, 4 joueurs seront directement placé en quart de finale ce qui veut qu'il restera 4 place pour les quart de finale, ces 4 places seront gagné par les 4 vainqueurs parmi les 8 qui reste
  const prelim = (nb_players - p2) * 2;
  // A la fin de cette ligne on aura les joueur qui feront les barrage avec "tirage" et ceux qui seront directement qualifié avec "listPlayers"
  const tirage = really && getRandomElements(listPlayers, prelim);

  // On numérote les matches
  let number = 0;
  // On va commencer par les matches des personnes directement qualifié ceux qui veut dire que dans la numérotation ça sera plus élevé que les matches de barrage, donc on récupère le numéro de matches en comptant le nombre qu'il y aura en barrage
  for (let i = 1; i <= p2 / 2; i = i * 2) {
    number = number + i;
  }
  number = number + prelim / 2;

  const arrondiPalier5 = (val) => Math.floor(val / 5) * 5;

  let recompense =
    cagnotte *
    (groupe == "A"
      ? 0.1
      : groupe == "B"
        ? 0.04
        : groupe == "B2"
          ? 0.04
          : groupe == "C"
            ? 0.03
            : 0);
  recompense = arrondiPalier5(recompense);
  // Je crée les matches excluant les matches de préliminaire
  let matchInsert = [];
  for (let i = 1; i <= p2 / 2; i = i * 2) {
    for (let j = 1; j <= i; j++) {
      matchInsert.push([idTournament, number, 0, i, round, groupe, recompense]);
      number--;
    }
    recompense = arrondiPalier5(recompense * 0.75);
  }
  await query(
    "insert into matches2 (id_tournament, number, end, class, round, groupe, recompense) values ?",
    [matchInsert],
    conn,
  );

  const recompensePreliminaire = arrondiPalier5(recompense * 0.75);

  // Je crée les matches préliminaire et j'en profite pour ajouter tous les jouers car ces matches seront forcément rempli des joueurs (sauf si ca concerne le tournoi en mode cascade, avec la really on gère ça facilement)
  let matchInsert2 = [];
  for (let i = 1; i <= prelim / 2; i++) {
    matchInsert2.push([
      idTournament,
      number,
      really ? tirage[(i - 1) * 2].numero : 0,
      really ? tirage[(i - 1) * 2].pseudo : "",
      really ? tirage[(i - 1) * 2 + 1].numero : 0,
      really ? tirage[(i - 1) * 2 + 1].pseudo : "",
      0,
      p2,
      groupe,
      round,
      recompensePreliminaire,
    ]);
    number--;
  }
  if (matchInsert2.length > 0) {
    await query(
      "insert into matches2 (id_tournament, number, id_playerA, pseudo_A, id_playerB, pseudo_B, end, class, groupe, round, recompense) values ?",
      [matchInsert2],
      conn,
    );
  }
  if (groupe == "C") {
    const recompensePreliminaireA = await query(
      "select * from matches2 where groupe = 'A'",
    );
    console.log("voici récompense preliminaire : " + recompensePreliminaire);

    const recompense3v = arrondiPalier5(recompensePreliminaire * 0.75);
    console.log("voici récompense 3 : " + recompense3v);
    const recompense2v = arrondiPalier5(recompense3v / 2);
    console.log("voici récompense 2 : " + recompense2v);

    // Round 3 du groupe A = 3ème victoire
    await query(
      "update matches2 set recompense = ? where id_tournament = ? and round = 3 and groupe = 'A'",
      [recompense3v, idTournament],
      conn,
    );
    // Round 2 du groupe A, Round 3 du groupe B et B2 = 2ème victoire
    await query(
      "update matches2 set recompense = ? where id_tournament = ? and ((round = 2 and groupe = 'A') or (round = 3 and groupe = 'B') or (round = 3 and groupe = 'B2'))",
      [recompense2v, idTournament],
      conn,
    );
  }
  // Si c'est un vrai tournoi on aura besoin de ces infos pour le retour
  if (really) return { prelim, p2, tirage, number };
};
