"use client";

import React from "react";
import { useLocaleStore } from "@/lib/store/useLocaleStore";

export default function AnimatedFAQsHeader() {
  const { locale } = useLocaleStore();

  if (!locale) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl animate-fade-in-down"
      // animate-fade-in-down: custom animation for fade in and slide down
    >
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 animate-fade-in-scale"
        // animate-fade-in-scale: fade and slight scale down, delay-100
        style={{
          animationDelay: "100ms",
          animationFillMode: "both",
        }}
      />
      <div
        className="relative rounded-2xl border border-white/20 bg-white/80 p-8 shadow-xl  animate-fade-in-up"
        // animate-fade-in-up: fade and slide up, delay-200
        style={{
          animationDelay: "200ms",
          animationFillMode: "both",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent animate-fade-in-up"
              style={{
                animationDelay: "300ms",
                animationFillMode: "both",
              }}
            >
              {locale.faqs.pageHeader.title}
            </h1>
            <p
              className="text-slate-600 text-lg animate-fade-in-up"
              style={{
                animationDelay: "400ms",
                animationFillMode: "both",
              }}
            >
              {locale.faqs.pageHeader.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
