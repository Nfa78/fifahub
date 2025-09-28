import React, { useState, useRef, useEffect } from "react";
import "./stlyes/landingPage.css";

export default function LandingPage() {
    const [open, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const dialogRef = useRef(null);
    const firstInputRef = useRef(null);

    // Close modal on ESC
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // Focus first input when dialog opens
    useEffect(() => {
        if (open && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [open]);

    const onSubmit = (e) => {
        e.preventDefault();
        // You can replace this with a real POST request
        // fetch('/api/register-interest', { method: 'POST', body: new FormData(e.target) })
        setSubmitted(true);
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
                    <p className="hero__subtitle">
                        64 giocatori. Bracket a eliminazione. Premi reali. <br className="sm-hide" />
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
                    </div>

                    <ul className="hero__meta">
                        <li><strong>Data:</strong> 12–13 Aprile 2026</li>
                        <li><strong>Formato:</strong> 64 giocatori • Best-of-1 (finale Bo3)</li>
                        <li><strong>Piattaforma:</strong> PS5</li>
                        <li><strong>Location:</strong> Torino, IT</li>
                    </ul>
                </div>
            </header>

            {/* Features / Details */}
            <main id="details" className="container section">
                <div className="grid">
                    <div className="card">
                        <h3>Iscrizione</h3>
                        <p>Quota d’ingresso trasparente. Posti limitati a 64. Clicca “I’m interested” per prenotare il tuo posto.</p>
                    </div>
                    <div className="card">
                        <h3>Regole rapide</h3>
                        <ul className="list">
                            <li>Partite 6 minuti per tempo</li>
                            <li>Squadre attuali, rose aggiornate</li>
                            <li>Pareggi → tempi supplementari + rigori</li>
                        </ul>
                    </div>
                    <div className="card">
                        <h3>Premi</h3>
                        <p>Montepremi distribuito ai primi classificati. Dettagli annunciati all’inizio del torneo.</p>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container footer__inner">
                    <span>Domande? Scrivici: <a href="mailto:organizer@example.com">organizer@example.com</a></span>
                    <button className="btn btn--small" onClick={() => setOpen(true)}>Pre-iscriviti</button>
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
                    ref={dialogRef}
                    onMouseDown={(e) => {
                        // click outside closes
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
                                <p className="muted">Compila i dati e ti contatteremo per confermare lo slot.</p>
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
                                            <span>Accetto di essere contattato per conferma e dettagli</span>
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
