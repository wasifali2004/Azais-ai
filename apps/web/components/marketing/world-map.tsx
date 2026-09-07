"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DottedMap from "dotted-map";
import { useTheme } from "next-themes";

export type MapRoute = {
  start: { lat: number; lng: number; label?: string };
  end: { lat: number; lng: number; label?: string };
};

const ACCENT = "#e2793c";

function projectPoint(lat: number, lng: number) {
  const x = (lng + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);
  return { x, y };
}

function createCurvedPath(start: { x: number; y: number }, end: { x: number; y: number }) {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

export function WorldMap({ routes }: { routes: MapRoute[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const map = useMemo(() => new DottedMap({ height: 100, grid: "diagonal" }), []);
  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: isDark ? "#e2793c33" : "#c1631f33",
        shape: "circle",
        backgroundColor: "transparent",
      }),
    [map, isDark],
  );

  const staggerDelay = 0.3;
  const animationDuration = 2;
  const totalAnimationTime = routes.length * staggerDelay + animationDuration;
  const pauseTime = 2;
  const fullCycleDuration = totalAnimationTime + pauseTime;

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl border border-border-soft bg-surface md:aspect-[2.2/1]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt=""
        className="h-full w-full object-cover [mask-image:linear-gradient(to_bottom,transparent,white_12%,white_88%,transparent)]"
        draggable={false}
      />
      <svg viewBox="0 0 800 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="map-path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0" />
            <stop offset="6%" stopColor={ACCENT} stopOpacity="1" />
            <stop offset="94%" stopColor={ACCENT} stopOpacity="1" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {routes.map((route, i) => {
          const start = projectPoint(route.start.lat, route.start.lng);
          const end = projectPoint(route.end.lat, route.end.lng);
          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;

          return (
            <motion.path
              key={`path-${i}`}
              d={createCurvedPath(start, end)}
              fill="none"
              stroke="url(#map-path-gradient)"
              strokeWidth="1.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 0, 1, 1, 0] }}
              transition={{
                duration: fullCycleDuration,
                times: [0, startTime, endTime, resetTime, 1],
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          );
        })}

        {routes.flatMap((route, i) => {
          const points = [
            { point: route.start, label: route.start.label, key: `s-${i}` },
            { point: route.end, label: route.end.label, key: `e-${i}` },
          ];
          return points.map(({ point, label, key }) => {
            const { x, y } = projectPoint(point.lat, point.lng);
            return (
              <g key={key}>
                <circle cx={x} cy={y} r="3" fill={ACCENT} />
                <circle cx={x} cy={y} r="3" fill={ACCENT} opacity="0.5">
                  <animate attributeName="r" from="3" to="11" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.55" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                {label && (
                  <g
                    onPointerEnter={() => setHovered(label)}
                    onPointerLeave={() => setHovered((h) => (h === label ? null : h))}
                    className="cursor-pointer"
                  >
                    <circle cx={x} cy={y} r="9" fill="transparent" />
                    <foreignObject x={x - 50} y={y - 30} width="100" height="24" className="pointer-events-none">
                      <div className="flex h-full items-center justify-center">
                        <span className="rounded-md border border-border-soft bg-surface px-2 py-0.5 text-[10px] font-medium text-text-muted">
                          {label}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                )}
              </g>
            );
          });
        })}
      </svg>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-4 left-4 rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-xs font-medium text-text sm:hidden"
          >
            {hovered}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
