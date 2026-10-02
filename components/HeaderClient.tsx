"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";

interface Props {
  links: { href: string; label: string }[];
  user: { name: string; username: string } | null;
  logo: ReactNode;
  actions: ReactNode;
}

export default function HeaderClient({ links, user, logo, actions }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sahifa almashganda mobil menyuni yopish
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const initials = user?.name.trim().charAt(0).toUpperCase() ?? "";

  return (
    <header className={`header${scrolled || open ? " scrolled" : ""}`}>
      <div className="container header-inner">
        {logo}
        <nav className="nav" aria-label="Asosiy menyu">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {actions}
          {user && (
            <>
              <span className="avatar hide-m" title={`@${user.username}`}>
                {initials}
              </span>
              <button className="btn btn-ghost btn-sm hide-m" onClick={logout}>
                <LogOut size={16} /> Chiqish
              </button>
            </>
          )}
          <button
            className="menu-btn"
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu">
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px 14px" }}>
              <span className="avatar">{initials}</span>
              <div>
                <strong style={{ display: "block", lineHeight: 1.2 }}>{user.name}</strong>
                <small className="muted">@{user.username}</small>
              </div>
            </div>
          )}
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="m-link" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="m-actions">
            {user ? (
              <button className="btn btn-outline" style={{ gridColumn: "1 / -1" }} onClick={logout}>
                <LogOut size={16} /> Chiqish
              </button>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline">
                  Kirish
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Boshlash
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
