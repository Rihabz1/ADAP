"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { audit } from "@/lib/client-storage";
import {
  examplePhoneNumbers,
  sanitizePhoneInput,
} from "@/lib/search-examples";
import { isSupportedUserIdentifier } from "@/lib/navigation";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    if (!isSupportedUserIdentifier(value)) return;
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
            onChange={(e) => setQuery(sanitizePhoneInput(e.target.value))}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            className="field has-leading-icon h-14 text-base shadow-[0_8px_24px_rgba(15,42,82,0.06)]"
            placeholder="Phone number"
            aria-label="Search data subject by phone number"
            inputMode="tel"
            maxLength={14}
            pattern="(?:[0-9]{11}|\+880[0-9]{10})"
            required
          />
          {focused && (
            <div className="absolute left-0 right-0 top-[calc(100%+.5rem)] z-50 overflow-hidden rounded-2xl border border-white bg-white/95 shadow-[0_20px_50px_rgba(15,42,82,0.16)] backdrop-blur-xl">
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
                    router.push(
                      `/users/${encodeURIComponent(identifier)}/profile`,
                    );
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
        <button
          className="btn-primary size-14 shrink-0 transition duration-200"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </form>
    </div>
  );
}
