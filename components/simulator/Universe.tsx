"use client";

import { useMemo, useState } from "react";
import {
  DELISTED_IN_TEST,
  TESTED_UNIVERSE,
  UNIVERSE,
  UNIVERSE_SLEEVES,
  ownableNames,
  type UniverseSleeve,
} from "@/lib/simulator/universe";

export function UniverseDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [sleeve, setSleeve] = useState<UniverseSleeve | "All">("All");
  const ownable = ownableNames().length;
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return UNIVERSE.filter((row) => {
      if (sleeve !== "All" && row.sleeve !== sleeve) return false;
      if (!q) return true;
      return [row.ticker, row.company, row.exchange, row.subSector, row.sleeve, row.tag]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, sleeve]);

  return (
    <div className="sim-modal" role="presentation" onClick={onClose}>
      <div
        className="sim-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="universe-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sim-modal__head">
          <div>
            <p className="sim-kicker">The foundation</p>
            <h2 id="universe-title">What the foundation can own: {ownable} names, screened from a {TESTED_UNIVERSE}-stock tested universe.</h2>
          </div>
          <button type="button" className="sim-textbtn" onClick={onClose}>
            Close
          </button>
        </header>
        {UNIVERSE.length === 0 ? (
          <p>Universe list loading</p>
        ) : (
          <>
            <div className="sim-universe__tools">
              <label>
                <span className="sim-lab">Search</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ticker or company"
                  aria-label="Search the universe"
                />
              </label>
              <div className="sim-seg" role="group" aria-label="Sleeve">
                <button type="button" aria-pressed={sleeve === "All"} onClick={() => setSleeve("All")}>
                  All
                </button>
                {UNIVERSE_SLEEVES.map((item) => (
                  <button key={item} type="button" aria-pressed={sleeve === item} onClick={() => setSleeve(item)}>
                    {item}
                  </button>
                ))}
              </div>
              <p className="sim-note">
                {rows.length} of {UNIVERSE.length} lines. {ownable} names the foundation can own, plus the event-sleeve ETF and the watch list.
              </p>
            </div>
            <div className="sim-table-wrap">
              <table className="sim-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Company</th>
                    <th>Exchange</th>
                    <th>Sub-sector</th>
                    <th>Sleeve</th>
                    <th>Model</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.sleeve}-${row.ticker}-${row.company}`}>
                      <td>{row.ticker || "—"}</td>
                      <td>{row.company}</td>
                      <td>{row.exchange || "—"}</td>
                      <td>{row.subSector}</td>
                      <td>{row.sleeve}</td>
                      <td>{row.tag ? <span className="sim-chip sim-chip--built">{row.tag}</span> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 ? <p className="sim-note">No names match that search.</p> : null}
            <details className="sim-more">
              <summary>How this list sits with the model</summary>
              <ul className="sim-list">
                <li>The foundation screens a broader healthcare universe with the S1–S6 screen.</li>
                <li>
                  The F-2 test covers {TESTED_UNIVERSE} survivor-free names, including {DELISTED_IN_TEST} delisted. Next test: F-2 not yet run.
                </li>
                <li>Momentum names rotate under the rule, shown as at 30 Sep 2026.</li>
                <li>The backtest baskets were chosen with hindsight, which is why the mechanical pick is shown alongside.</li>
              </ul>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
