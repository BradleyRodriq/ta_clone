"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Me = {
  id: string;
  email: string;
  name: string;
  role: string;
} | null;

export function SiteHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<Me>(undefined as unknown as Me);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null));
  }, []);

  useEffect(() => {
    load();
  }, [load, pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          Harbor<span className="text-accent">List</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/listings" className="text-sm text-muted hover:text-foreground">
            Listings
          </Link>
          {user && (
            <>
              <Link href="/favorites" className="text-sm text-muted hover:text-foreground">
                Favorites
              </Link>
              <Link href="/messages" className="text-sm text-muted hover:text-foreground">
                Messages
              </Link>
              {user.role === "OWNER" && (
                <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
                  Dashboard
                </Link>
              )}
              <Link href="/profile" className="text-sm text-muted hover:text-foreground">
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user === undefined ? (
            <span className="h-8 w-20 animate-pulse rounded bg-border" />
          ) : user ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-background"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md border border-border px-2 py-1 text-sm md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/listings" onClick={() => setOpen(false)}>
              Listings
            </Link>
            {user && (
              <>
                <Link href="/favorites" onClick={() => setOpen(false)}>
                  Favorites
                </Link>
                <Link href="/messages" onClick={() => setOpen(false)}>
                  Messages
                </Link>
                {user.role === "OWNER" && (
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <Link href="/profile" onClick={() => setOpen(false)}>
                  Profile
                </Link>
                <button type="button" onClick={() => { void logout(); setOpen(false); }}>
                  Log out
                </button>
              </>
            )}
            {!user && user !== undefined && (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
