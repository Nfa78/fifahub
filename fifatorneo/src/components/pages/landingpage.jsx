import React, { useEffect, useRef, useState } from "react";
import "./stlyes/landingPage.css";

import { fetchPlayers, createPlayer } from "../../utils/playersAPI";
import HeroSection from "./page_components/HeroSection";
import DetailsSection from "./page_components/DetailsSection";
import StatsSection from "./page_components/StatsSection";
import FooterSection from "./page_components/FooterSection";
import RegistryModal from "./page_components/RegistryModal";

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstInputRef = useRef(null);

  const [interested, setInterested] = useState(0);
  const [registered, setRegistered] = useState(0);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const players = await fetchPlayers();
        let interestedCount = 0;
        let registeredCount = 0;
        for (const p of players || []) {
          if (p?.has_paid === true) registeredCount += 1;
          else interestedCount += 1;
        }
        setInterested(interestedCount);
        setRegistered(registeredCount);
      } catch (err) {
        console.error("Failed to fetch players:", err);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loadingSubmit) return;
    setLoadingSubmit(true);

    try {
      const fd = new FormData(e.currentTarget);
      const fullName = fd.get("fullName");
      const email = fd.get("email");
      const q1 = fd.get("question 1") || "";
      const q2 = fd.get("question 2 ") || "";
      const q3 = fd.get("Question 3") || "";
      const phn = fd.get("phoneNumber") || "";

      await createPlayer({
        name: fullName,
        surname: "",
        email,
        phone_number: phn,
        a1: q1,
        a2: q2,
        a3: q3,
      });

      setInterested((v) => v + 1);
      setSubmitted(true);

      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        e.currentTarget.reset();
      }, 1200);
    } catch (err) {
      console.error("Create player failed:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="page">
      <HeroSection setOpen={setOpen} />
      <DetailsSection />
      <StatsSection interested={interested} registered={registered} setOpen={setOpen} />
      <FooterSection setOpen={setOpen} />
      <RegistryModal
        open={open}
        setOpen={setOpen}
        submitted={submitted}
        setSubmitted={setSubmitted}
        onSubmit={onSubmit}
        firstInputRef={firstInputRef}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
}
