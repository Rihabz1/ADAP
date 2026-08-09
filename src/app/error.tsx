"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="card mx-auto mt-20 max-w-lg p-10 text-center">
      <p className="eyebrow">Unable to load</p>
      <h1 className="mt-2 text-2xl font-bold">
        The data could not be displayed.
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        No internal details were exposed. You can safely try the request again.
      </p>
      <button className="btn-primary mt-6" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
