import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty" style={{ minHeight: "60vh", alignContent: "center" }}>
        <span className="eyebrow" style={{ margin: 0 }}>404</span>
        <h1 className="h-section">Sahifa topilmadi</h1>
        <p>Siz qidirgan sahifa mavjud emas yoki ko‘chirilgan.</p>
        <Link href="/" className="btn btn-primary">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
