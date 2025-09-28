import React, { useEffect, useState } from "react";
import { fetchPlayers } from "../../utils/playersAPI";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetchPlayers()
      .then(setPlayers)
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: "tomato" }}>Error: {err}</div>;
  return (
    <div className="container py-4">
      <h2>Players</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name} {p.surname} — {p.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
