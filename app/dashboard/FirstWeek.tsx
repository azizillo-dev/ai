"use client";

import { useEffect, useState } from "react";

/** Birinchi hafta vazifalari — belgilar shu brauzerda saqlanadi. */
export default function FirstWeek({ tasks, storageKey }: { tasks: string[]; storageKey: string }) {
  const [done, setDone] = useState<boolean[]>(() => tasks.map(() => false));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved)) setDone(tasks.map((_, i) => saved[i] === true));
    } catch {
      /* localStorage mavjud emas — muammo emas */
    }
  }, [storageKey, tasks]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* e'tiborsiz */
      }
      return next;
    });
  };

  const count = done.filter(Boolean).length;

  return (
    <>
      <div className="card-head">
        <h2>Birinchi hafta</h2>
        <span className="tag">
          {count}/{tasks.length}
        </span>
      </div>
      <ul className="todo">
        {tasks.map((t, i) => (
          <li key={i}>
            <label>
              <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} />
              <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}
