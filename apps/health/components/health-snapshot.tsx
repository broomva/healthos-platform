"use client";

import cx from "classnames";
import { useState } from "react";

type MetricTrend =
  | "improving"
  | "stable"
  | "declining"
  | "low"
  | "critically_low";

interface HealthMetrics {
  sleepScore?: { avg: number; min?: number; max?: number; trend?: MetricTrend };
  duration?: { avg: number; unit?: string; trend?: MetricTrend };
  deepSleep?: { avg: number; unit?: string; trend?: MetricTrend };
  remSleep?: { avg: number; unit?: string; trend?: MetricTrend };
  hrv?: {
    avg: number;
    baseline?: [number, number];
    status?: string;
    trend?: MetricTrend;
  };
  rhr?: { avg: number; unit?: string; trend?: MetricTrend };
  spo2?: { avg: number; unit?: string; trend?: MetricTrend };
  stress?: { avg: number; unit?: string; trend?: MetricTrend };
  bodyBattery?: { morningAvg: number; trend?: MetricTrend };
  steps?: { avg: number; goal?: number; trend?: MetricTrend };
  trainingStatus?: { code: number; label: string; phrase?: string };
  trainingReadiness?: { score: number; level: string };
  acwr?: {
    ratio: number;
    status: string;
    acuteLoad?: number;
    chronicLoad?: number;
  };
  trainingLoad?: {
    aerobicLow?: number;
    aerobicHigh?: number;
    anaerobic?: number;
    feedback?: string;
  };
}

interface Alert {
  type: "critical" | "warning" | "info";
  metric?: string;
  message: string;
}

type HealthSnapshotData = {
  week?: string;
  dateRange?: string;
  metrics?: HealthMetrics;
  alerts?: Alert[];
  tags?: string[];
  analysis?: string;
  error?: string;
};

function getTrendIcon(trend?: MetricTrend) {
  if (!trend) return null;
  switch (trend) {
    case "improving":
      return "↑";
    case "stable":
      return "→";
    case "declining":
      return "↓";
    case "low":
      return "↓";
    case "critically_low":
      return "⚠";
    default:
      return null;
  }
}

