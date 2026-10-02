import { Fragment, type ReactNode } from "react";

/**
 * AI javoblari uchun yengil va xavfsiz markdown ko'rsatgich.
 * HTML ishlatilmaydi (dangerouslySetInnerHTML yo'q) — faqat React elementlari.
 * Qo'llab-quvvatlanadi: ```kod```, `kod`, **qalin**, *kursiv*, [havola](https://...), ro'yxatlar, sarlavhalar.
 */

const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(INLINE);
  return parts.map((p, i) => {
    const key = `${keyBase}-${i}`;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) return <code key={key}>{p.slice(1, -1)}</code>;
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={key}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={key}>{p.slice(1, -1)}</em>;
    const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(p);
    if (link)
      return (
        <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
          {link[1]}
        </a>
      );
    return <Fragment key={key}>{p}</Fragment>;
  });
}

function blocks(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const lines = text.split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      const k = `${keyBase}-p${out.length}`;
      out.push(
        <p key={k}>
          {para.map((l, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {inline(l, `${k}-${i}`)}
            </Fragment>
          ))}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const k = `${keyBase}-l${out.length}`;
      const items = list.items.map((it, i) => <li key={i}>{inline(it, `${k}-${i}`)}</li>);
      out.push(list.ordered ? <ol key={k}>{items}</ol> : <ul key={k}>{items}</ul>);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const h = /^#{1,6}\s+(.*)$/.exec(line);

    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (ul || ol) {
      flushPara();
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((ul ?? ol)![1]);
    } else if (h) {
      flushPara();
      flushList();
      const k = `${keyBase}-h${out.length}`;
      out.push(<h4 key={k}>{inline(h[1].replace(/\*\*/g, ""), k)}</h4>);
    } else if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out;
}

export default function Markdown({ text }: { text: string }) {
  // Toq indekslar — kod bloklari (yopilmagan blok ham kod sifatida ko'rsatiladi, streaming uchun)
  const segments = text.split(/```/);
  return (
    <div className="md">
      {segments.map((seg, i) => {
        if (i % 2 === 1) {
          const nl = seg.indexOf("\n");
          const code = nl >= 0 && /^[\w+#.-]*$/.test(seg.slice(0, nl).trim()) ? seg.slice(nl + 1) : seg;
          return (
            <pre key={`c${i}`}>
              <code>{code.replace(/\n$/, "")}</code>
            </pre>
          );
        }
        return <Fragment key={`t${i}`}>{blocks(seg, `t${i}`)}</Fragment>;
      })}
    </div>
  );
}
