"use client";

export const tourSteps = [
  {
    id: "what",
    title: "What Forward Matter does",
    body: "It picks healthcare stocks, then trades the dates around them. The Foundation is the core.",
  },
  {
    id: "engines",
    title: "How it is built",
    body: "Open an engine for its target, its rules, and the test that comes next. Targets stay labelled as targets.",
  },
  {
    id: "strategies",
    title: "Three ways to run it",
    body: "Disciplined has no leverage. Conviction hybrid is the same book at 1.2×. Strategies at scale is built for A$10m and above.",
  },
  {
    id: "outcome",
    title: "The modelled result",
    body: "The page opens on the hybrid at A$1m. The figure is the middle of 2,000 stored paths. Targets are not added to it.",
  },
  {
    id: "scenario",
    title: "Make it yours",
    body: "Pick a strategy, set the amount and the horizon, then compare.",
  },
] as const;

export function Tour({
  step,
  onStep,
  onClose,
}: {
  step: number;
  onStep: (step: number) => void;
  onClose: () => void;
}) {
  const current = tourSteps[step];
  return (
    <div className="sim-tour" role="dialog" aria-label="Guided tour">
      <p className="sim-kicker">
        {step + 1} of {tourSteps.length}
      </p>
      <h2>{current.title}</h2>
      <p>{current.body}</p>
      <div className="sim-tour__actions">
        <button type="button" className="sim-textbtn" onClick={onClose}>
          Close
        </button>
        {step > 0 ? (
          <button type="button" className="sim-textbtn" onClick={() => onStep(step - 1)}>
            Back
          </button>
        ) : null}
        {step < tourSteps.length - 1 ? (
          <button type="button" className="sim-primary" onClick={() => onStep(step + 1)}>
            Next
          </button>
        ) : (
          <button type="button" className="sim-primary" onClick={onClose}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}
