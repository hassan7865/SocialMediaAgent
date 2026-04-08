import { AppLoader } from "@/components/shared/AppLoader";

interface ResourcePanelProps {
  title: string;
  description: string;
  loading?: boolean;
  error?: boolean;
  rows?: Array<Record<string, unknown>>;
}

export function ResourcePanel({ title, description, loading = false, error = false, rows = [] }: ResourcePanelProps) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">
        {loading ? <AppLoader /> : null}
        {error ? <p className="text-sm text-destructive">Unable to load data.</p> : null}
        {!loading && !error && rows.length === 0 ? <p className="text-sm text-muted-foreground">No data yet.</p> : null}
        {!loading && !error && rows.length > 0 ? (
          <div className="space-y-2">
            {rows.map((row, index) => (
              <pre key={index} className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(row, null, 2)}
              </pre>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
