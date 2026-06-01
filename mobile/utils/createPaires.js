const createPaires = (matches) => {
  let groupes = [];
  let rounds = [];
  let tours = [];
  if (!matches) return { rounds, groupes, tours };
  matches.forEach((match) => {
    const groupe = match.groupe;
    if (!groupes.includes(groupe) && match.id_playerA) groupes.push(groupe);
    const round = match.round;
    if (!rounds.includes(parseInt(round)) && match.id_playerA) rounds.push(parseInt(round));
    const tour = match.class;
    if (!tours.includes(parseFloat(tour)) && match.id_playerA) tours.push(parseFloat(tour));
  });
  return { rounds, groupes, tours };
};

export default createPaires;
