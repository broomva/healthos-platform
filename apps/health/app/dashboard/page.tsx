import { HealthCharts } from "@/components/dashboard/health-charts";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">
          Health Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Track your key health and training metrics over time.
        </p>
      </div>

      <HealthCharts />
    </div>
  );
}
