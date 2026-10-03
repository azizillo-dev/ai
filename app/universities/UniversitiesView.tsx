"use client";

import { useMemo, useState } from "react";
import UniversityCard from "@/components/UniversityCard";
import { TRACK_LABELS, UNIVERSITIES, type Track, type UniType } from "@/lib/universities";

const TYPES: UniType[] = ["Davlat", "Xalqaro hamkorlik", "Xususiy"];

export default function UniversitiesView() {
  const [track, setTrack] = useState<Track | "all">("all");
  const [type, setType] = useState<UniType | "all">("all");

  const shown = useMemo(
    () =>
      UNIVERSITIES.filter((u) => (type === "all" || u.type === type) && (track === "all" || u.programs.some((p) => p.tracks.includes(track)))),
    [track, type]
  );
  const highlight = (track === "all" ? [] : UNIVERSITIES.flatMap((u) => u.programs.filter((p) => p.tracks.includes(track)).map((p) => p.name)));

  return (
    <>
      <div className="chips" role="toolbar" aria-label="Yo‘nalish bo‘yicha saralash" style={{ marginBottom: 12 }}>
        <button className="chip" aria-pressed={track === "all"} onClick={() => setTrack("all")}>
          Barcha yo‘nalishlar
        </button>
        {(Object.keys(TRACK_LABELS) as Track[]).map((t) => (
          <button key={t} className="chip" aria-pressed={track === t} onClick={() => setTrack(t)}>
            {TRACK_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="chips" role="toolbar" aria-label="Universitet turi">
        <button className="chip" aria-pressed={type === "all"} onClick={() => setType("all")}>
          Barcha turlar
        </button>
        {TYPES.map((t) => (
          <button key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="muted">Bu filtr bo‘yicha universitet topilmadi.</p>
      ) : (
        <div className="grid-2">
          {shown.map((u) => (
            <UniversityCard key={u.id} uni={u} highlight={highlight} />
          ))}
        </div>
      )}
    </>
  );
}
