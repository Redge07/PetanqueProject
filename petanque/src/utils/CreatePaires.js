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
export default createPaires;
