"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

/* On phones the links fold into a menu so the sticky header stays one row high.
 * From 721px up the button is hidden and the links show as before. */
export function SiteNav({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 720) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="site-menu-btn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="site-menu-btn__icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        {open ? "Close" : "Menu"}
      </button>
      <nav
        id={id}
        className={`site-nav${open ? " site-nav--open" : ""}`}
        aria-label="Primary"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {children}
      </nav>
    </>
  );
}
