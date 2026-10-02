"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container">
      <div className="empty" style={{ minHeight: "60vh", alignContent: "center" }}>
        <h1 className="h-section">Nimadir xato ketdi</h1>
        <p>Sahifani yuklashda xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring.</p>
        {error.digest && <p className="muted" style={{ fontSize: 13 }}>Kod: {error.digest}</p>}
        <button className="btn btn-primary" onClick={reset}>
          Qayta urinish
        </button>
      </div>
    </div>
  );
}
