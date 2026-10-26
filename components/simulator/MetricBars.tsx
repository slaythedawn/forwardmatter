export type BarRow = {
  name: string;
  sub?: string;
  value: number;
  text: string;
  color?: string;
  textColor?: string;
  base?: number;
  /** Designed contribution, drawn as a light bar beside the solid modelled bar. */
  target?: number;
};

export function MetricBars({ rows, label }: { rows: BarRow[]; label: string }) {
  const vals = rows.flatMap((row) => [row.value, row.target ?? 0]).concat([0]);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 0);
  const span = max - min || 1;
  const pos = (value: number) => ((value - min) / span) * 100;

  return (
    <div className="sim-bars" role="list" aria-label={label}>
      {rows.map((row) => {
        const fromZero = pos(Math.min(0, row.value));
        const toValue = pos(Math.max(0, row.value));
        const left = row.base != null ? pos(Math.min(row.base, row.base + row.value)) : fromZero;
        const width = row.base != null ? Math.abs(pos(row.base + row.value) - pos(row.base)) : toValue - fromZero;
        return (
          <div className="sim-bar" role="listitem" key={`${row.name}-${row.text}`}>
            <div className="sim-bar__name">
              {row.name}
              {row.sub ? <small>{row.sub}</small> : null}
            </div>
            <div className="sim-bar__track">
              {row.target != null ? (
                <div
                  className="sim-bar__ghost"
                  style={{
                    left: `${pos(Math.min(0, row.target))}%`,
                    width: `${Math.max(Math.abs(pos(row.target) - pos(0)), 0.8)}%`,
                  }}
                />
              ) : null}
              <div
                className="sim-bar__fill"
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, row.value === 0 ? 0 : 0.6)}%`,
                  background: row.color || "var(--sim-acc)",
                }}
              />
              {min < 0 ? <div className="sim-bar__zero" style={{ left: `${pos(0)}%` }} /> : null}
            </div>
            <div className="sim-bar__val" style={{ color: row.textColor || "inherit" }}>
              {row.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
