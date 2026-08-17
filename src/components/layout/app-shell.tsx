"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  BarChart3,
  FileClock,
  Gauge,
  LogOut,
  Map,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import adapLogo from "../../../data/adap_logo.png";
import {
  getSearchDestination,
  getUserNavigationSection,
  isSupportedUserIdentifier,
} from "@/lib/navigation";
import { examplePhoneNumbers } from "@/lib/search-examples";

const publicRoutes = ["/", "/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matchedIdentifier = pathname.match(/^\/users\/([^/]+)/)?.[1];
  const pathnameIdentifier = matchedIdentifier
    ? decodeURIComponent(matchedIdentifier)
    : null;
  const validPathIdentifier =
    pathnameIdentifier && isSupportedUserIdentifier(pathnameIdentifier)
      ? pathnameIdentifier.toUpperCase()
      : null;
  const [lastIdentifier, setLastIdentifier] = useState("USR001");
  useEffect(() => {
    if (validPathIdentifier) {
      setLastIdentifier(validPathIdentifier);
      localStorage.setItem("adap:last-user", validPathIdentifier);
      return;
    }
    const saved = localStorage.getItem("adap:last-user");
    if (saved && isSupportedUserIdentifier(saved))
      setLastIdentifier(saved.toUpperCase());
  }, [validPathIdentifier]);
  if (publicRoutes.includes(pathname)) return <>{children}</>;
  const currentIdentifier = validPathIdentifier ?? lastIdentifier;
  const userRoute = `/users/${currentIdentifier}`;
  const showHeaderSearch = !["/dashboard", "/users", "/audit"].includes(
    pathname,
  );
  const primary = [
    { href: "/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/users", label: "Users", icon: Users },
    {
      href: `${userRoute}/profile`,
      label: "Profile",
      icon: Activity,
    },
    {
      href: `${userRoute}/map`,
      label: "Map",
      icon: Map,
    },
    {
      href: `${userRoute}/analytics`,
      label: "Analytics",
      icon: BarChart3,
    },
    { href: "/geofences", label: "Geofences", icon: ShieldCheck },
    { href: "/audit", label: "Audit Log", icon: FileClock },
  ];
  const userNavigationSection = getUserNavigationSection(pathname);
  const isActive = (label: string, href: string) => {
    if (label === "Users") return userNavigationSection === "users";
    if (label === "Profile") return userNavigationSection === "profile";
    if (label === "Map") return userNavigationSection === "map";
    if (label === "Analytics") return userNavigationSection === "analytics";
    return pathname === href;
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const identifier = query.trim();
    if (!identifier) return;
    if (!/^\d{11}$/.test(identifier)) return;
    const normalized = identifier;
    setLastIdentifier(normalized);
    localStorage.setItem("adap:last-user", normalized);
    router.push(getSearchDestination(pathname, normalized));
  };
  return (
    <div className="app-shell-bg min-h-screen text-[#0B2A55]">
      <button
        className="fixed left-4 top-4 z-50 rounded-xl border border-white/90 bg-white/85 p-2 text-[#0B2A55] shadow-lg backdrop-blur-xl lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-[#0B2A55]/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/90 bg-white/82 text-slate-600 shadow-[12px_0_40px_rgba(15,42,82,0.07)] backdrop-blur-2xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Link
          href="/dashboard"
          className="border-b border-slate-200/70 px-4 pb-3 pt-4"
          onClick={() => setOpen(false)}
          aria-label="ADAP dashboard"
        >
          <span className="flex h-20 items-start justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_28px_rgba(15,42,82,0.08)]">
            <Image
              src={adapLogo}
              alt="ADAP — Application Data Analysis Platform"
              className="h-auto w-[calc(100%-1rem)] -translate-y-[3.625rem]"
              priority
            />
          </span>
        </Link>
        <nav
          className="flex-1 overflow-y-auto px-3 pb-4 pt-3"
          aria-label="Primary navigation"
        >
          {primary.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={isActive(label, href) ? { color: "#ffffff" } : undefined}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive(label, href) ? "bg-gradient-to-r from-[#002556] to-[#03809A] text-white shadow-[0_8px_20px_rgba(3,128,154,0.22)]" : "text-slate-600 hover:bg-blue-50/80 hover:text-[#0B2A55]"}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
          <div className="mx-2 my-4 border-t border-slate-200/80" />
          <span className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-sm opacity-40">
            <Settings size={17} />
            Settings
          </span>
        </nav>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
          }}
          className="m-3 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2.5 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-[#0B2A55]"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-17 items-center gap-3 border-b border-white/90 bg-white/72 px-4 pl-16 shadow-[0_8px_30px_rgba(15,42,82,0.04)] backdrop-blur-2xl lg:px-7">
          {showHeaderSearch && (
            <form
              onSubmit={submit}
              className="relative hidden max-w-md flex-1 sm:block"
            >
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="field has-leading-icon py-2 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value.replace(/\D/g, ""))}
                placeholder={`Try ${examplePhoneNumbers[0]}`}
                aria-label="Search by phone number"
                list="header-phone-suggestions"
                inputMode="tel"
                maxLength={11}
                pattern="[0-9]{11}"
                required
              />
              <datalist id="header-phone-suggestions">
                {examplePhoneNumbers.map((phone) => (
                  <option value={phone} key={phone} />
                ))}
              </datalist>
            </form>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#002556] to-[#03809A] text-xs font-bold text-white shadow-[0_8px_18px_rgba(3,128,154,0.22)]">
              SA
            </span>
            <span className="hidden text-sm font-semibold sm:block">
              System Admin
            </span>
          </div>
        </header>
        <main className="relative p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
