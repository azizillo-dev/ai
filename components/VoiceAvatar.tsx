"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking";

/**
 * Madina — gapiradigan AI mentor avatari.
 * Atrofdagi halqalar ovoz balandligiga (getLevel) qarab harakatlanadi.
 * Har kadrda React render qilinmaydi — faqat CSS o'zgaruvchisi (--lvl) yangilanadi.
 */
export default function VoiceAvatar({
  state,
  getLevel,
  size = 200,
}: {
  state: AvatarState;
  getLevel?: () => number;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const getLevelRef = useRef(getLevel);
  getLevelRef.current = getLevel;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let smooth = 0;
    const loop = () => {
      const target = state === "speaking" || state === "listening" ? (getLevelRef.current?.() ?? 0) : 0;
      smooth = smooth * 0.75 + target * 0.25;
      el.style.setProperty("--lvl", smooth.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  return (
    <div ref={ref} className={`va va-${state}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="va-ring r3" />
      <span className="va-ring r2" />
      <span className="va-ring r1" />
      <span className="va-spin" />
      <span className="va-face">
        <Image src="/madina-avatar.jpg" alt="" width={320} height={320} priority />
      </span>
    </div>
  );
}
