import Link from "next/link";
import { getSession } from "@/lib/auth";
import Logo from "./Logo";
import HeaderClient from "./HeaderClient";

export const PUBLIC_LINKS = [
  { href: "/#how", label: "Qanday ishlaydi" },
  { href: "/directions", label: "Yo‘nalishlar" },
  { href: "/universities", label: "Universitetlar" },
  { href: "/#opportunities", label: "Imkoniyatlar" },
];

export const APP_LINKS = [
  { href: "/dashboard", label: "Kabinet" },
  { href: "/mentor", label: "AI Mentor" },
  { href: "/directions", label: "Yo‘nalishlar" },
  { href: "/universities", label: "Universitetlar" },
];

export default async function Header() {
  const user = await getSession().catch(() => null);
  const links = user ? APP_LINKS : PUBLIC_LINKS;

  return (
    <HeaderClient
      links={links}
      user={user ? { name: user.name, username: user.username } : null}
      logo={<Logo />}
      actions={
        user ? null : (
          <>
            <Link href="/login" className="btn btn-ghost btn-sm hide-m">
              Kirish
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm hide-m">
              Boshlash
            </Link>
          </>
        )
      }
    />
  );
}
