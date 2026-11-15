'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Ctx = {
  saved: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => void;
  clear: () => void;
  ready: boolean;
};

const SavedCtx = createContext<Ctx | null>(null);
const KEY = 'studybison:saved:v1';

export function SavedCoursesProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(saved));
    } catch {}
  }, [saved, ready]);

  const toggle = useCallback((slug: string) => {
    setSaved((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  const clear = useCallback(() => setSaved([]), []);
  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved]);

  const value = useMemo(() => ({ saved, isSaved, toggle, clear, ready }), [saved, isSaved, toggle, clear, ready]);

  return <SavedCtx.Provider value={value}>{children}</SavedCtx.Provider>;
}

export function useSavedCourses() {
  const ctx = useContext(SavedCtx);
  if (!ctx) throw new Error('useSavedCourses must be used inside SavedCoursesProvider');
  return ctx;
}
