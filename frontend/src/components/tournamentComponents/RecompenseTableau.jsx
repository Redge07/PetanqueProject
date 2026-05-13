import React, { useEffect } from "react";

const RecompenseTableau = ({ matches }) => {
  return (
    <div>
      <ul>
        <li className="flex gap-2"><div>X</div>{[...new Set(matches.map((m) => m.class))].sort((a,b) => b - a).filter((classe) => classe > 0).map((c) => (
          <span key={c}>1/{c}</span>
        ))}</li>
        {[...new Set(matches.map((m) => m.groupe))].map((groupe) => <li className="flex gap-2"><div>{groupe}</div>{[...new Set(matches.map((m) => m.class))].sort((a,b) => b - a).filter((classe) => classe > 0).map((classes) => <div>ds</div>)}</li>)}
      </ul>
    </div>
  );
};

export default RecompenseTableau;
