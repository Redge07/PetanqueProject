exports.placePlayerMatches2 = async (
  matches,
  numero,
  pseudo,
  idTournament,
  tour,
  groupe,
) => {
  const minNumberNoPlayerA = Math.min(
    ...matches
      .filter((match) => match.id_playerA == 0)
      .map((match) => match.number),
  );
  const minNumberNoPlayerB = Math.min(
    ...matches
      .filter((match) => match.id_playerB == 0)
      .map((match) => match.number),
  );
  const lettre = minNumberNoPlayerA != Infinity ? "A" : "B";
  const matchNumber = lettre == "A" ? minNumberNoPlayerA : minNumberNoPlayerB;
  await query(
    `update matches2 set id_player${lettre} = ?, pseudo_${lettre} = ? where id_tournament = ? and number = ? and class ${tour} and groupe = ?`,
    [numero, pseudo, idTournament, matchNumber, groupe],
  );
};
