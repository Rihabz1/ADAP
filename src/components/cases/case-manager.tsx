"use client";
import { FormEvent, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  FilePlus2,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { DemoCase } from "@/lib/types";
import { audit, keys, readLocal, writeLocal } from "@/lib/client-storage";
import { formatDateTime } from "@/lib/format";
import { PageTitle } from "@/components/ui";
const seed: DemoCase = {
  id: "CASE-001",
  title: "Investigation",
  description: "Testing activity correlation functionality.",
  subjects: ["USR001"],
  status: "Open",
  createdAt: "2026-08-09T18:31:00+06:00",
  notes: [],
  bookmarks: [],
};
export function CaseManager() {
  const [cases, setCases] = useState<DemoCase[]>([]);
  const [active, setActive] = useState("");
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    const stored = readLocal<DemoCase[]>(keys.cases, []);
    const data = stored.length ? stored : [seed];
    setCases(data);
    setActive(data[0].id);
  }, []);
  const persist = (next: DemoCase[]) => {
    setCases(next);
    writeLocal(keys.cases, next);
  };
  const selected = cases.find((c) => c.id === active);
  function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: DemoCase = {
      id: `CASE-${String(cases.length + 1).padStart(3, "0")}`,
      title: String(data.get("title")),
      description: String(data.get("description")),
      subjects: [],
      status: "Open",
      createdAt: new Date().toISOString(),
      notes: [],
      bookmarks: readLocal<string[]>(keys.bookmarks, []),
    };
    persist([next, ...cases]);
    setActive(next.id);
    setCreating(false);
    audit("CASE_CREATED", next.id);
  }
  const update = (patch: Partial<DemoCase>) =>
    selected &&
    persist(cases.map((c) => (c.id === selected.id ? { ...c, ...patch } : c)));
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        eyebrow="Browser-local workspace"
        title="Cases"
        description="Organize subjects, notes, and bookmarked activity references. Case data is stored only in this browser."
        action={
          <button
            className="btn-primary"
            onClick={() => setCreating(!creating)}
          >
            <FilePlus2 size={16} />
            Create Case
          </button>
        }
      />
      {creating && (
        <form
          onSubmit={create}
          className="card mb-5 grid gap-3 p-5 md:grid-cols-[1fr_2fr_auto]"
        >
          <label className="text-xs font-bold text-slate-500">
            Title
            <input
              name="title"
              className="field mt-1"
              required
              maxLength={80}
            />
          </label>
          <label className="text-xs font-bold text-slate-500">
            Description
            <input
              name="description"
              className="field mt-1"
              required
              maxLength={300}
            />
          </label>
          <button className="btn-primary self-end">Create</button>
        </form>
      )}
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="card overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <p className="eyebrow">Case index</p>
          </div>
          {cases.map((c) => (
            <button
              onClick={() => setActive(c.id)}
              key={c.id}
              className={`w-full border-b border-slate-100 p-4 text-left ${active === c.id ? "bg-teal-50" : "hover:bg-slate-50"}`}
            >
              <p className="text-[10px] font-bold tracking-wider text-teal-700">
                {c.id}
              </p>
              <b className="mt-1 block text-sm">{c.title}</b>
              <span className="mt-2 inline-block rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500">
                {c.status}
              </span>
            </button>
          ))}
        </aside>
        {selected ? (
          <section className="space-y-5">
            <div className="card p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="eyebrow">{selected.id}</p>
                  <h2 className="mt-2 text-2xl font-bold">{selected.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {selected.description}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    Created {formatDateTime(selected.createdAt)}
                  </p>
                </div>
                <label className="text-xs font-bold text-slate-500">
                  Status
                  <select
                    className="field mt-1"
                    value={selected.status}
                    onChange={(e) => {
                      update({ status: e.target.value as DemoCase["status"] });
                      audit("CASE_STATUS_CHANGED", selected.id);
                    }}
                  >
                    <option>Open</option>
                    <option>Review</option>
                    <option>Closed</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="card p-5">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-teal-700" />
                  <h3 className="font-bold">Subjects</h3>
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    className="field"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value.toUpperCase())}
                    placeholder="USR001"
                    pattern="USR[0-9]{3}"
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (
                        !/^USR\d{3}$/.test(subject) ||
                        selected.subjects.includes(subject)
                      )
                        return;
                      update({ subjects: [...selected.subjects, subject] });
                      setSubject("");
                      audit("USER_ADDED_TO_CASE", subject);
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {selected.subjects.map((s) => (
                    <div
                      key={s}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                    >
                      <a
                        href={`/users/${s}`}
                        className="font-bold text-teal-700"
                      >
                        {s}
                      </a>
                      <button
                        onClick={() =>
                          update({
                            subjects: selected.subjects.filter((x) => x !== s),
                          })
                        }
                        aria-label={`Remove ${s}`}
                      >
                        <Trash2 size={15} className="text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="font-bold">Case Notes</h3>
                <div className="mt-4 flex gap-2">
                  <input
                    className="field"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    placeholder="Add a case note…"
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (!note.trim()) return;
                      update({
                        notes: [
                          {
                            id: crypto.randomUUID(),
                            author: "System Admin",
                            createdAt: new Date().toISOString(),
                            text: note.trim(),
                          },
                          ...selected.notes,
                        ],
                      });
                      setNote("");
                      audit("CASE_NOTE_ADDED", selected.id);
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {selected.notes.map((n) => (
                    <div
                      className="rounded-lg bg-slate-50 p-3 text-sm"
                      key={n.id}
                    >
                      <p>{n.text}</p>
                      <small className="mt-2 block text-slate-400">
                        {n.author} · {formatDateTime(n.createdAt)}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness size={18} className="text-teal-700" />
                <h3 className="font-bold">Case Evidence</h3>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {readLocal<string[]>(keys.bookmarks, []).length} saved activity
                references are available in this browser. New cases snapshot
                current bookmark IDs.
              </p>
              {selected.bookmarks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.bookmarks.map((id) => (
                    <span
                      className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs"
                      key={id}
                    >
                      {id}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="card grid min-h-80 place-items-center text-slate-500">
            Select a case
          </div>
        )}
      </div>
    </div>
  );
}
