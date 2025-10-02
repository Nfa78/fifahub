import React from "react";

export default function DetailsSection() {
  return (
    <main id="details" className="container section">
      <div className="grid">
        <div className="card">
          <h3>Iscrizione</h3>
          <p>
            Quota d’ingresso trasparente. Posti limitati a 64. 
            Clicca “I’m interested” per prenotare il tuo posto.
          </p>
        </div>
        <div className="card">
          <h3>Regole rapide</h3>
          <ul className="list">
            <li>6 minuti per tempo</li>
            <li>Rose aggiornate, infortuni off</li>
            <li>Pareggi → supplementari + rigori</li>
          </ul>
        </div>
        <div className="card">
          <h3>Premi</h3>
          <p>
            Montepremi ai primi classificati. Dettagli annunciati all’inizio
            del torneo.
          </p>
        </div>
      </div>
    </main>
  );
}
