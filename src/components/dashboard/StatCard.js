export default function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition hover:shadow-md sm:p-6">
      <p className="text-xl lg:text-2xl font-semibold text-gray-500 dark:text-slate-400">{title}</p>

      <h2 className="mt-2 text-base font-medium text-slate-900 dark:text-white">
        {value}
      </h2>
    </div>
  );
}
