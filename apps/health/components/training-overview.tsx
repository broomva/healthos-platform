"use client";

import cx from "classnames";
import { useState } from "react";

type TrainingData = {
  date?: string;
  metrics?: {
    trainingStatus?: { code: number; label: string; phrase?: string };
    trainingReadiness?: {
      score: number;
      level: string;
      factors?: Record<string, { percent: number; feedback: string }>;
    };
    acwr?: {
      ratio: number;
      status: string;
      acuteLoad: number;
      chronicLoad: number;
      acuteChronicRatio?: number;
    };
    hrv?: {
      weeklyAvg: number;
      lastNightAvg: number;
      lastNight5MinHigh?: number;
      baseline?: {
        lowUpper: number;
        balancedLow: number;
        balancedUpper: number;
      };
      status: string;
    };
    trainingLoad?: {
      aerobicLow: number;
      aerobicLowTarget?: [number, number];
      aerobicHigh: number;
      aerobicHighTarget?: [number, number];
      anaerobic: number;
      anaerobicTarget?: [number, number];
      feedback?: string;
    };
    altitude?: { current: number; acclimation: number; trend: string };
    lactateThreshold?: { ftp: number; powerToWeight: number; sport: string };
    profile?: {
      name: string;
      gender: string;
      weight: number;
      height: number;
      birthDate: string;
      device: string;
    };
  };
  analysis?: string;
  error?: string;
};

