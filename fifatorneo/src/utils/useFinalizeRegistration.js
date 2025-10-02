import { useEffect } from "react";
import { supabase } from "./supabaseClient";
// import { createPlayer } from './your-api'; // if you use your own API

function useFinalizeRegistration() {
  useEffect(() => {
    // Run immediately on load in case we've just returned from the magic link
    finalize();

    // Also catch future auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) finalize();
    });

    async function finalize() {
      const raw = sessionStorage.getItem("pending_registration");
      if (!raw) return;

      const pending = JSON.parse(raw);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // (A) Insert via Supabase client (requires RLS policies allowing user_id = auth.uid())
        const { error } = await supabase.from("players").upsert(
          {
            user_id: user.id, // <-- include this column in your table
            name: pending.name,
            surname: pending.surname,
            email: pending.email,
            phone_number: pending.phone_number,
            a1: pending.a1,
            a2: pending.a2,
            a3: pending.a3,
          },
          { onConflict: "user_id" }
        );

        // (B) If instead `createPlayer` calls YOUR server (service-role), you can do:
        // await createPlayer({ user_id: user.id, ...pending });

        if (error) {
          console.error("Finalize registration failed:", error);
          return;
        }

        // Optional: store name in auth metadata
        await supabase.auth.updateUser({
          data: { name: pending.name, surname: pending.surname },
        });

        sessionStorage.removeItem("pending_registration");
      } catch (e) {
        console.error("Finalize registration failed:", e);
      }
    }

    return () => sub?.subscription?.unsubscribe();
  }, []);
}

export default useFinalizeRegistration;
