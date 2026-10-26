"use client";

export function InfoTip({ text }: { text: string }) {
  return (
    <span className="sim-infotip">
      <button type="button" className="sim-info" aria-label={text}>
        i
      </button>
      <span className="sim-info__pop" role="tooltip">
        {text}
      </span>
    </span>
  );
}
