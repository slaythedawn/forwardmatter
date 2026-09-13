import { BrandMark } from "../BrandMark";
import {
  capabilities,
  type EngineItem,
  inputs,
  intelligenceSystem,
  outputs,
} from "@/content/site";

function EngineColumn({ heading, items }: { heading: string; items: EngineItem[] }) {
  return (
    <div className="engine__col">
      <div className="engine__col-head">{heading}</div>
      {items.map((item) => (
        <div className="engine__item" key={item.label}>
          <div className="eyebrow--accent">{item.label}</div>
          <h3 className="h3">{item.title}</h3>
          <p className="body-15">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export function IntelligenceSystem() {
  const { engine } = intelligenceSystem;

  return (
    <section id="technology" className="section">
      <div className="section-head">
        <div className="eyebrow section-head__eyebrow">{intelligenceSystem.eyebrow}</div>
        <div className="section-head__body">
          <h2 className="h2">{intelligenceSystem.title}</h2>
          <p className="body-17">{intelligenceSystem.body}</p>
        </div>
      </div>

      <div className="engine">
        <EngineColumn heading="Intelligence inputs" items={inputs} />

        <div className="engine__card">
          <div className="engine__mark">
            <BrandMark style={{ display: "block", width: "100%", height: "100%" }} />
          </div>
          <div className="eyebrow--accent">{engine.eyebrow}</div>
          <h3 className="engine__title">{engine.title}</h3>
          <p className="engine__body">{engine.body}</p>
          <span className="chip">{engine.chip}</span>
        </div>

        <EngineColumn heading="Decision outputs" items={outputs} />
      </div>

      <div className="capabilities">
        {capabilities.map((capability) => (
          <div className="capability" key={capability.title}>
            <span className="bezel capability__bezel">
              <span
                className="capability__lamp"
                style={
                  {
                    "--lamp-top": capability.lampTop,
                    "--lamp-bottom": capability.lampBottom,
                    "--lamp-glow": capability.glow,
                  } as React.CSSProperties
                }
              />
            </span>
            <h3 className="capability__title">{capability.title}</h3>
            <p className="body-15">{capability.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
