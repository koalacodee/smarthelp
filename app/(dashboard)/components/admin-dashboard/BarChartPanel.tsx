"use client";

import React from "react";

type DayData = {
  day: string;
  tasks: number;
  tickets: number;
  avgResp: number; // minutes
};

export type BarChartPanelProps = {
  data: DayData[];
  className?: string;
  title?: string;
};

type SegmentKey = "tasks" | "tickets" | "avgResp";

const SEGMENTS: {
  key: SegmentKey;
  label: string;
  colorFrom: string;
  colorTo: string;
  textColor: string;
}[] = [
  {
    key: "tasks",
    label: "Tasks",
    colorFrom: "from-blue-400",
    colorTo: "to-sky-300",
    textColor: "text-blue-900",
  },
  {
    key: "tickets",
    label: "Tickets",
    colorFrom: "from-emerald-400",
    colorTo: "to-lime-300",
    textColor: "text-emerald-900",
  },
  {
    key: "avgResp",
    label: "Avg Resp",
    colorFrom: "from-fuchsia-400",
    colorTo: "to-pink-300",
    textColor: "text-fuchsia-900",
  },
];

export default function BarChartPanel({
  data,
  className,
  title = "Weekly Overview",
}: BarChartPanelProps) {
  return (
    <div
      className={[
        "w-full rounded-xl bg-white backdrop-blur",
        "shadow-sm ring-1 ring-black/5",
        "p-4 sm:p-6",
        className || "",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        <div className="hidden gap-4 md:flex">
          {SEGMENTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center gap-2 text-sm text-neutral-700"
            >
              <span
                className={[
                  "inline-block h-3 w-3 rounded",
                  "bg-gradient-to-br ring-2 ring-white/60",
                  s.colorFrom,
                  s.colorTo,
                ].join(" ")}
              />
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-8">
        {data.map((d) => {
          const total = d.tasks + d.tickets + d.avgResp / 10;
          return (
            <div key={d.day} className="flex flex-col items-center">
              <div className="relative h-64 w-24">
                <div className="absolute inset-0 rounded-lg bg-neutral-100 shadow-inner ring-1 ring-black/5" />
                <div className="absolute inset-1 flex items-end gap-1">
                  {SEGMENTS.map((s) => {
                    const value =
                      s.key === "avgResp" ? d[s.key] / 10 : d[s.key];
                    const heightPct = total > 0 ? (value / total) * 100 : 0;
                    return (
                      <Segment
                        key={s.key}
                        day={d.day}
                        label={s.label}
                        value={value}
                        heightPct={heightPct}
                        colorFrom={s.colorFrom}
                        colorTo={s.colorTo}
                        textColor={s.textColor}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 text-sm font-medium text-neutral-700">
                {d.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SegmentProps = {
  day: string;
  label: string;
  value: number;
  heightPct: number; // percentage of the bar height
  colorFrom: string;
  colorTo: string;
  textColor: string;
};

function Segment({
  day,
  label,
  value,
  heightPct,
  colorFrom,
  colorTo,
  textColor,
}: SegmentProps) {
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const heightPercent = Math.max(0, Math.min(100, heightPct));
  const finalHeight = `${heightPercent}%`;
  const visibleHeight = mounted
    ? `${Math.max(heightPercent, value > 0 ? 6 : 0)}%`
    : "0%"; // ensure visibility

  return (
    <div
      className="relative flex-1 h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Bar */}
      <div
        className={[
          "absolute bottom-0 left-0 right-0 rounded-sm bg-gradient-to-br",
          colorFrom,
          colorTo,
          "ring-1 ring-white/70",
          "shadow-sm transition-[height,transform] duration-700 ease-out",
          hovered ? "shadow-md scale-[1.01]" : "",
        ].join(" ")}
        style={{ height: visibleHeight }}
      />

      {/* Tooltip */}
      {hovered && (
        <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-800 px-2 py-1 text-xs text-white shadow-lg">
          <span className="font-semibold">{day}</span>: {label} — {value}
        </div>
      )}
    </div>
  );
}
