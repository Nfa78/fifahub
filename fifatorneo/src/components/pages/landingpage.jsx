import React, { useEffect, useRef, useState } from "react";
import "./stlyes/landingPage.css"; // <-- fixed path

function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        const start = performance.now();
        let raf = 0;
        const tick = (t) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(eased * target));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return value;
}

function StatCard({ label, value }) {
    const n = useCountUp(value);
    return (
        <div className="statcard" role="status" aria-live="polite">
            <div className="statcard__value">{n}</div>
            <div className="statcard__label">{label}</div>
        </div>
    );
}

export default function LandingPage() {
    const [open, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const firstInputRef = useRef(null);

    // Demo numbers – replace with live data
    const [interested, setInterested] = useState(128);
    const [registered, setRegistered] = useState(32);

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    useEffect(() => {
        if (open && firstInputRef.current) firstInputRef.current.focus();
    }, [open]);

    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: POST to your backend
        setSubmitted(true);
        setInterested((v) => v + 1);
        setTimeout(() => {
            setOpen(false);
            setSubmitted(false);
            e.target.reset();
        }, 1400);
    };

    return (
        <div className="page">
            {/* Banner / Hero */}
            <header className="hero">
                <div className="hero__overlay" />
                <div className="container hero__content">
                    <div className="hero__eyebrow">TORNEO</div>
                    <h1 className="hero__title">FIFA Tournament 2026</h1>
                    <div class="Prize_Title">
                        <h1>720€ MONTEPREMI<br /></h1>
                    </div>
                    <h3>📍Pasha ristorante<br></br>San Salvario,Torino</h3>
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
                        <a href="#details" className="btn btn--ghost">
                            Dettagli & Regole
                        </a>
                        {/* Route to a dedicated fixtures page */}
                        <a href="/fixtures" className="btn btn--ghost">
                            See Fixtures
                        </a>
                    </div>

                    <ul className="hero__meta">
                        <li>
                            <strong>Data:</strong> Novembre 2025
                        </li>
                        <li>
                            <strong>Formato:</strong> 64 giocatori
                        </li>
                        <li>
                            <strong>Piattaforma:</strong> PS5
                        </li>

                    </ul>
                </div>
            </header>

            {/* Details */}
            <main id="details" className="container section">
                <div className="grid">
                    <div className="card">
                        <h3>Iscrizione</h3>
                        <p>
                            Quota d’ingresso trasparente. Posti limitati a 64. Clicca “I’m
                            interested” per prenotare il tuo posto.
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

            {/* Stats Band (true full-bleed, no clipping) */}
            <section className="stats-band full-bleed" aria-labelledby="stats-heading">
                <div className="stats-band__bg" />
                <div className="stats-band__inner">
                    <h2 id="stats-heading" className="sr-only">
                        Stato registrazioni
                    </h2>

                    <div className="stats-band__cards">
                        <StatCard label="Interessati" value={interested} />
                        <StatCard label="Iscritti" value={registered} />
                    </div>

                    <div className="stats-band__cta">
                        <button className="btn btn--primary" onClick={() => setOpen(true)}>
                            Pre-iscriviti ora
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer__inner">
                    <span>
                        Domande? Scrivici:{" "}
                        <a href="mailto:organizer@example.com">organizer@example.com</a>
                    </span>
                    <button className="btn btn--small" onClick={() => setOpen(true)}>
                        Pre-iscriviti
                    </button>
                </div>
            </footer>

            {/* Dialog / Modal */}
            {open && (
                <div
                    className="modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="dialog-title"
                    id="registration-dialog"
                    onMouseDown={(e) => {
                        if (e.target.classList.contains("modal")) setOpen(false);
                    }}
                >
                    <div className="modal__panel" role="document">
                        <button
                            className="modal__close"
                            aria-label="Chiudi dialog"
                            onClick={() => setOpen(false)}
                        >
                            ×
                        </button>

                        {!submitted ? (
                            <>
                                <h2 id="dialog-title">Richiesta di registrazione</h2>
                                <p className="muted">
                                    Compila i dati e ti contatteremo per confermare lo slot.
                                </p>
                                <form className="form" onSubmit={onSubmit}>
                                    <label className="field">
                                        <span>Nome e Cognome</span>
                                        <input
                                            ref={firstInputRef}
                                            type="text"
                                            name="fullName"
                                            placeholder="Mario Rossi"
                                            required
                                        />
                                    </label>

                                    <label className="field">
                                        <span>Email</span>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="mario@example.com"
                                            required
                                        />
                                    </label>

                                    <label className="field">
                                        <span>PSN / Gamer Tag</span>
                                        <input
                                            type="text"
                                            name="gamertag"
                                            placeholder="MRossi_10"
                                        />
                                    </label>

                                    <div className="field field--row">
                                        <label className="checkbox">
                                            <input type="checkbox" name="consent" required />
                                            <span>
                                                Accetto di essere contattato per conferma e dettagli
                                            </span>
                                        </label>
                                    </div>

                                    <button className="btn btn--primary btn--full" type="submit">
                                        Invia richiesta
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="success">
                                <h3>Richiesta inviata ✅</h3>
                                <p>Ti contatteremo a breve con i prossimi passi.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
