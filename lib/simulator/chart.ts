import { money } from "./model";

export type FanSeries = {
  v: number[];
  c: string;
  short: string;
  w?: number;
  dash?: string;
};

export type FanBand = { lo: number[]; hi: number[]; c: string };

/**
 * Percentile fan, same geometry as the approved simulator: a 900×320 viewBox,
 * value labels in millions, and a dashed line at the starting capital.
 */
export function buildFanSvg(series: FanSeries[], bands: FanBand[], years: number, start: number): string {
  const W = 900;
  const H = 320;
  const L = 64;
  const R = 150;
  const T = 14;
  const B = 30;
  const months = years * 12;
  const vals = [1];
  for (const item of series) vals.push(...item.v);
  for (const band of bands) vals.push(...band.lo, ...band.hi);
  let lo = Math.min(...vals, 0.9);
  let hi = Math.max(...vals);
  const pad = (hi - lo) * 0.06;
  lo -= pad;
  hi += pad;
  const X = (m: number) => L + ((W - L - R) * m) / months;
  const Y = (v: number) => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img">`;
  const rawStep = ((hi - lo) * start) / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = [1, 2, 2.5, 5, 10].map((x) => x * mag).find((x) => x >= rawStep) ?? rawStep;
  for (let amount = Math.ceil((lo * start) / step) * step; amount <= hi * start + 1e-6; amount += step) {
    const v = amount / start;
    svg += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e3e8ee"/>`;
    svg += `<text x="${L - 8}" y="${Y(v) + 3.5}" text-anchor="end">${money(amount)}</text>`;
  }
  for (let year = 0; year <= years; year += 1) {
    svg += `<text x="${X(year * 12)}" y="${H - 10}" text-anchor="middle">${year === 0 ? "Today" : `Year ${year}`}</text>`;
    svg += `<line x1="${X(year * 12)}" x2="${X(year * 12)}" y1="${T}" y2="${H - B}" stroke="#eef1f5"/>`;
  }
  svg += `<line x1="${L}" x2="${W - R}" y1="${Y(1)}" y2="${Y(1)}" stroke="#a3abb5" stroke-dasharray="2 3"/>`;
  for (const band of bands) {
    const up = band.hi.map((v, i) => `${X(i + 1)},${Y(v)}`);
    const dn = band.lo.map((v, i) => `${X(i + 1)},${Y(v)}`).reverse();
    svg += `<polygon points="${X(0)},${Y(1)} ${up.join(" ")} ${dn.join(" ")}" fill="${band.c}"/>`;
  }
  const labs: { y: number; t: string; c: string }[] = [];
  for (const item of series) {
    const pts = [`${X(0)},${Y(1)}`].concat(item.v.map((v, i) => `${X(i + 1)},${Y(v)}`));
    const dash = item.dash ? ` stroke-dasharray="${item.dash}"` : "";
    svg += `<polyline points="${pts.join(" ")}" fill="none" stroke="${item.c}" stroke-width="${item.w || 2}"${dash}/>`;
    const last = item.v[item.v.length - 1];
    labs.push({ y: Y(last), t: `${money(last * start)} ${item.short}`, c: item.c });
  }
  labs.sort((a, b) => a.y - b.y);
  for (let i = 1; i < labs.length; i += 1) {
    if (labs[i].y - labs[i - 1].y < 13) labs[i].y = labs[i - 1].y + 13;
  }
  for (const lab of labs) {
    svg += `<text x="${W - R + 8}" y="${lab.y + 3.5}" style="fill:${lab.c};font-weight:500">${lab.t}</text>`;
  }
  return `${svg}</svg>`;
}
