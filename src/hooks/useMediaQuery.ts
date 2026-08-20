// hooks/useMediaQuery.ts
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    // "change" no MediaQueryList é o mecanismo correcto, mas em alguns
    // ambientes de teste/automação os eventos de resize não chegam a
    // dispará-lo — o listener de "resize" directo é rede de segurança.
    mql.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [query]);

  return matches;
}

// Abaixo do breakpoint de portátil (1024px) — telemóvel + tablet.
// Espelha $laptop em assets/styles/_variables.scss.
export const useIsCompactLayout = () => useMediaQuery("(max-width: 1023px)");