function FactorBar({
  label,
  percent,
  feedback,
}: {
  label: string;
  percent: number;
  feedback: string;
}) {
  const feedbackColor =
    {
      GOOD: "bg-emerald-500",
      MODERATE: "bg-amber-500",
      POOR: "bg-red-500",
    }[feedback] || "bg-gray-500";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs capitalize">
          {label.replace(/([A-Z])/g, " $1").trim()}
        </span>
        <span
          className={cx("font-medium text-xs", {
            "text-emerald-400": feedback === "GOOD",
            "text-amber-400": feedback === "MODERATE",
            "text-red-400": feedback === "POOR",
          })}
        >
          {percent}% — {feedback}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cx("h-full rounded-full", feedbackColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function LoadBar({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target?: [number, number];
  unit?: string;
}) {
  const inRange = target ? value >= target[0] && value <= target[1] : true;
  const tooHigh = target ? value > target[1] : false;
  const tooLow = target ? value < target[0] : false;

  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span className="text-white/60 text-xs">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={cx("font-semibold text-sm", {
            "text-emerald-400": inRange,
            "text-red-400": tooHigh,
            "text-amber-400": tooLow,
          })}
        >
          {value.toFixed(0)}
          {unit}
        </span>
        {target && (
          <span className="text-white/30 text-xs">
            ({target[0]}-{target[1]})
          </span>
        )}
        {tooHigh && <span className="text-red-400 text-xs">EXCESO</span>}
        {tooLow && <span className="text-amber-400 text-xs">DEFICIT</span>}
      </div>
    </div>
  );
}

export function TrainingOverview({
  trainingData,
}: {
  trainingData?: TrainingData;
}) {
  const [showFactors, setShowFactors] = useState(true);

  if (!trainingData || trainingData.error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-lg">
        <div className="text-sm text-white/60">
          {trainingData?.error || "No training data available"}
        </div>
      </div>
    );
  }

  const m = trainingData.metrics || {};

  return (
    <div className="relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 p-4 shadow-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-white">
              Training Status
            </div>
            <div className="text-white/60 text-xs">
              {trainingData.date || "Latest"}
            </div>
          </div>
          {m.trainingStatus && (
            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-sm text-white">
              {m.trainingStatus.label}
            </span>
          )}
        </div>

        {/* Readiness Score */}
        {m.trainingReadiness && (
          <div className="mb-3 rounded-xl bg-white/10 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-white/80 text-xs">
                Training Readiness
              </span>
              <span
                className={cx("font-bold text-lg", {
                  "text-red-400": m.trainingReadiness.score < 40,
                  "text-amber-400":
                    m.trainingReadiness.score >= 40 &&
                    m.trainingReadiness.score < 65,
                  "text-emerald-400": m.trainingReadiness.score >= 65,
                })}
              >
                {m.trainingReadiness.score}/100
              </span>
            </div>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={cx("h-full rounded-full", {
                  "bg-red-500": m.trainingReadiness.score < 40,
                  "bg-amber-500":
                    m.trainingReadiness.score >= 40 &&
                    m.trainingReadiness.score < 65,
                  "bg-emerald-500": m.trainingReadiness.score >= 65,
                })}
                style={{ width: `${m.trainingReadiness.score}%` }}
              />
            </div>

            {/* Readiness Factors */}
            {m.trainingReadiness.factors && (
              <>
                <button
                  className="mb-1 text-white/50 text-xs hover:text-white/70"
                  onClick={() => setShowFactors(!showFactors)}
                >
                  {showFactors ? "▾ Hide" : "▸ Show"} factors
                </button>
                {showFactors && (
                  <div className="mt-1 flex flex-col gap-2">
                    {Object.entries(m.trainingReadiness.factors).map(
                      ([key, val]) => (
                        <FactorBar
                          feedback={val.feedback}
                          key={key}
                          label={key}
                          percent={val.percent}
                        />
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ACWR */}
        {m.acwr && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs">ACWR</span>
              <span
                className={cx("font-bold text-lg", {
                  "text-red-400": m.acwr.ratio > 1.5,
                  "text-amber-400": m.acwr.ratio > 1.3,
                  "text-emerald-400":
                    m.acwr.ratio >= 0.8 && m.acwr.ratio <= 1.3,
                })}
              >
                {m.acwr.ratio.toFixed(1)}
              </span>
            </div>
            <div className="text-white/40 text-xs">
              Acute: {m.acwr.acuteLoad} / Chronic: {m.acwr.chronicLoad}
            </div>
            <span
              className={cx(
                "ml-auto rounded-full px-2 py-0.5 font-medium text-xs",
                {
                  "bg-emerald-500/20 text-emerald-300":
                    m.acwr.status === "OPTIMAL",
                  "bg-amber-500/20 text-amber-300": m.acwr.status === "HIGH",
                  "bg-red-500/20 text-red-300": m.acwr.status === "DANGER",
                }
              )}
            >
              {m.acwr.status}
            </span>
          </div>
        )}

        {/* Training Load */}
        {m.trainingLoad && (
          <div className="mb-3">
            <div className="mb-2 font-medium text-white/60 text-xs">
              Training Load Balance
            </div>
            <div className="flex flex-col gap-1.5">
              <LoadBar
                label="Aerobic Low"
                target={m.trainingLoad.aerobicLowTarget}
                value={m.trainingLoad.aerobicLow}
              />
              <LoadBar
                label="Aerobic High"
                target={m.trainingLoad.aerobicHighTarget}
                value={m.trainingLoad.aerobicHigh}
              />
              <LoadBar
                label="Anaerobic"
                target={m.trainingLoad.anaerobicTarget}
                value={m.trainingLoad.anaerobic}
              />
            </div>
            {m.trainingLoad.feedback && (
              <div className="mt-1.5 text-amber-400/70 text-xs">
                {m.trainingLoad.feedback.replace(/_/g, " ")}
              </div>
            )}
          </div>
        )}

        {/* HRV */}
        {m.hrv && (
          <div className="mb-3 rounded-xl bg-white/10 p-3">
            <div className="mb-1 font-medium text-white/80 text-xs">
              HRV Status
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-white/50 text-xs">Weekly Avg</span>
                <span className="font-semibold text-lg text-white">
                  {m.hrv.weeklyAvg}
                  <span className="text-white/50 text-xs"> ms</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/50 text-xs">Last Night</span>
                <span className="font-semibold text-lg text-white">
                  {m.hrv.lastNightAvg}
                  <span className="text-white/50 text-xs"> ms</span>
                </span>
              </div>
              {m.hrv.baseline && (
                <div className="flex flex-col">
                  <span className="text-white/50 text-xs">Baseline</span>
                  <span className="text-sm text-white/70">
                    {m.hrv.baseline.balancedLow}-{m.hrv.baseline.balancedUpper}
                    ms
                  </span>
                </div>
              )}
              <span
                className={cx(
                  "ml-auto rounded-full px-2 py-0.5 font-medium text-xs",
                  {
                    "bg-emerald-500/20 text-emerald-300":
                      m.hrv.status === "BALANCED",
                    "bg-amber-500/20 text-amber-300":
                      m.hrv.status === "UNBALANCED",
                    "bg-red-500/20 text-red-300": m.hrv.status === "LOW",
                  }
                )}
              >
                {m.hrv.status}
              </span>
            </div>
          </div>
        )}

        {/* Altitude */}
        {m.altitude && (
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs">Altitude</span>
              <span className="font-semibold text-sm text-white">
                {m.altitude.current}m
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-white/50 text-xs">Acclimation</span>
              <span className="font-semibold text-sm text-white">
                {m.altitude.acclimation}%
              </span>
            </div>
            <span className="ml-auto text-white/50 text-xs">
              {m.altitude.trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
