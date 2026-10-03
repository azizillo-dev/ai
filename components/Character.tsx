"use client";

import { useEffect, useRef } from "react";
import { CHARACTERS, type CharacterId } from "@/lib/characters";

export type CharacterState = "idle" | "listening" | "thinking" | "speaking";

/**
 * Beligacha ko'rinadigan, qo'l harakatlari bilan gapiradigan qahramon (SVG).
 * - Qo'llar 2 bo'g'inli IK bilan: har imo-ishora uchun faqat kaft nuqtasi beriladi
 * - Og'iz ovoz balandligiga (getLevel) qarab ochiladi, ko'z qisadi, nafas oladi
 * - Har kadrda React render qilinmaydi: transformlar to'g'ridan-to'g'ri DOM'ga yoziladi
 */

const W = 400;
const UPPER = 86; // yelka → tirsak
const FORE = 90; // tirsak → kaft
const SHOULDER = { x: 134, y: 318 }; // chap qo'l (o'ng qo'l ko'zgu aksida)

// Kaft nishonlari (chap qo'l koordinatalarida; o'ng qo'l uchun ko'zgu)
// bend: 1 — tirsak tashqariga, -1 — tirsak pastga/ichkariga
const POSES = {
  rest: { x: 112, y: 480, hand: 0, bend: 1 },
  chest: { x: 178, y: 376, hand: -70, bend: 1 },
  raise: { x: 152, y: 316, hand: -150, bend: 1 },
  open: { x: 70, y: 400, hand: 55, bend: -1 },
  point: { x: 160, y: 306, hand: -165, bend: 1 },
  chin: { x: 186, y: 262, hand: -155, bend: 1 },
} as const;
export type PoseName = keyof typeof POSES;

const SPEAK_POSES: [PoseName, PoseName][] = [
  ["chest", "rest"],
  ["rest", "chest"],
  ["raise", "rest"],
  ["rest", "raise"],
  ["open", "open"],
  ["chest", "open"],
  ["point", "rest"],
  ["rest", "rest"],
];

const deg = (r: number) => (r * 180) / Math.PI;

/** 2 bo'g'inli IK → [yelka burchagi, tirsak burchagi] (SVG rotate, gradus) */
function solveArm(tx: number, ty: number, bend: number): [number, number] {
  const dx = tx - SHOULDER.x;
  const dy = ty - SHOULDER.y;
  const d = Math.min(UPPER + FORE - 0.5, Math.max(Math.abs(UPPER - FORE) + 0.5, Math.hypot(dx, dy)));
  const phi = Math.atan2(dy, dx);
  const alpha = Math.acos((UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d));
  // Tirsak tashqariga (chapga/pastga) bukilsin
  const upperDir = phi + alpha * bend;
  const ex = SHOULDER.x + Math.cos(upperDir) * UPPER;
  const ey = SHOULDER.y + Math.sin(upperDir) * UPPER;
  const foreDir = Math.atan2(ty - ey, tx - ex);
  const thetaU = deg(upperDir) - 90;
  const thetaF = deg(foreDir) - 90 - thetaU;
  return [thetaU, thetaF];
}

interface ArmState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hand: number;
  bend: number;
  goal: { x: number; y: number; hand: number; bend: number };
}

