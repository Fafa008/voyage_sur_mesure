"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Indique si le composant est monté côté client.
 *
 * Utilise useSyncExternalStore pour éviter un `useEffect` + `setState`
 * (anti-pattern flaggé par react-hooks/set-state-in-effect) tout en
 * résolvant correctement l'hydratation : `false` côté serveur, `true`
 * après hydratation côté client.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}