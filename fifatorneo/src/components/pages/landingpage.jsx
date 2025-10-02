import React, { useEffect, useRef, useState } from "react";
import "./stlyes/landingPage.css";

import { fetchPlayers, createPlayer } from "../../utils/playersAPI";
import HeroSection from "./page_components/HeroSection";
import DetailsSection from "./page_components/DetailsSection";
import StatsSection from "./page_components/StatsSection";
import FooterSection from "./page_components/FooterSection";
import RegistryModal from "./page_components/RegistryModal";
import { supabase } from "../../utils/supabaseClient";
import { splitFullName } from "../../utils/name";

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
      const fullName = fd.get("fullName")?.trim();
      const email = fd.get("email")?.trim();
      const a1 = fd.get("question 1") || "";
      const a2 = fd.get("question 2 ") || "";
      const a3 = fd.get("Question 3") || "";
      const phone_number = fd.get("phoneNumber") || "";

      // 1) Ask Supabase to email a magic link / OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      const { name, surname } = splitFullName(fullName);
      await createPlayer({
        name,
        surname,
        email,
        phone_number,
        a1,
        a2,
        a3,
      });
      // 2) Stash the form data locally until the user confirms the email

      // 3) UI feedback – tell user to check email (keep your modal behavior if you want)
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        e.currentTarget.reset();
      }, 1200);

      // Optionally route to a “Check your email” page
      // navigate('/check-email');
    } catch (err) {
      console.error("Email sign-in failed:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="page">
      <HeroSection setOpen={setOpen} />
      <DetailsSection />
      <StatsSection
        interested={interested}
        registered={registered}
        setOpen={setOpen}
      />
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
