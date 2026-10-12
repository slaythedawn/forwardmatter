import { full, mid, small, type BrandCut } from "./brandMarkData";

const CUTS: Record<"full" | "mid" | "small", BrandCut> = { full, mid, small };

/**
 * The Forward Matter mark: the hero animation's brain, halftoned onto a grid,
 * with the frontal lobe resolved and the rest sitting back as ambient field.
 *
 * Three cuts rather than one, because a halftone stops resolving once the dots
 * fall under a pixel or so. Pick by rendered height: `full` above 64px, `mid`
 * for a header, `small` below 40px, where it reads as a dense cluster beside a
 * sparse one rather than as a brain.
 *
 * Geometry is generated — see scripts/build-brand.mjs.
 */
export function BrandMark({
  cut = "mid",
  className,
  style,
  title,
}: {
  cut?: "full" | "mid" | "small";
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  const { viewBox, dots } = CUTS[cut];
  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g fill="currentColor">
        {dots.map(([cx, cy, r, opacity], index) => (
          <circle key={index} cx={cx} cy={cy} r={r} fillOpacity={opacity} />
        ))}
      </g>
    </svg>
  );
}
