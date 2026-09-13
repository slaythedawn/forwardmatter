import { catalyst, timeline } from "@/content/site";

export function CatalystPanel() {
  return (
    <section className="section--tail">
      <div className="catalyst">
        <div className="catalyst__rules" />

        <div className="catalyst__head">
          <div style={{ minWidth: 0 }}>
            <div className="catalyst__eyebrow">{catalyst.eyebrow}</div>
            <h2 className="catalyst__title">{catalyst.title}</h2>
          </div>
          <p className="catalyst__intro">{catalyst.intro}</p>
        </div>

        <div className="timeline">
          <div className="timeline__axis" />
          <div className="timeline__grid">
            {timeline.map((event) => (
              <div className="timeline__event" key={event.label}>
                <span
                  className="timeline__node"
                  style={
                    {
                      "--node-ring": event.ring,
                      "--node-dot": event.dot,
                      "--node-glow": event.glow,
                    } as React.CSSProperties
                  }
                />
                <span className="timeline__when">{event.when}</span>
                <span className="timeline__label">{event.label}</span>
                <span className="timeline__track">
                  <span className="timeline__fill" style={{ width: event.weight }} />
                </span>
                <span className="timeline__note">{event.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="timeline__legend">
          <span>
            <span
              className="timeline__swatch"
              style={{ border: "2px solid #8fb4dd", background: "#5b82b4" }}
            />
            Resolved
          </span>
          <span>
            <span
              className="timeline__swatch"
              style={{ border: "2px solid #8fb4dd", background: "transparent" }}
            />
            Scheduled
          </span>
          <span>
            <span
              className="timeline__swatch"
              style={{ border: "2px dashed #6b7c90", background: "transparent" }}
            />
            Expected
          </span>
          <span className="timeline__legend-note">{catalyst.legendNote}</span>
        </div>
      </div>
    </section>
  );
}
