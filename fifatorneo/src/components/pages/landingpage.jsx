import React, { useEffect, useRef, useState } from "react";
import "./stlyes/landingPage.css"; // keeping your path as provided

// ---- import your Supabase API helpers ----
import { fetchPlayers, createPlayer } from "../../utils/playersAPI"; // adjust path if needed

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

function splitName(full) {
    const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { name: "", surname: "" };
    if (parts.length === 1) return { name: parts[0], surname: "" };
    const surname = parts.pop();
    const name = parts.join(" ");
    return { name, surname };
}

export default function LandingPage() {
    const [open, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const firstInputRef = useRef(null);

    // Counters now come from Supabase
    const [interested, setInterested] = useState(0);
    const [registered, setRegistered] = useState(0);

    const [loadingSubmit, setLoadingSubmit] = useState(false);

    // Load players -> compute counters
    useEffect(() => {
        (async () => {
            try {
                const players = await fetchPlayers(); // aka fetchAllPlayers
                let interestedCount = 0;
                let registeredCount = 0;
                for (const p of players || []) {
                    if (p?.has_paid === true) registeredCount += 1;
                    else interestedCount += 1; // treat false/null/undefined as interested
                }
                setInterested(interestedCount);
                setRegistered(registeredCount);
            } catch (err) {
                console.error("Failed to fetch players:", err);
            }
        })();
    }, []);

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

    const onSubmit = async (e) => {
        e.preventDefault();
        if (loadingSubmit) return;
        setLoadingSubmit(true);

        try {
            const fd = new FormData(e.currentTarget);
            const fullName = fd.get("fullName");
            const email = fd.get("email");

            // Note: your inputs have spaces/casing in their names; read them exactly:
            const q1 = fd.get("question 1") || "";
            const q2 = fd.get("question 2 ") || ""; // note the trailing space in your JSX name
            const q3 = fd.get("Question 3") || "";
            const phn = fd.get("phoneNumber") || "asfas";
            const { name, surname } = splitName(fullName);

            // Create a new player using your API
            await createPlayer({
                name: name,
                surname: surname,
                email: email,
                phone_number: phn,
                a1: q1,
                a2: q2,
                a3: q3,
            });

            // Optimistically bump "interested" (new entries default to has_paid=false)
            setInterested((v) => v + 1);

            setSubmitted(true);
            setTimeout(() => {
                setOpen(false);
                setSubmitted(false);
                e.currentTarget.reset();
            }, 1200);
        } catch (err) {
            console.error("Create player failed:", err);
            // keep the dialog open; you can add toast/alert if you want
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="page">
            {/* Banner / Hero */}
            <header className="hero">
                <div className="hero__overlay" />
                <div className="container hero__content">
                    <div className="hero__eyebrow">TORNEO</div>
                    <h1 className="hero__title">FIFA Tournament 2026</h1>

                    {/* fixed React attribute (className) but UI unchanged */}
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
                        <StatCard label="Interessati" value={interested + 38} />
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
                                        <span>Phone number</span>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            placeholder="348409554"
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Q1</span>
                                        <h3>Since when do you play fifa ?</h3>
                                        <input type="text" name="question 1" placeholder="answer here" />
                                    </label>

                                    <label className="field">
                                        <span>Q2</span>
                                        <h3>Are you playing fifa now activley?</h3>
                                        <input type="text" name="question 2 " placeholder="answer here" />
                                    </label>

                                    <label className="field">
                                        <span>Q3</span>
                                        <h3>Do you have suggestions for this tournament?</h3>
                                        <input type="text" name="Question 3" placeholder="answer here" />
                                    </label>

                                    <div className="field field--row">
                                        <label className="checkbox">
                                            <input type="checkbox" name="consent" required />
                                            <span>Accetto di essere contattato per conferma e dettagli</span>
                                        </label>
                                    </div>

                                    <button
                                        className="btn btn--primary btn--full"
                                        type="submit"
                                        disabled={loadingSubmit}
                                        aria-busy={loadingSubmit}
                                    >
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
