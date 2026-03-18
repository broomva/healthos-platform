import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

export type { BaseChart } from "./interactive-chart-impl";

const ChartSkeleton = () => (
  <Card className="overflow-hidden border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
    <div className="flex h-[400px] items-center justify-center p-6">
      <div className="size-8 animate-pulse rounded-md bg-muted" />
    </div>
  </Card>
);

export default dynamic(
  () => import("./interactive-chart-impl").then((m) => m.default),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
