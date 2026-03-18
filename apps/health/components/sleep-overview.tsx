"use client";

import cx from "classnames";
import { useState } from "react";

type SleepAnalysisData = {
  periodCovered?: string;
  dataPoints?: number;
  summary?: {
    overallScore: number;
    overallTrend: string;
    primaryConcerns: string[];
    keyMetrics: {
      avgSleepScore: number;
      avgDuration: number;
      avgDeepPct: number;
      avgRemPct: number;
      avgHrv: number;
      avgRhr: number;
      avgSpo2: number;
    };
    monthlyTrend?: Record<
      string,
      {
        score: number;
        deepPct: number;
        remPct: number;
        hrv: number;
        rhr: number;
      }
    >;
  };
  analysis?: string;
  error?: string;
};

function SleepBar({
  label,
  value,
  optimal,
  color,
}: {
  label: string;
  value: number;
  optimal: string;
  color: string;
}) {
  const width = Math.min(value, 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs">{label}</span>
        <span className="font-semibold text-white text-xs">
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cx("h-full rounded-full", color)}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-white/30 text-xs">Optimal: {optimal}</span>
    </div>
  );
}

export function SleepOverview({
  sleepData,
}: {
  sleepData?: SleepAnalysisData;
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (!sleepData || sleepData.error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-lg">
        <div className="text-sm text-white/60">
          {sleepData?.error || "No sleep data available"}
        </div>
      </div>
    );
  }

  const s = sleepData.summary;
  const km = s?.keyMetrics;

  return (
    <div className="relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-4 shadow-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-white">
              Sleep Analysis
            </div>
            <div className="text-white/60 text-xs">
              {sleepData.periodCovered} ({sleepData.dataPoints} nights)
            </div>
          </div>
          {s && (
            <div
              className={cx("rounded-full px-3 py-1 font-bold text-sm", {
                "bg-red-500/30 text-red-300": s.overallScore < 60,
                "bg-amber-500/30 text-amber-300":
                  s.overallScore >= 60 && s.overallScore < 75,
                "bg-emerald-500/30 text-emerald-300": s.overallScore >= 75,
              })}
            >
              {s.overallScore}/100
            </div>
          )}
        </div>

        {/* Key Metrics */}
        {km && (
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col rounded-lg bg-white/5 px-3 py-2">
              <span className="text-white/50 text-xs">Avg Duration</span>
              <span className="font-semibold text-lg text-white">
                {km.avgDuration.toFixed(1)}
                <span className="text-white/50 text-xs"> h</span>
              </span>
            </div>
            <div className="flex flex-col rounded-lg bg-white/5 px-3 py-2">
              <span className="text-white/50 text-xs">HRV</span>
              <span className="font-semibold text-lg text-white">
                {km.avgHrv}
                <span className="text-white/50 text-xs"> ms</span>
              </span>
            </div>
            <div className="flex flex-col rounded-lg bg-white/5 px-3 py-2">
              <span className="text-white/50 text-xs">RHR</span>
              <span className="font-semibold text-lg text-white">
                {km.avgRhr.toFixed(1)}
                <span className="text-white/50 text-xs"> bpm</span>
              </span>
            </div>
            <div className="flex flex-col rounded-lg bg-white/5 px-3 py-2">
              <span className="text-white/50 text-xs">SpO2</span>
              <span className="font-semibold text-lg text-white">
                {km.avgSpo2.toFixed(1)}
                <span className="text-white/50 text-xs"> %</span>
              </span>
            </div>
          </div>
        )}

        {/* Sleep Architecture */}
        {km && (
          <div className="mb-3 rounded-xl bg-white/10 p-3">
            <div className="mb-2 font-medium text-white/80 text-xs">
              Sleep Architecture
            </div>
            <div className="flex flex-col gap-3">
              <SleepBar
                color="bg-indigo-500"
                label="Deep Sleep"
                optimal="16-33%"
                value={km.avgDeepPct}
              />
              <SleepBar
                color="bg-purple-500"
                label="REM Sleep"
                optimal="21-31%"
                value={km.avgRemPct}
              />
              <SleepBar
                color="bg-sky-400"
                label="Light Sleep"
                optimal="30-64%"
                value={100 - km.avgDeepPct - km.avgRemPct}
              />
            </div>
          </div>
        )}

        {/* Concerns */}
        {s?.primaryConcerns && s.primaryConcerns.length > 0 && (
          <div className="mb-2">
            <div className="mb-1 font-medium text-white/60 text-xs">
              Key Concerns
            </div>
            <div className="flex flex-col gap-1">
              {s.primaryConcerns.map((concern, i) => (
                <div
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-300 text-xs"
                  key={i}
                >
                  {concern}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {s?.monthlyTrend && (
          <div className="mt-2">
            <button
              className="text-white/50 text-xs hover:text-white/70"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "▾ Hide" : "▸ Show"} monthly trends
            </button>
            {showDetails && (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-white/70 text-xs">
                  <thead>
                    <tr className="border-white/10 border-b">
                      <th className="py-1 text-left font-medium">Month</th>
                      <th className="py-1 text-right font-medium">Score</th>
                      <th className="py-1 text-right font-medium">Deep%</th>
                      <th className="py-1 text-right font-medium">REM%</th>
                      <th className="py-1 text-right font-medium">HRV</th>
                      <th className="py-1 text-right font-medium">RHR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(s.monthlyTrend).map(([month, data]) => (
                      <tr className="border-white/5 border-b" key={month}>
                        <td className="py-1 capitalize">{month}</td>
                        <td className="py-1 text-right">{data.score}</td>
                        <td className="py-1 text-right">{data.deepPct}%</td>
                        <td className="py-1 text-right">{data.remPct}%</td>
                        <td className="py-1 text-right">{data.hrv}ms</td>
                        <td className="py-1 text-right">{data.rhr}bpm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
