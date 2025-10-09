import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sf_theme"; // 'dark' | 'light'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // initialize from localStorage or system preference
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
        return;
      }
      if (saved === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
        return;
      }
    } catch (e) {
      // ignore
    }

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggle = () => {
    try {
      const toDark = !(isDark === true);
      if (toDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(STORAGE_KEY, "dark");
        setIsDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(STORAGE_KEY, "light");
        setIsDark(false);
      }
    } catch (e) {
      console.error("theme toggle error", e);
    }
  };

  return (
    <Button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="h-10 w-10 p-2 rounded-md flex items-center justify-center bg-muted text-foreground"
      onClick={toggle}
    >
      {isDark ? (
        // sun icon for light (when currently dark)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M4.93 19.07l1.41-1.41" />
          <path d="M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // moon icon for dark (when currently light)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </Button>
  );
}
