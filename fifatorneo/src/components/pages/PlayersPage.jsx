import React, { useEffect, useState } from "react";
import { fetchPlayers } from "../../utils/playersAPI";
import {Ticket} from "../ticket/ticket.jsx";

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
      {players.map((p) => (
        <Ticket
          key={p.id}
          id={p.id}
          name={p.name}
          surname={p.surname}
          email={p.email}
          date="Novembre 2025"
          location="Pasha Ristorante, Torino"
        />
      ))}

      {/* Placeholder example if no players */}
      {players.length === 0 && (
        <Ticket
          id="demo123"
          name="Mario"
          surname="Rossi"
          email="mario@example.com"
          date="Novembre 2025"
          location="Pasha Ristorante, Torino"
        />
      )}
    </div>
  );
}
