import { buildFanSvg, type FanBand, type FanSeries } from "@/lib/simulator/chart";

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
  const svg = buildFanSvg(series, bands, years, start).replace(
    'role="img">',
    `role="img" aria-label="${label}">`,
  );
  return <div className="sim-chart" dangerouslySetInnerHTML={{ __html: svg }} />;
}
