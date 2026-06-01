import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import { UsersContext } from "../../App";

const Order = ({ idTournament }) => {
  // State pour avoir les données du classement
  const [dataOrder, setDataOrder] = useState([]);
  const { setLoad, setError } = useContext(UsersContext);

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
            <tr className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl">
              <th className="text-left py-3 px-3 text-white/70 font-medium rounded-l-xl">
                #
              </th>
              <th className="text-left py-3 px-3 text-white/70 font-medium">
                Pseudo
              </th>
              <th className="text-left py-3 px-3 text-white/70 font-medium">
                N°
              </th>
              <th className="text-left py-3 px-3 text-white/70 font-medium">
                Points
              </th>
              <th className="text-left py-3 px-3 text-white/70 font-medium">
                Diff
              </th>
              <th className="text-left py-3 px-3 text-white/70 font-medium">
                Victoires
              </th>
              <th className="text-left py-3 px-3 text-white/70 font-medium rounded-r-xl">
                Matchs
              </th>
            </tr>
          </thead>
          <tbody>
            {dataOrder.map((l, i) => {
              const isTop3 = i < 3;
              const isQualified = i < 8;
              const medals = ["🥇", "🥈", "🥉"];

              return (
                <tr
                  key={l.numero}
                  className={`border-b border-[var(--color-border)] last:border-0 transition-colors ${
                    isTop3
                      ? "bg-[var(--color-gold)]/10"
                      : isQualified
                        ? "bg-[var(--color-bg-mid)]"
                        : "bg-white"
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-[var(--color-primary)]">
                    {isTop3 ? medals[i] : i + 1}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--color-primary)]">
                    {l.pseudo}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-gray)]">
                    #{l.numero}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-2 py-0.5 rounded-lg">
                      {l.points}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-medium ${l.diff >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {l.diff >= 0 ? `+${l.diff}` : l.diff}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-[var(--color-primary)]">
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
