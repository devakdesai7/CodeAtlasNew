"use client";

import React, { useEffect, useRef } from "react";

export interface HalftoneFieldProps {
  className?: string;
  backgroundColor?: string;
  colorStops?: string[];
  dotSpacing?: number;
  maxDotRadius?: number;
  idleDriftSpeed?: number;
  hoverRadius?: number;
  hoverIntensity?: number;
  numIdleSources?: number;
  opacity?: number;
  maxAlpha?: number;
}

export const HalftoneField: React.FC<HalftoneFieldProps> = ({
  className,
  backgroundColor = "transparent",
  colorStops = [
    "#4f46e5", // Tactical indigo
    "#6366f1", // Periwinkle
    "#818cf8", // Soft lavender
    "#94a3b8", // Muted slate
    "#cbd5e1", // Subtle border slate
  ],
  dotSpacing = 18,
  maxDotRadius = 4.2,
  idleDriftSpeed = 0.7,
  hoverRadius = 180,
  hoverIntensity = 0.85,
  numIdleSources = 2,
  opacity = 0.55,
  maxAlpha = 0.32,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current?.parentElement || containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Pointer state
    const pointer = {
      x: -1000,
      y: -1000,
      targetIntensity: 0,
      currentIntensity: 0,
      springVal: 0,
      springVelocity: 0,
      active: false,
      lastTouchTime: 0,
    };

    // Pre-parse color stops for fast interpolation (RGB)
    const parsedColors = colorStops.map((hex) => {
      let c = hex.replace("#", "");
      if (c.length === 3) {
        c = c.split("").map((x) => x + x).join("");
      }
      const num = parseInt(c, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    });

    // Color lookup bucket array (10 buckets from scalar 0.0 to 1.0)
    const BUCKET_COUNT = 10;
    const colorBuckets: string[] = [];
    for (let i = 0; i <= BUCKET_COUNT; i++) {
      const t = i / BUCKET_COUNT; // 0 (min intensity) -> 1 (peak)
      // Reverse index so peak maps to first color stop
      const stopFraction = (1 - t) * (parsedColors.length - 1);
      const lowIndex = Math.min(Math.floor(stopFraction), parsedColors.length - 1);
      const highIndex = Math.min(lowIndex + 1, parsedColors.length - 1);
      const interFactor = stopFraction - lowIndex;

      const c1 = parsedColors[lowIndex];
      const c2 = parsedColors[highIndex];

      const r = Math.round(c1.r + (c2.r - c1.r) * interFactor);
      const g = Math.round(c1.g + (c2.g - c1.g) * interFactor);
      const b = Math.round(c1.b + (c2.b - c1.b) * interFactor);

      // Pre-rendered rgb string with luminous soft alpha for light command center
      const alphaVal = Math.min(1, 0.04 + t * (maxAlpha - 0.04));
      colorBuckets.push(`rgba(${r}, ${g}, ${b}, ${alphaVal.toFixed(3)})`);
    }

    // Resize handling with device-pixel-ratio
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(10, Math.floor(rect.width));
      height = Math.max(10, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    // Pointer events on parent container
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.targetIntensity = 1;
      pointer.active = true;
      pointer.lastTouchTime = performance.now();
    };

    const onPointerEnter = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.targetIntensity = 1;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.targetIntensity = 0;
      pointer.active = false;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerleave", onPointerLeave);

    // Animation Loop
    let lastTime = performance.now();
    const startTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      // Touch auto-fade after 1 second inactivity
      if (pointer.active && now - pointer.lastTouchTime > 1200 && ("ontouchstart" in window)) {
        pointer.targetIntensity = 0;
      }

      // Smooth pointer intensity transition (300ms fade)
      const fadeSpeed = dt / 0.35;
      if (pointer.currentIntensity < pointer.targetIntensity) {
        pointer.currentIntensity = Math.min(1, pointer.currentIntensity + fadeSpeed);
      } else if (pointer.currentIntensity > pointer.targetIntensity) {
        pointer.currentIntensity = Math.max(0, pointer.currentIntensity - fadeSpeed);
      }

      // Spring-like overshoot dynamics for hover
      if (prefersReducedMotion) {
        pointer.springVal = pointer.currentIntensity;
      } else {
        const springK = 120; // spring tension
        const damping = 14;  // friction
        const force = (pointer.currentIntensity - pointer.springVal) * springK;
        pointer.springVelocity += (force - damping * pointer.springVelocity) * dt;
        pointer.springVal += pointer.springVelocity * dt;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Light source calculations
      // Idle light source 1
      const idleSpeed = prefersReducedMotion ? 0.05 : idleDriftSpeed;
      const t1 = elapsed * 0.28 * idleSpeed;
      const l1x = width * (0.35 + 0.25 * Math.sin(t1 * 1.1) + 0.1 * Math.cos(t1 * 0.7));
      const l1y = height * (0.4 + 0.25 * Math.cos(t1 * 0.9) + 0.1 * Math.sin(t1 * 1.3));
      const l1Radius = Math.max(width, height) * 0.42;

      // Idle light source 2
      const t2 = elapsed * 0.22 * idleSpeed + 3.14;
      const l2x = width * (0.65 + 0.22 * Math.cos(t2 * 0.8) - 0.12 * Math.sin(t2 * 1.2));
      const l2y = height * (0.55 + 0.28 * Math.sin(t2 * 1.0) - 0.08 * Math.cos(t2 * 0.6));
      const l2Radius = Math.max(width, height) * 0.48;

      // Pointer light field
      const pIntensity = Math.max(0, pointer.springVal) * hoverIntensity;
      const pRadius = hoverRadius;

      // Render grid dots
      const spacing = dotSpacing;
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      const maxR = maxDotRadius;

      for (let c = 0; c <= cols; c++) {
        const x = c * spacing;
        for (let r = 0; r <= rows; r++) {
          const y = r * spacing;

          // Distance to idle source 1
          const d1 = Math.hypot(x - l1x, y - l1y);
          const f1 = Math.max(0, 1 - d1 / l1Radius);
          const s1 = f1 * f1 * (3 - 2 * f1) * 0.7;

          // Distance to idle source 2
          const d2 = Math.hypot(x - l2x, y - l2y);
          const f2 = Math.max(0, 1 - d2 / l2Radius);
          const s2 = f2 * f2 * (3 - 2 * f2) * 0.65;

          // Idle combined field
          const idleScalar = Math.min(1, s1 + s2 * 0.8);

          // Pointer field
          let pointerScalar = 0;
          if (pIntensity > 0.01) {
            const dp = Math.hypot(x - pointer.x, y - pointer.y);
            if (dp < pRadius) {
              const fp = 1 - dp / pRadius;
              pointerScalar = fp * fp * (3 - 2 * fp) * pIntensity;
            }
          }

          // Combine via MAX to prevent white blowout
          const scalar = Math.min(1, Math.max(idleScalar, pointerScalar));

          if (scalar > 0.08) {
            const radius = Math.max(0.7, scalar * maxR);
            const bucketIndex = Math.min(
              BUCKET_COUNT,
              Math.max(0, Math.floor(scalar * BUCKET_COUNT))
            );

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = colorBuckets[bucketIndex];
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [
    backgroundColor,
    colorStops,
    dotSpacing,
    maxDotRadius,
    idleDriftSpeed,
    hoverRadius,
    hoverIntensity,
    numIdleSources,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ opacity }}
      className={`absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-700 ${className || ""}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default HalftoneField;
