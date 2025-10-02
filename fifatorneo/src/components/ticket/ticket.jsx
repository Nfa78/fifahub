import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./ticket.css";

export function Ticket({ id, name, surname, email, date, location }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div className="ticket">
        <div className="ticket__header">
          <h3 className="ticket__title">🎟 FIFA Tournament 2026</h3>
          <div
            className="ticket__qr"
            onClick={() => setShowQR(true)}
            role="button"
            title="Click to enlarge QR"
          >
            <QRCodeCanvas value={`https://fifatorneo.com/ticket/${id}-${name}`|| "https://yourapp.com/ticket"} size={72} />
          </div>
        </div>

        <div className="ticket__body">
          <p><strong>Nome:</strong> {name} {surname}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Data:</strong> {date}</p>
          <p><strong>Luogo:</strong> {location}</p>
          <p><strong>ID:</strong> {id}</p>
        </div>

        <div className="ticket__footer">
          <small>Presenta questo biglietto all’ingresso</small>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="qr-modal" onClick={() => setShowQR(false)}>
          <div className="qr-modal__content">
            <QRCodeCanvas value={id || "placeholder"} size={260} />
            <p className="qr-modal__hint">(Click anywhere to close)</p>
          </div>
        </div>
      )}
    </>
  );
}