function getTrendColor(trend?: MetricTrend) {
  if (!trend) return "text-gray-400";
  switch (trend) {
    case "improving":
      return "text-emerald-400";
    case "stable":
      return "text-gray-400";
    case "declining":
      return "text-red-400";
    case "low":
      return "text-amber-400";
    case "critically_low":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

function getAlertStyle(type: string) {
  switch (type) {
    case "critical":
      return "bg-red-500/20 border-red-500/40 text-red-300";
    case "warning":
      return "bg-amber-500/20 border-amber-500/40 text-amber-300";
    case "info":
      return "bg-blue-500/20 border-blue-500/40 text-blue-300";
    default:
      return "bg-gray-500/20 border-gray-500/40 text-gray-300";
  }
}

function getAlertIcon(type: string) {
  switch (type) {
    case "critical":
      return "●";
    case "warning":
      return "▲";
    case "info":
      return "ℹ";
    default:
      return "○";
  }
}

function MetricCard({
  label,
  value,
  unit,
  trend,
  subtitle,
}: {
  label: string;
  value: number | string | null | undefined;
  unit?: string;
  trend?: MetricTrend;
  subtitle?: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-white/5 px-3 py-2">
      <div className="font-medium text-white/60 text-xs">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="font-semibold text-lg text-white">
          {typeof value === "number"
            ? Number.isInteger(value)
              ? value
              : value.toFixed(1)
            : value}
        </span>
        {unit && <span className="text-white/50 text-xs">{unit}</span>}
        {trend && (
          <span className={cx("font-bold text-xs", getTrendColor(trend))}>
            {getTrendIcon(trend)}
          </span>
        )}
      </div>
      {subtitle && <div className="text-white/40 text-xs">{subtitle}</div>}
    </div>
  );
}

export function HealthSnapshot({
  healthData,
}: {
  healthData?: HealthSnapshotData;
}) {
  const [showAlerts, setShowAlerts] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  if (!healthData || healthData.error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-lg">
        <div className="text-sm text-white/60">
          {healthData?.error || "No health data available"}
        </div>
      </div>
    );
  }

  const m = healthData.metrics || {};
  const alerts = healthData.alerts || [];
  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;

  return (
    <div className="relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 p-4 shadow-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-white">
              Health Dashboard
            </div>
            <div className="text-white/60 text-xs">
              {healthData.dateRange || healthData.week || "Weekly Snapshot"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="rounded-full bg-red-500/30 px-2 py-0.5 font-medium text-red-300 text-xs">
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded-full bg-amber-500/30 px-2 py-0.5 font-medium text-amber-300 text-xs">
                {warningCount} warning
              </span>
            )}
          </div>
        </div>

        {/* Training Status Bar */}
        {(m.trainingStatus || m.trainingReadiness) && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
            {m.trainingStatus && (
              <div className="flex flex-col">
                <span className="text-white/50 text-xs">Status</span>
                <span className="font-semibold text-sm text-white">
                  {m.trainingStatus.label}
                </span>
              </div>
            )}
            {m.trainingReadiness && (
              <div className="flex flex-col">
                <span className="text-white/50 text-xs">Readiness</span>
                <span
                  className={cx("font-semibold text-sm", {
                    "text-red-400": m.trainingReadiness.score < 40,
                    "text-amber-400":
                      m.trainingReadiness.score >= 40 &&
                      m.trainingReadiness.score < 65,
                    "text-emerald-400": m.trainingReadiness.score >= 65,
                  })}
                >
                  {m.trainingReadiness.score}/100 ({m.trainingReadiness.level})
                </span>
              </div>
            )}
            {m.acwr && (
              <div className="flex flex-col">
                <span className="text-white/50 text-xs">ACWR</span>
                <span
                  className={cx("font-semibold text-sm", {
                    "text-red-400": m.acwr.ratio > 1.5,
                    "text-amber-400": m.acwr.ratio > 1.3,
                    "text-emerald-400":
                      m.acwr.ratio >= 0.8 && m.acwr.ratio <= 1.3,
                    "text-blue-400": m.acwr.ratio < 0.8,
                  })}
                >
                  {m.acwr.ratio.toFixed(1)} ({m.acwr.status})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          <MetricCard
            label="Sleep Score"
            trend={m.sleepScore?.trend}
            unit="/100"
            value={m.sleepScore?.avg}
          />
          <MetricCard
            label="Duration"
            trend={m.duration?.trend}
            unit="h"
            value={m.duration?.avg}
          />
          <MetricCard
            label="Deep Sleep"
            subtitle={
              m.deepSleep?.avg && m.deepSleep.avg < 16
                ? "Below optimal"
                : undefined
            }
            trend={m.deepSleep?.trend}
            unit="%"
            value={m.deepSleep?.avg}
          />
          <MetricCard
            label="REM Sleep"
            subtitle={
              m.remSleep?.avg && m.remSleep.avg < 21
                ? "Below optimal"
                : undefined
            }
            trend={m.remSleep?.trend}
            unit="%"
            value={m.remSleep?.avg}
          />
          <MetricCard
            label="HRV"
            subtitle={
              m.hrv?.status
                ? `${m.hrv.status}${m.hrv.baseline ? ` (${m.hrv.baseline[0]}-${m.hrv.baseline[1]})` : ""}`
                : undefined
            }
            trend={m.hrv?.trend}
            unit="ms"
            value={m.hrv?.avg}
          />
          <MetricCard
            label="RHR"
            trend={m.rhr?.trend}
            unit="bpm"
            value={m.rhr?.avg}
          />
          <MetricCard
            label="SpO2"
            trend={m.spo2?.trend}
            unit="%"
            value={m.spo2?.avg}
          />
          <MetricCard
            label="Stress"
            trend={m.stress?.trend}
            unit=""
            value={m.stress?.avg}
          />
          <MetricCard
            label="Body Battery"
            trend={m.bodyBattery?.trend}
            unit="/100"
            value={m.bodyBattery?.morningAvg}
          />
          <MetricCard
            label="Steps"
            trend={m.steps?.trend}
            unit={m.steps?.goal ? `/${m.steps.goal}` : ""}
            value={m.steps?.avg}
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-2">
            <button
              className="mb-2 font-medium text-white/60 text-xs hover:text-white/80"
              onClick={() => setShowAlerts(!showAlerts)}
            >
              {showAlerts ? "▾" : "▸"} Alerts ({alerts.length})
            </button>
            {showAlerts && (
              <div className="flex flex-col gap-1.5">
                {alerts.map((alert, i) => (
                  <div
                    className={cx(
                      "rounded-lg border px-3 py-1.5 text-xs",
                      getAlertStyle(alert.type)
                    )}
                    key={i}
                  >
                    <span className="mr-1.5">{getAlertIcon(alert.type)}</span>
                    {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {healthData.tags && healthData.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {healthData.tags.map((tag) => (
              <span
                className="rounded-full bg-white/10 px-2 py-0.5 text-white/50 text-xs"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Raw JSON toggle */}
        <div className="mt-3 border-white/10 border-t pt-2">
          <button
            className="text-white/40 text-xs hover:text-white/60"
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? "▾ Hide" : "▸ Show"} raw data
          </button>
          {showRaw && (
            <pre className="mt-2 max-h-[300px] overflow-auto rounded-lg bg-black/40 p-3 font-mono text-green-400/80 text-xs">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
