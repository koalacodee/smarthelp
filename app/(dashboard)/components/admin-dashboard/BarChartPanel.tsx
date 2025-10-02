"use client";

import React from "react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
      className={[
        "w-full rounded-xl bg-white backdrop-blur",
        "shadow-sm ring-1 ring-black/5",
        "p-4 sm:p-6",
        className || "",
      ].join(" ")}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="mb-4 flex items-center justify-between"
      >
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        <div className="hidden gap-4 md:flex">
          {SEGMENTS.map((s, index) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
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
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-x-4 gap-y-8">
        {data.map((d, dayIndex) => {
          const total = d.tasks + d.tickets + d.avgResp / 10;
          return (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + dayIndex * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative h-64 w-24">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.4 + dayIndex * 0.1 }}
                  className="absolute inset-0 rounded-lg bg-neutral-100 shadow-inner ring-1 ring-black/5"
                />
                <div className="absolute inset-1 flex items-end gap-1">
                  {SEGMENTS.map((s, segmentIndex) => {
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
                        delay={1.6 + dayIndex * 0.1 + segmentIndex * 0.05}
                      />
                    );
                  })}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.8 + dayIndex * 0.1 }}
                className="mt-2 text-sm font-medium text-neutral-700"
              >
                {d.day}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
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
  delay?: number;
};

function Segment({
  day,
  label,
  value,
  heightPct,
  colorFrom,
  colorTo,
  textColor,
  delay = 0,
}: SegmentProps) {
  const [hovered, setHovered] = React.useState(false);

  const heightPercent = Math.max(0, Math.min(100, heightPct));
  const visibleHeight = `${Math.max(heightPercent, value > 0 ? 6 : 0)}%`;

  return (
    <motion.div
      initial={{ height: "0%" }}
      animate={{ height: visibleHeight }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className="relative flex-1 h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.2 }}
        whileHover={{
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        className={[
          "absolute bottom-0 left-0 right-0 rounded-sm bg-gradient-to-br",
          colorFrom,
          colorTo,
          "ring-1 ring-white/70",
          "shadow-sm",
        ].join(" ")}
        style={{ height: "100%" }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 5, scale: 0.8 }}
        animate={
          hovered
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 5, scale: 0.8 }
        }
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-800 px-2 py-1 text-xs text-white shadow-lg"
      >
        <span className="font-semibold">{day}</span>: {label} — {value}
      </motion.div>
    </motion.div>
  );
}
