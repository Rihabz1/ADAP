"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
import { getSearchDestination } from "@/lib/navigation";
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
    pathnameIdentifier && /^(USR\d{3}|\d{11})$/i.test(pathnameIdentifier)
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
    if (saved && /^(USR\d{3}|\d{11})$/i.test(saved))
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
  const isActive = (label: string, href: string) => {
    if (label === "Users")
      return pathname === "/users" || pathname === userRoute;
    if (["Profile", "Map", "Analytics"].includes(label))
      return pathname === href;
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
    <div className="min-h-screen bg-[#f4f7fa]">
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-[#0b1a2e] p-2 text-white lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#081426] text-slate-300 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 border-b border-white/10 px-5 py-6"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-10 place-items-center rounded-xl bg-teal-500 text-[#081426]">
            <ShieldCheck />
          </span>
          <span>
            <b className="block text-lg text-white">ADAP</b>
            <small className="text-[10px] uppercase tracking-wider text-slate-400">
              Application Data Analysis Platform
            </small>
          </span>
        </Link>
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Primary navigation"
        >
          {primary.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive(label, href) ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
          <div className="mx-2 my-4 border-t border-white/10" />
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
          className="m-3 flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5 text-sm hover:bg-white/5"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-17 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 pl-16 backdrop-blur lg:px-7">
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
            <span className="grid size-8 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
              SA
            </span>
            <span className="hidden text-sm font-semibold sm:block">
              System Admin
            </span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
