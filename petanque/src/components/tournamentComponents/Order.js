import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../../App";

const Order = ({ idTournament }) => {
  // State pour avoir les données du classement
  const [dataOrder, setDataOrder] = useState([]);
  const { setLoad } = useContext(UsersContext);

  // On récupérer toutes les données du classement pret a etre bien afficher
  useEffect(() => {
    setLoad(true);
    axios
      .get(linkBackend + "tournaments/classement/" + idTournament)
      .then((res) => setDataOrder(res.data))
      .finally(() => setLoad(false));
  }, []);

  return (
    <div>
      <h1>Bonjour Classement</h1>
      <div className="order">
        <ul>
          <li>
            <div>Classement</div>
            <div>Pseudo</div>
            <div>Numéro du joueur</div>
            <div>Points</div>
            <div>Nb matches</div>
          </li>
          {dataOrder
            .sort((a, b) => b.points - a.points)
            .map((l, i) => {
              return (
                <li
                  key={l.numero}
                  style={i < 8 ? { background: "lightgray" } : {}}
                >
                  <div>{i + 1}</div>
                  <div>{l.pseudo}</div>
                  <div>{l.numero}</div>
                  <div>{l.points}</div>
                  <div>{l.nb_matchs_jouer}</div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default Order;
