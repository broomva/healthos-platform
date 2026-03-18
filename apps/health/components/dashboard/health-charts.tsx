"use client";

export function HealthCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="HRV Trend" description="Heart rate variability over time">
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Chart placeholder - integrate Recharts
        </div>
      </ChartCard>
      <ChartCard title="Sleep Architecture" description="Sleep stages and quality">
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Chart placeholder - integrate Recharts
        </div>
      </ChartCard>
      <ChartCard title="Training Load (ACWR)" description="Acute:Chronic workload ratio">
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Chart placeholder - integrate Recharts
        </div>
      </ChartCard>
      <ChartCard title="Body Battery" description="Energy level throughout the day">
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Chart placeholder - integrate Recharts
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {children}
    </div>
  );
}
