const { query } = require("./query");

// Fonction pour placer un joueur dans son match suivant en connaissant les caractéristiques du match qui vient de remporter
exports.placePlayerMatches2 = async (
  // Les matches qui peuvent le recevoir
  matches,
  numero,
  pseudo,
  idTournament,
  tour,
  groupe,
  conn,
) => {
  // Parmi la liste des matches suivants on prend les matches qui n'ont pas encore de joueur A (donc ça veut dire qu'il n'y a meme pas de joueur B non plus) et on prend celui qui a le numéro de match le plus petit
  const minNumberNoPlayerA = Math.min(
    ...matches
      .filter((match) => match.id_playerA == 0)
      .map((match) => match.number),
  );
  // Pareil mais avec les matches qui ont pas le joueur B rempli
  const minNumberNoPlayerB = Math.min(
    ...matches
      .filter((match) => match.id_playerB == 0)
      .map((match) => match.number),
  );
  // Si on a trouvé un match sans joueur A alors le joueur prendra la place d'un joueur A pour un match, sinon il prendra la place d'un joueur B
  const lettre = minNumberNoPlayerA != Infinity ? "A" : "B";
  // On récupère le numéro du match dans lequel il doit aller (car ça représente l'identifiant d'un match)
  const matchNumber = lettre == "A" ? minNumberNoPlayerA : minNumberNoPlayerB;
  await query(
    `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ? and class ${tour} and groupe = ?`,
    [numero, pseudo, idTournament, matchNumber, groupe],
    conn,
  );
};
