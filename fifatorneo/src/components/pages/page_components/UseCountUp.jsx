import { useEffect, useState } from "react";

/**
 * Smoothly animates a number from 0 → target in the given duration.
 *
 * @param {number} target - final value to animate to
 * @param {number} duration - animation time in ms (default 1200)
 * @returns {number} animated value
 */
export default function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (t) => {
      const progress = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