export default function Character({
  id,
  state,
  getLevel,
  debugPose,
}: {
  id: CharacterId;
  state: CharacterState;
  getLevel?: () => number;
  /** Faqat ko'rinishni sozlash uchun: qo'llarni ma'lum pozada ushlab turadi */
  debugPose?: [PoseName, PoseName];
}) {
  const c = CHARACTERS[id].colors;
  const female = id === "madina";

  const root = useRef<SVGSVGElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const levelRef = useRef(getLevel);
  levelRef.current = getLevel;

  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const q = <T extends Element>(sel: string) => svg.querySelector(sel) as T | null;
    const body = q<SVGGElement>("[data-body]");
    const head = q<SVGGElement>("[data-head]");
    const eyes = q<SVGGElement>("[data-eyes]");
    const brows = q<SVGGElement>("[data-brows]");
    const mouthOpen = q<SVGPathElement>("[data-mouth-open]");
    const mouthSmile = q<SVGPathElement>("[data-mouth-smile]");
    const arms = (["l", "r"] as const).map((side) => ({
      upper: q<SVGGElement>(`[data-upper=${side}]`),
      fore: q<SVGGElement>(`[data-fore=${side}]`),
      hand: q<SVGGElement>(`[data-hand=${side}]`),
    }));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mk = (): ArmState => ({ ...POSES.rest, vx: 0, vy: 0, goal: { ...POSES.rest } });
    const arm: ArmState[] = [mk(), mk()];
    let mouth = 0;
    let headTilt = 0;
    let headTiltGoal = 0;
    let nextGesture = 0;
    let nextBlink = performance.now() + 2500;
    let blinkUntil = 0;
    let nodUntil = 0;
    let last = performance.now();
    let raf = 0;

    const setGoal = (a: ArmState, p: PoseName) => {
      const pose = POSES[p];
      // Bir xil harakat takrorlanmasligi uchun ozgina tasodif
      a.goal = { x: pose.x + (Math.random() - 0.5) * 14, y: pose.y + (Math.random() - 0.5) * 12, hand: pose.hand, bend: pose.bend };
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = stateRef.current;
      const level = st === "speaking" || st === "listening" ? Math.min(1, levelRef.current?.() ?? 0) : 0;

      // --- Imo-ishoralarni rejalashtirish
      if (debugPose) {
        arm[0].goal = { ...POSES[debugPose[0]] };
        arm[1].goal = { ...POSES[debugPose[1]] };
        nextGesture = Infinity;
      } else if (now > nextGesture) {
        if (st === "speaking") {
          const [l, r] = SPEAK_POSES[Math.floor(Math.random() * SPEAK_POSES.length)];
          setGoal(arm[0], l);
          setGoal(arm[1], r);
          nextGesture = now + 1100 + Math.random() * 1500;
          headTiltGoal = (Math.random() - 0.5) * 7;
        } else if (st === "thinking") {
          setGoal(arm[0], "rest");
          setGoal(arm[1], "chin");
          headTiltGoal = -5;
          nextGesture = now + 1500;
        } else if (st === "listening") {
          setGoal(arm[0], "rest");
          setGoal(arm[1], Math.random() < 0.3 ? "chest" : "rest");
          headTiltGoal = 6;
          nextGesture = now + 2500 + Math.random() * 2000;
        } else {
          setGoal(arm[0], "rest");
          setGoal(arm[1], Math.random() < 0.25 ? "chest" : "rest");
          headTiltGoal = (Math.random() - 0.5) * 4;
          nextGesture = now + 3000 + Math.random() * 3000;
        }
      }

      // --- Qo'llar: prujinali yaqinlashish (silliq, tabiiy)
      const k = st === "speaking" ? 60 : 30;
      const damp = 2 * Math.sqrt(k);
      arms.forEach((parts, i) => {
        const a = arm[i];
        a.vx += (k * (a.goal.x - a.x) - damp * a.vx) * dt;
        a.vy += (k * (a.goal.y - a.y) - damp * a.vy) * dt;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.hand += (a.goal.hand - a.hand) * Math.min(1, dt * 6);
        a.bend += (a.goal.bend - a.bend) * Math.min(1, dt * 5);
        // Gapirganda kaft biroz "urg'u" beradi
        const beat = st === "speaking" ? Math.sin(now / 160 + i * 2) * level * 6 : 0;
        const [tu, tf] = solveArm(a.x, a.y + beat, a.bend);
        parts.upper?.setAttribute("transform", `translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${tu.toFixed(2)})`);
        parts.fore?.setAttribute("transform", `translate(0 ${UPPER}) rotate(${tf.toFixed(2)})`);
        parts.hand?.setAttribute("transform", `translate(0 ${FORE}) rotate(${(a.hand - tu - tf).toFixed(2)})`);
      });

      // --- Nafas va bosh
      const breath = Math.sin(now / 900) * 1.6;
      headTilt += (headTiltGoal - headTilt) * Math.min(1, dt * 3);
      let nod = 0;
      if (st === "listening" && level > 0.35 && now > nodUntil + 1800) nodUntil = now + 500;
      if (now < nodUntil) nod = Math.sin(((nodUntil - now) / 500) * Math.PI) * 5;
      const bob = st === "speaking" ? Math.sin(now / 220) * level * 2.5 : 0;
      body?.setAttribute("transform", `translate(0 ${breath.toFixed(2)})`);
      head?.setAttribute("transform", `translate(0 ${(nod + bob).toFixed(2)}) rotate(${headTilt.toFixed(2)} 200 300)`);
      brows?.setAttribute("transform", `translate(0 ${(-level * 4 - (st === "thinking" ? 3 : 0)).toFixed(2)})`);

      // --- Ko'z qisish
      if (now > nextBlink) {
        blinkUntil = now + 130;
        nextBlink = now + 2200 + Math.random() * 3200;
      }
      const lookUp = st === "thinking" ? -4 : 0;
      eyes?.setAttribute("transform", `translate(0 ${lookUp}) translate(0 192) scale(1 ${now < blinkUntil ? 0.12 : 1}) translate(0 -192)`);

      // --- Og'iz (lip-sync)
      const target = st === "speaking" ? level : 0;
      mouth += (target - mouth) * Math.min(1, dt * 18);
      const open = mouth > 0.06;
      // Tabassumli "D" shakl: tepasi tekis, pasti chuqurlashadi
      const h = (3 + mouth * 11).toFixed(1);
      mouthOpen?.setAttribute("d", `M -14 -1 Q 0 2 14 -1 Q 11 ${h} 0 ${h} Q -11 ${h} -14 -1 Z`);
      mouthOpen?.setAttribute("opacity", open ? "1" : "0");
      mouthSmile?.setAttribute("opacity", open ? "0" : "1");

      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [id, debugPose]);

  const Arm = ({ side }: { side: "l" | "r" }) => (
    <g data-upper={side} transform={`translate(${SHOULDER.x} ${SHOULDER.y}) rotate(6)`}>
      <rect x={-19} y={-10} width={38} height={UPPER + 18} rx={19} fill={c.hoodie} stroke={c.hoodieDark} strokeWidth={2.5} />
      <g data-fore={side} transform={`translate(0 ${UPPER}) rotate(-2)`}>
        <rect x={-17} y={-8} width={34} height={FORE - 6} rx={17} fill={c.hoodie} stroke={c.hoodieDark} strokeWidth={2.5} />
        <rect x={-17.5} y={FORE - 22} width={35} height={14} rx={7} fill={c.hoodieDark} />
        <g data-hand={side} transform={`translate(0 ${FORE}) rotate(0)`}>
          <ellipse cx={0} cy={4} rx={14} ry={16} fill={c.skin} />
          <ellipse cx={-11} cy={-1} rx={5.5} ry={10} transform="rotate(-28 -11 -1)" fill={c.skin} />
          <path d="M -7 14 Q 0 18 7 14" stroke={c.skinShade} strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );

  return (
    <svg ref={root} viewBox={`0 0 ${W} 440`} className="character" role="img" aria-label={`${CHARACTERS[id].name} — AI mentor`}>
      <g data-body>
        {/* Orqa sochlar (ayol) */}
        {female && (
          <g data-hairback>
            <path d="M 256 220 C 292 238 300 292 284 338 C 278 354 262 356 258 340 C 270 300 266 262 244 236 Z" fill={c.hair} />
            <circle cx={262} cy={228} r={13} fill={c.accent} />
            <circle cx={256} cy={224} r={3} fill="#fff" opacity={0.5} />
          </g>
        )}

        {/* Tana — xudi */}
        <path d="M 128 302 C 160 290 240 290 272 302 C 312 316 330 346 336 400 L 344 440 L 56 440 L 64 400 C 70 346 88 316 128 302 Z" fill={c.hoodie} />
        <path d="M 138 414 Q 200 402 262 414 L 268 440 L 132 440 Z" fill={c.hoodieDark} opacity={0.55} />
        <path d="M 148 300 C 164 280 236 280 252 300 C 240 318 160 318 148 300 Z" fill={c.hoodieDark} />
        <path d="M 178 300 L 222 300 L 200 334 Z" fill={c.shirt} />

        {/* Bo'yin */}
        <path d="M 183 250 L 217 250 L 219 302 C 206 312 194 312 181 302 Z" fill={c.skin} />
        <path d="M 183 258 C 195 270 205 270 217 258 L 217 274 C 205 284 195 284 183 274 Z" fill={c.skinShade} opacity={0.7} />

        {/* Ip bog'ichlar */}
        <path d="M 186 306 L 184 354" stroke={c.shirt} strokeWidth={3} strokeLinecap="round" />
        <path d="M 214 306 L 216 354" stroke={c.shirt} strokeWidth={3} strokeLinecap="round" />
        <circle cx={184} cy={357} r={3.5} fill={c.shirt} />
        <circle cx={216} cy={357} r={3.5} fill={c.shirt} />

        {/* Bosh */}
        <g data-head>
          {female && (
            <path d="M 130 200 C 120 122 160 92 202 92 C 246 92 284 124 274 204 C 272 226 262 240 252 236 C 258 214 258 196 254 180 L 148 180 C 142 200 144 222 150 238 C 140 240 132 226 130 200 Z" fill={c.hair} />
          )}
          <ellipse cx={135} cy={198} rx={11} ry={15} fill={c.skin} />
          <ellipse cx={265} cy={198} rx={11} ry={15} fill={c.skin} />
          {female && (
            <g>
              <circle cx={266} cy={214} r={2.5} fill={c.accent} />
              <path d="M 266 216 L 266 226" stroke={c.accent} strokeWidth={2} />
              <circle cx={266} cy={229} r={4} fill={c.accent} />
            </g>
          )}
          <path d="M 200 112 C 247 112 266 150 266 192 C 266 238 238 266 200 266 C 162 266 134 238 134 192 C 134 150 153 112 200 112 Z" fill={c.skin} />

          {/* Old sochlar */}
          {female ? (
            <g fill={c.hair}>
              <path d="M 134 190 C 132 128 166 100 204 100 C 246 100 272 128 268 186 C 258 158 240 140 214 136 C 204 156 176 166 150 168 C 142 174 136 182 134 190 Z" />
              <path d="M 137 182 C 130 212 132 240 142 258 C 146 236 147 208 152 172 Z" />
            </g>
          ) : (
            <g fill={c.hair}>
              <path d="M 136 184 C 130 122 168 96 206 96 C 246 96 274 124 266 184 C 262 160 252 144 236 136 C 214 148 182 146 158 136 C 148 150 140 166 136 184 Z" />
            </g>
          )}

          {/* Qoshlar */}
          <g data-brows stroke={c.hair} strokeWidth={female ? 4 : 5.5} strokeLinecap="round" fill="none">
            <path d="M 158 167 Q 172 159 186 166" />
            <path d="M 214 166 Q 228 159 242 167" />
          </g>

          {/* Ko'zlar */}
          <g data-eyes>
            <ellipse cx={172} cy={192} rx={7} ry={9} fill="#2b2238" />
            <ellipse cx={228} cy={192} rx={7} ry={9} fill="#2b2238" />
            <circle cx={174.5} cy={188.5} r={2.4} fill="#fff" />
            <circle cx={230.5} cy={188.5} r={2.4} fill="#fff" />
            {female && (
              <g stroke="#2b2238" strokeWidth={2.4} strokeLinecap="round">
                <path d="M 164 186 L 159 182" />
                <path d="M 236 186 L 241 182" />
              </g>
            )}
          </g>

          <path d="M 199 204 Q 204 214 197 220" stroke={c.skinShade} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <ellipse cx={158} cy={222} rx={12} ry={7} fill="#f08bc4" opacity={female ? 0.3 : 0.14} />
          <ellipse cx={242} cy={222} rx={12} ry={7} fill="#f08bc4" opacity={female ? 0.3 : 0.14} />

          {/* Og'iz */}
          <g transform="translate(200 238)">
            <path data-mouth-smile d="M -15 -2 Q 0 10 15 -2" stroke="#a3405e" strokeWidth={3.5} fill="none" strokeLinecap="round" />
            <path data-mouth-open d="M -14 -1 Q 0 2 14 -1 Q 11 4 0 4 Q -11 4 -14 -1 Z" fill="#7a2840" opacity={0} />
          </g>
        </g>

        {/* Qo'llar — tananing oldida */}
        <Arm side="l" />
        <g transform={`translate(${W} 0) scale(-1 1)`}>
          <Arm side="r" />
        </g>
      </g>
    </svg>
  );
}
