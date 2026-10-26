"use client";

import { useState } from "react";
import { fanFrame, type FanBand, type FanSeries } from "@/lib/simulator/chart";
import { money } from "@/lib/simulator/model";

export function FanChart({
  series,
  bands,
  years,
  start,
  label,
}: {
  series: FanSeries[];
  bands: FanBand[];
  years: number;
  start: number;
  label: string;
}) {
  const frame = fanFrame(series, bands, years);
  const { W, H, L, R, T, B, months, X, Y } = frame;
  const [month, setMonth] = useState<number | null>(null);

  function move(clientX: number, width: number) {
    const px = (clientX / width) * W;
    const next = Math.round(((px - L) / (W - L - R)) * months);
    setMonth(Math.min(months, Math.max(0, next)));
  }

  const tip = month == null ? null : series.map((item) => ({
    name: item.short,
    color: item.c,
    value: month === 0 ? start : item.v[month - 1] * start,
  }));

  return (
    <div className="sim-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          move(event.clientX - rect.left, rect.width);
        }}
        onPointerLeave={() => setMonth(null)}
      >
        <Grid frame={frame} start={start} years={years} />
        {bands.map((band, index) => {
          const up = band.hi.map((v, i) => `${X(i + 1)},${Y(v)}`).join(" ");
          const dn = band.lo
            .map((v, i) => `${X(i + 1)},${Y(v)}`)
            .reverse()
            .join(" ");
          return <polygon key={index} points={`${X(0)},${Y(1)} ${up} ${dn}`} fill={band.c} />;
        })}
        {series.map((item) => {
          const pts = [`${X(0)},${Y(1)}`, ...item.v.map((v, i) => `${X(i + 1)},${Y(v)}`)].join(" ");
          return (
            <polyline
              key={item.short}
              points={pts}
              fill="none"
              stroke={item.c}
              strokeWidth={item.w || 2}
              strokeDasharray={item.dash}
            />
          );
        })}
        {month != null ? (
          <line x1={X(month)} x2={X(month)} y1={T} y2={H - B} stroke="#1b2a3d" strokeDasharray="2 3" />
        ) : null}
      </svg>
      {tip && month != null ? (
        <div
          className="sim-tip"
          role="tooltip"
          style={{
            left: `${(X(month) / W) * 100}%`,
            transform: X(month) / W > 0.72 ? "translateX(-100%)" : X(month) / W < 0.16 ? "none" : "translateX(-50%)",
          }}
        >
          <b>{month === 0 ? "Today" : `Month ${month}`}</b>
          {tip.map((row) => (
            <span key={row.name}>
              <i style={{ background: row.color }} />
              {row.name}
              <strong>{money(row.value)}</strong>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Grid({
  frame,
  start,
  years,
}: {
  frame: ReturnType<typeof fanFrame>;
  start: number;
  years: number;
}) {
  const { W, H, L, R, T, B, lo, hi, X, Y } = frame;
  const rawStep = ((hi - lo) * start) / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = [1, 2, 2.5, 5, 10].map((x) => x * mag).find((x) => x >= rawStep) ?? rawStep;
  const lines = [];
  for (let amount = Math.ceil((lo * start) / step) * step; amount <= hi * start + 1e-6; amount += step) {
    const v = amount / start;
    lines.push(
      <g key={amount}>
        <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="#e6ebf0" />
        <text x={L - 8} y={Y(v) + 3.5} textAnchor="end">
          {money(amount)}
        </text>
      </g>,
    );
  }
  const yearsMarks = [];
  for (let year = 0; year <= years; year += 1) {
    yearsMarks.push(
      <g key={year}>
        <text x={X(year * 12)} y={H - 10} textAnchor="middle">
          {year === 0 ? "Today" : `Year ${year}`}
        </text>
        <line x1={X(year * 12)} x2={X(year * 12)} y1={T} y2={H - B} stroke="#eef0f3" />
      </g>,
    );
  }
  return (
    <>
      {lines}
      {yearsMarks}
      <line x1={L} x2={W - R} y1={Y(1)} y2={Y(1)} stroke="#6b7684" strokeDasharray="2 3" />
    </>
  );
}
