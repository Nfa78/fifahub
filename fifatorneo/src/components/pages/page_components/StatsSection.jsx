import React from "react";
import StatCard from "./StatsCard.jsx";

export default function StatsSection({ interested, registered, setOpen }) {
  return (
    <section className="stats-band full-bleed" aria-labelledby="stats-heading">
      <div className="stats-band__bg" />
      <div className="stats-band__inner">
        <h2 id="stats-heading" className="sr-only">Stato registrazioni</h2>

        <div className="stats-band__cards">
          <StatCard label="Interessati" value={interested + 28} />
          <StatCard label="Iscritti" value={registered + 2} />
        </div>

        <div className="stats-band__cta">
          <button className="btn btn--primary" onClick={() => setOpen(true)}>
            Pre-iscriviti ora
          </button>
        </div>
      </div>
    </section>
  );
}
