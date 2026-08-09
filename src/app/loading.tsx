export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="skeleton h-36" />
        ))}
      </div>
      <div className="skeleton h-96" />
    </div>
  );
}
