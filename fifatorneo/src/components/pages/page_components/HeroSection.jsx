import React from "react";
import { useNavigate } from "react-router";

export default function HeroSection({ setOpen }) {
  const navigate = useNavigate();

  return (
    <header className="hero">
      <div className="hero__overlay" />
      <div className="container hero__content">
        <div className="hero__eyebrow">TORNEO</div>
        <h1 className="hero__title">FIFA Tournament 2026</h1>

        <div className="Prize_Title">
          <h1>720€ MONTEPREMI<br /></h1>
        </div>

        <h3>📍Pasha ristorante<br />San Salvario,Torino</h3>

        <p className="hero__subtitle">
          <br />
          64 giocatori. Bracket a eliminazione. Premi reali.{" "}
          <br className="sm-hide" />
          Mostra chi è il vero campione!
        </p>

        <div className="hero__cta">
          <button
            className="btn btn--primary"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-controls="registration-dialog"
          >
            I’m interested
          </button>
          <a href="#details" className="btn btn--ghost">Dettagli & Regole</a>
          <button onClick={() => navigate("/fixtures")} className="btn btn--ghost">
            See Fixtures
          </button>
          <button onClick={() => navigate("/MyTicket")} className="btn btn--ghost">
            My Ticket
          </button>
        </div>

        <ul className="hero__meta">
          <li><strong>Data:</strong> Novembre 2025</li>
          <li><strong>Formato:</strong> 64 giocatori</li>
          <li><strong>Piattaforma:</strong> PS5</li>
        </ul>
      </div>
    </header>
  );
}
