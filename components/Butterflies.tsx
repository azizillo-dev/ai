"use client";

import { useEffect, useRef } from "react";

/**
 * Hero qismida uchib yuruvchi mayda kapalaklar.
 * - Desktop (sichqoncha): kursor atrofida aylanib, unga ergashadi.
 * - Telefon: erkin uchadi; ekranga tegilganda o'sha nuqtaga qisqa muddat uchib keladi.
 * - Canvas 2D + requestAnimationFrame; ko'rinmay qolganda yoki tab yashirilganda to'xtaydi.
 * - prefers-reduced-motion yoqilgan bo'lsa — faqat bitta statik kadr chiziladi.
 */

type Palette = readonly [upper: string, lower: string, edge: string];

const PALETTES: Palette[] = [
  ["#7c5cf0", "#c3b2fc", "#4b2fb8"],
  ["#e2659f", "#f6b8d6", "#b13f78"],
  ["#a185f8", "#e6defe", "#6c4ce0"],
  ["#c084fc", "#f5d0fe", "#8b3fd1"],
  ["#8f7bf2", "#fbd5e8", "#5638c4"],
];

interface Fly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  flapSpeed: number;
  palette: Palette;
  tx: number;
  ty: number;
  retarget: number;
  orbitR: number;
  orbitA: number;
  orbitSpeed: number;
  alpha: number;
  bob: number;
  angle: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function Butterflies() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let flies: Fly[] = [];
    let raf = 0;
    let running = false;
    let ready = false;
    let visible = true;
    let last = 0;

    // Kursor holati (canvas koordinatalarida)
    const pointer = { x: 0, y: 0, active: false, until: 0 };

    const spawn = (i: number, count: number): Fly => {
      const size = rand(6, 11) * (w < 640 ? 0.85 : 1);
      const x = rand(0.05, 0.95) * w;
      const y = rand(0.08, 0.8) * h;
      return {
        x,
        y,
        vx: rand(-20, 20),
        vy: rand(-20, 20),
        size,
        phase: rand(0, Math.PI * 2),
        flapSpeed: rand(15, 22),
        palette: PALETTES[i % PALETTES.length],
        tx: x,
        ty: y,
        retarget: 0,
        orbitR: rand(26, 90),
        orbitA: (i / count) * Math.PI * 2,
        orbitSpeed: rand(0.7, 1.5) * (Math.random() < 0.5 ? -1 : 1),
        alpha: 0,
        bob: rand(0, Math.PI * 2),
        angle: rand(-Math.PI, Math.PI),
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nw = Math.max(1, Math.round(rect.width));
      const nh = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(nw * dpr);
      canvas.height = Math.round(nh * dpr);
      const first = w === 0;
      // Mavjud kapalaklarni yangi o'lchamga proporsional ko'chirish
      if (!first) {
        for (const f of flies) {
          f.x = (f.x / w) * nw;
          f.y = (f.y / h) * nh;
          f.tx = (f.tx / w) * nw;
          f.ty = (f.ty / h) * nh;
        }
      }
      w = nw;
      h = nh;
      const count = w < 640 ? 7 : w < 1024 ? 10 : 14;
      if (first || flies.length !== count) {
        flies = Array.from({ length: count }, (_, i) => flies[i] ?? spawn(i, count));
      }
    };

    const pickWanderTarget = (f: Fly) => {
      f.tx = rand(0.04, 0.96) * w;
      f.ty = rand(0.06, 0.78) * h;
      f.retarget = rand(2.5, 6);
    };

    const step = (dt: number, now: number) => {
      const following = pointer.active && (finePointer || now < pointer.until);
      for (const f of flies) {
        f.alpha = Math.min(1, f.alpha + dt * 1.2);
        f.bob += dt * 3;

        let tx: number;
        let ty: number;
        let maxSpeed: number;
        if (following) {
          // Kursor atrofida orbita — to'planib qolmasdan "gala" bo'lib ergashadi
          f.orbitA += f.orbitSpeed * dt;
          tx = pointer.x + Math.cos(f.orbitA) * f.orbitR;
          ty = pointer.y + Math.sin(f.orbitA) * f.orbitR * 0.75;
          maxSpeed = 260;
        } else {
          f.retarget -= dt;
          if (f.retarget <= 0 || Math.hypot(f.tx - f.x, f.ty - f.y) < 24) pickWanderTarget(f);
          tx = f.tx;
          ty = f.ty;
          maxSpeed = 70;
        }

        // Yumshoq yo'naltirish (steering)
        const dx = tx - f.x;
        const dy = ty - f.y;
        const dist = Math.hypot(dx, dy) || 1;
        const desired = Math.min(maxSpeed, dist * (following ? 2.4 : 1));
        const ax = (dx / dist) * desired - f.vx;
        const ay = (dy / dist) * desired - f.vy;
        const steer = following ? 3.2 : 1.4;
        f.vx += ax * steer * dt;
        f.vy += ay * steer * dt;

        // Bir-biriga urilmaslik
        for (const o of flies) {
          if (o === f) continue;
          const ox = f.x - o.x;
          const oy = f.y - o.y;
          const d2 = ox * ox + oy * oy;
          if (d2 > 0 && d2 < 400) {
            const d = Math.sqrt(d2);
            f.vx += (ox / d) * 90 * dt;
            f.vy += (oy / d) * 90 * dt;
          }
        }

        // Kapalakka xos "tebranish"
        f.vy += Math.sin(f.bob) * 22 * dt;

        f.x += f.vx * dt;
        f.y += f.vy * dt;

        // Tezroq uchganda qanot ham tezroq qoqiladi
        const speed = Math.hypot(f.vx, f.vy);
        f.phase += dt * (f.flapSpeed + speed * 0.04);

        // Yo'nalishni silliq burish (keskin aylanib ketmasligi uchun)
        if (speed > 4) {
          const target = Math.atan2(f.vy, f.vx) + Math.PI / 2;
          let diff = target - f.angle;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          f.angle += diff * Math.min(1, dt * 8);
        }

        // Chegaradan chiqib ketmaslik
        const m = 20;
        if (f.x < -m) f.x = w + m;
        else if (f.x > w + m) f.x = -m;
        if (f.y < -m) f.vy += 200 * dt;
        else if (f.y > h + m) f.vy -= 200 * dt;
      }
    };

    const drawWing = (s: number, upper: string, lower: string, edge: string) => {
      // Yuqori qanot
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.15);
      ctx.bezierCurveTo(s * 0.5, -s * 1.25, s * 1.35, -s * 1.15, s * 1.15, -s * 0.35);
      ctx.bezierCurveTo(s * 1.0, -s * 0.05, s * 0.45, s * 0.05, 0, 0);
      ctx.fillStyle = upper;
      ctx.fill();
      ctx.lineWidth = s * 0.08;
      ctx.strokeStyle = edge;
      ctx.stroke();
      // Pastki qanot
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.6, s * 0.05, s * 0.95, s * 0.55, s * 0.6, s * 0.85);
      ctx.bezierCurveTo(s * 0.35, s * 1.05, s * 0.1, s * 0.6, 0, s * 0.3);
      ctx.fillStyle = lower;
      ctx.fill();
      ctx.stroke();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const f of flies) {
        const [upper, lower, edge] = f.palette;
        // Qanot qoqishi: yuqoridan qaraganda qanot kengligi o'zgaradi
        const flap = 0.22 + 0.78 * Math.abs(Math.sin(f.phase));
        const s = f.size;

        ctx.save();
        ctx.globalAlpha = f.alpha * 0.92;
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);

        ctx.save();
        ctx.scale(flap, 1);
        drawWing(s, upper, lower, edge);
        ctx.scale(-1, 1);
        drawWing(s, upper, lower, edge);
        ctx.restore();

        // Tana va mo'ylovlar
        ctx.fillStyle = edge;
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.11, s * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = s * 0.06;
        ctx.strokeStyle = edge;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.5);
        ctx.quadraticCurveTo(-s * 0.15, -s * 0.85, -s * 0.32, -s * 0.95);
        ctx.moveTo(0, -s * 0.5);
        ctx.quadraticCurveTo(s * 0.15, -s * 0.85, s * 0.32, -s * 0.95);
        ctx.stroke();

        ctx.restore();
      }
    };

    const loop = (t: number) => {
      if (!running) return;
      const now = t / 1000;
      const dt = Math.min(0.05, last ? now - last : 0.016);
      last = now;
      step(dt, now);
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || !ready || reduced || !visible || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const toLocal = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top, inside: clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom };
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const p = toLocal(e.clientX, e.clientY);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = p.inside;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onTap = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const p = toLocal(e.clientX, e.clientY);
      if (!p.inside) return;
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
      pointer.until = performance.now() / 1000 + 2.5;
    };

    resize();
    if (reduced) {
      for (const f of flies) f.alpha = 1;
      draw();
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onTap, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Sahifa birinchi chizilgandan keyin boshlash — yuklanish tezligiga ta'sir qilmasin
    const begin = () => {
      ready = true;
      start();
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(begin, { timeout: 800 })
      : window.setTimeout(begin, 200);

    return () => {
      stop();
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onTap);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="butterflies" aria-hidden="true" />;
}
