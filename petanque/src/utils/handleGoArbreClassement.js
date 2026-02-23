import { linkBackend } from "../constants/LinkBackend";
import axios from "axios";

const handleGoArbreClassementUtil = async (
  e,
  setErrorLengthArbre,
  dataOrder,
  idTournament,
) => {
  const A = Number(e.target.elements.A.value);
  const B = Number(e.target.elements.B.value);
  const C = Number(e.target.elements.C.value);

  if (A + B + C > dataOrder.length) {
    setErrorLengthArbre(
      "Il n'y a pas assez de joueurs pour crée les tournois que vous avez préciser",
    );
    return;
  }
  if ((B == 0) & (C > 0)) {
    setErrorLengthArbre(
      "Vous ne pouvez pas créer de tournoi pour le groupe C et ne pas en faire pour le groupe B",
    );
    return;
  }

  const listPlayersA = dataOrder
    .sort((a, b) => b.points - a.points)
    .slice(0, A);
  const listPlayersB =
    B == 0 ? [] : dataOrder.sort((a, b) => b.points - a.points).slice(A, A + B);
  const listPlayersC =
    e.target.elements.C.value == 0
      ? []
      : dataOrder.sort((a, b) => b.points - a.points).slice(A + B, A + B + C);
  await axios.put(linkBackend + "gotournaments/arbre/" + idTournament, {
    listPlayersA,
  });
  await axios.put(linkBackend + "gotournaments/arbre/" + idTournament, {
    listPlayersB,
  });
  await axios.put(linkBackend + "gotournaments/arbre/" + idTournament, {
    listPlayersC,
  });
};

export default handleGoArbreClassementUtil;
