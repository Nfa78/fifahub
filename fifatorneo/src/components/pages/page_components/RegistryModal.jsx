import React from "react";

export default function RegistryModal({
  open,
  setOpen,
  submitted,
  setSubmitted,
  onSubmit,
  firstInputRef,
  loadingSubmit
}) {
  if (!open) return null;

  return (
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
                <input ref={firstInputRef} type="text" name="fullName" placeholder="Mario Rossi" required />
              </label>

              <label className="field">
                <span>Email</span>
                <input type="email" name="email" placeholder="mario@example.com" required />
              </label>

              <label className="field">
                <span>Phone number</span>
                <input type="text" name="phoneNumber" placeholder="348409554" required />
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
  );
}
