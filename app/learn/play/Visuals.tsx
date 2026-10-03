import { ArrowRight, ArrowLeftRight, Check } from "lucide-react";

export type Visual =
  | { type: "points"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "analogy"; life: { label: string; text: string }; tech: { label: string; text: string } }
  | { type: "code"; language: string; code: string; caption?: string }
  | { type: "keyword"; word: string; meaning: string };

const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

/** Sahna vizuali — har bir element navbat bilan (stagger) paydo bo'ladi */
export default function SceneVisual({ visual }: { visual: Visual }) {
  switch (visual.type) {
    case "points":
      return (
        <ul className="v-points">
          {visual.items.map((t, i) => (
            <li key={i} className="pop" style={d(i)}>
              <span className="v-check">
                <Check size={16} strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="v-steps">
          {visual.items.map((t, i) => (
            <li key={i} className="pop" style={d(i)}>
              <span className="v-step-n">{i + 1}</span>
              <span>{t}</span>
              {i < visual.items.length - 1 && <ArrowRight className="v-arrow" size={18} />}
            </li>
          ))}
        </ol>
      );
    case "analogy":
      return (
        <div className="v-analogy">
          <div className="v-card pop" style={d(0)}>
            <small>{visual.life.label}</small>
            <p>{visual.life.text}</p>
          </div>
          <span className="v-swap pop" style={d(1)}>
            <ArrowLeftRight size={20} />
          </span>
          <div className="v-card tech pop" style={d(2)}>
            <small>{visual.tech.label}</small>
            <p>{visual.tech.text}</p>
          </div>
        </div>
      );
    case "code":
      return (
        <figure className="v-code pop" style={d(0)}>
          <div className="v-code-head">
            <i />
            <i />
            <i />
            <span>{visual.language}</span>
          </div>
          <pre>
            {visual.code.split("\n").map((line, i) => (
              <code key={i} className="type-line" style={d(i)}>
                {line || " "}
                {"\n"}
              </code>
            ))}
          </pre>
          {visual.caption && <figcaption>{visual.caption}</figcaption>}
        </figure>
      );
    case "keyword":
      return (
        <div className="v-keyword">
          <strong className="pop" style={d(0)}>
            {visual.word}
          </strong>
          <p className="pop" style={d(1)}>
            {visual.meaning}
          </p>
        </div>
      );
  }
}
