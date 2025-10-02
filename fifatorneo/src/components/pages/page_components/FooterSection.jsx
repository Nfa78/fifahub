import React from "react";

export default function FooterSection({ setOpen }) {
  return (
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
  );
}
