import React, { useContext, useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { UsersContext } from "../../App";
import { linkBackend } from "../../constants/LinkBackend";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const RecompenseTableau = ({ matches, idTournament }) => {
  const { setLoad, setError } = useContext(UsersContext);
  const navigate = useNavigate();
  const [editMatch, setEditMatch] = useState(null);
  const tours = [...new Set(matches.map((m) => m.class))]
    .filter((tour) => tour > 0)
    .sort((a, b) => b - a);
  const groupes = [...new Set(matches.map((m) => m.groupe))];
  const totalRecompenses = matches.reduce(
    (total, match) => total + match.recompense,
    0,
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    const recompense = e.target.elements.recompense.value;
    try {
      setLoad(true);
      await axios.put(linkBackend + "tournaments/recompense/" + idTournament, {
        groupe: editMatch[1],
        tour: editMatch[2],
        recompense,
      });
      setEditMatch(null);
    } catch (err) {
      setError(true);
      console.log(err);
      navigate("/");
    } finally {
      setLoad(false);
    }
  };
  return (
    <div>
      <ul className="w-120">
        <li className="flex gap-2">
          <div className="flex-1 flex justify-center items-center">X</div>
          {tours.map((tour) => (
            <div className="flex-1 flex justify-center items-center" key={tour}>
              1/{tour}
            </div>
          ))}
        </li>
        {groupes.map((groupe) => (
          <li className="flex gap-2">
            <div className="flex-1 flex justify-center items-center">
              {groupe}
            </div>
            {tours.map((tour) => {
              const match = matches.find(
                (match) => match.class == tour && match.groupe == groupe,
              );
              return (
                <div
                  className="flex-1 flex justify-center items-center"
                  key={tour}
                >
                  {editMatch?.[0] === true &&
                  editMatch?.[1] === groupe &&
                  editMatch?.[2] === tour ? (
                    <form className="flex items-center" onSubmit={handleSubmit}>
                      <input
                        type="number"
                        name="recompense"
                        className="border w-8 h-6 text-center"
                        defaultValue={match.recompense}
                      />
                      <button>
                        <Check className="w-5 h-5 cursor-pointer" />
                      </button>
                      <X
                        onClick={() => setEditMatch(null)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </form>
                  ) : (
                    <div className="flex justify-center items-center gap-1">
                      {" "}
                      {match ? match.recompense : "-"}
                      {match && (
                        <Pencil
                          onClick={() => setEditMatch([true, groupe, tour])}
                          className="w-3 h-3 text-[var(--color-primary)] cursor-pointer"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </li>
        ))}
      </ul>
      {totalRecompenses > 0 && (
        <div className="flex justify-center items-center mt-4">
          <strong>Total des récompenses: {totalRecompenses}</strong>
        </div>
      )}
    </div>
  );
};

export default RecompenseTableau;
