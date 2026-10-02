import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <Logo />
            <p>Qizlarga IT sohasida o‘z yo‘lini topish, o‘rganish va kasbga tayyorlanishda yordam beruvchi AI platforma.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <Link href="/directions">IT yo‘nalishlari</Link>
            <Link href="/#how">Qanday ishlaydi</Link>
            <Link href="/#opportunities">Imkoniyatlar</Link>
            <Link href="/register">Ro‘yxatdan o‘tish</Link>
            <Link href="/login">Kirish</Link>
          </nav>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} HerPath AI. O‘z yo‘lingni top. Kelajagingni yarat.</div>
      </div>
    </footer>
  );
}
