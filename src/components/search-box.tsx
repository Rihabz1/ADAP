"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { audit } from "@/lib/client-storage";
import { examplePhoneNumbers } from "@/lib/search-examples";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    if (!/^\d{11}$/.test(value)) return;
    localStorage.setItem("adap:last-user", value);
    audit("SEARCH", value);
    router.push(`/users/${encodeURIComponent(value)}/profile`);
  };
  return (
    <div className="relative z-10">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            className="field has-leading-icon h-14 text-base shadow-sm"
            placeholder={`Try ${examplePhoneNumbers[0]}`}
            aria-label="Search user by phone number"
            maxLength={11}
            required
          />
          {focused && (
            <div className="absolute left-0 right-0 top-[calc(100%+.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <p className="px-4 pb-2 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Example phone numbers
              </p>
              {examplePhoneNumbers.map((identifier) => (
                <button
                  type="button"
                  onMouseDown={() => {
                    setQuery(identifier);
                    localStorage.setItem("adap:last-user", identifier);
                    audit("SEARCH", identifier);
                    router.push(`/users/${identifier}/profile`);
                  }}
                  key={identifier}
                  className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-left text-slate-800 hover:bg-slate-50"
                >
                  <b className="font-mono text-sm">{identifier}</b>
                  <ArrowRight size={15} className="text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn-primary h-14 px-7">
          <Search size={18} />
          Search
        </button>
      </form>
    </div>
  );
}
