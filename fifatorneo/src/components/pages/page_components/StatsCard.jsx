import React from "react";
import useCountUp from "./UseCountUp"; // put your hook in common too if reused

export default function StatCard({ label, value }) {
  const n = useCountUp(value);
  return (
    <div className="statcard" role="status" aria-live="polite">
      <div className="statcard__value">{n}</div>
      <div className="statcard__label">{label}</div>
    </div>
  );
}
