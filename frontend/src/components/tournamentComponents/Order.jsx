import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../../App";
import { useNavigate } from "react-router-dom";

const Order = ({ idTournament }) => {
  // State pour avoir les données du classement
  const [dataOrder, setDataOrder] = useState([]);
  const { setLoad, setError } = useContext(UsersContext);
  const navigate = useNavigate();

  // On récupérer toutes les données du classement pret a etre bien afficher
  useEffect(() => {
    const chargeOrder = async () => {
      setLoad(true);
      try {
        const res = await axios.get(
          linkBackend + "tournaments/classement/" + idTournament,
        );
        setDataOrder(res.data.players);
      } catch (err) {
        setError(true);
        navigate("/");
        console.log(err);
      } finally {
        setLoad(false);
      }
    };
    chargeOrder();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <h1 className="text-lg font-semibold text-[var(--color-primary)] mb-4">
        Classement
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-2 px-3 text-[var(--color-gray)] font-medium">
                #
              </th>
              <th className="text-left py-2 px-3 text-[var(--color-gray)] font-medium">
                Pseudo
              </th>
              <th className="text-left py-2 px-3 text-[var(--color-gray)] font-medium">
                N°
              </th>
              <th className="text-left py-2 px-3 text-[var(--color-gray)] font-medium">
                Points
              </th>
              <th className="text-left py-2 px-3 text-[var(--color-gray)] font-medium">
                Diff
              </th>
              <th className="text-left py-2 px-3 text-[var(--color-gray)] font-medium">
                Victoires
              </th>
              <th className="text-left py-2 px-3 text-[var(--color-gray)] font-medium">
                Matchs
              </th>
            </tr>
          </thead>
          <tbody>
            {dataOrder.map((l, i) => {
              return (
                <tr
                  key={l.numero}
                  className={`border-b border-[var(--color-border)] last:border-0 ${i < 8 ? "bg-[var(--color-bg-mid)]" : ""}`}
                >
                  <td className="py-3 px-3 font-semibold text-[var(--color-primary)]">
                    {i + 1}
                  </td>
                  <td className="py-3 px-3 font-medium text-[var(--color-primary)]">
                    {l.pseudo}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-gray)]">
                    {l.numero}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--color-gold)]">
                    {l.points}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-gray)]">
                    {l.diff}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-gray)]">
                    {l.nb_win}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-gray)]">
                    {l.nb_matchs_jouer}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Order;
