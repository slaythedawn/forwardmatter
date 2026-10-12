import { siteMeta } from "@/content/site";

/**
 * The name, set rather than borrowed from the nav. Tracked caps with the weight
 * carrying the two words: stacked beside the mark in the header, on one line
 * wherever the row is already horizontal.
 *
 * Tracking adds a trailing space after the final letter, so each variant pulls
 * that back with a negative margin to keep the lockup optically aligned.
 */
export function Wordmark({ stacked = false }: { stacked?: boolean }) {
  const [first, second] = siteMeta.name.split(" ");
  return (
    <span className={stacked ? "wordmark wordmark--stacked" : "wordmark"}>
      <span className="wordmark__a">{first}</span>
      {stacked ? null : " "}
      <span className="wordmark__b">{second}</span>
    </span>
  );
}
