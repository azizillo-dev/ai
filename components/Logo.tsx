import Link from "next/link";

export function ButterflyMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 11.2c-1.2-2.9-3.6-5.8-6.4-6.1C3.7 4.9 2.9 6.5 3.4 8.6c.5 2.2 2.4 3.6 4.6 3.7-1.9.6-3 2.2-2.4 4 .6 1.9 2.7 2.4 4.3 1.2 1-.8 1.7-2.1 2.1-3.4Z"
        fill="currentColor"
      />
      <path
        d="M12 11.2c1.2-2.9 3.6-5.8 6.4-6.1 1.9-.2 2.7 1.4 2.2 3.5-.5 2.2-2.4 3.6-4.6 3.7 1.9.6 3 2.2 2.4 4-.6 1.9-2.7 2.4-4.3 1.2-1-.8-1.7-2.1-2.1-3.4Z"
        fill="currentColor"
        opacity=".72"
      />
      <path d="M12 9.5v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="HerPath AI — bosh sahifa">
      <span className="logo-mark">
        <ButterflyMark />
      </span>
      <span>
        HerPath <b>AI</b>
      </span>
    </Link>
  );
}
