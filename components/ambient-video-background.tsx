"use client";

import React, { useEffect, useRef, useState } from "react";

export interface AmbientVideoBackgroundProps {
  src: string;
  poster?: string;
  opacity?: number;
  overlayStrength?: number; // 0 to 1
  blur?: string; // e.g. "blur-[1px]"
  playbackSpeed?: number;
  className?: string;
  disableOnMobile?: boolean;
  theme?: "light" | "dark";
}

export const AmbientVideoBackground: React.FC<AmbientVideoBackgroundProps> = ({
  src,
  poster,
  opacity = 0.38,
  overlayStrength = 0.82,
  blur = "blur-[1.5px]",
  playbackSpeed = 0.75, // Restrained, calm ambient motion
  className = "",
  disableOnMobile = true,
  theme = "light",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check prefers-reduced-motion & mobile screen width
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotion = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotion);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      motionQuery.removeEventListener("change", handleMotion);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // IntersectionObserver to pause off-screen video
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(() => {});
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Configure video playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const shouldPlayVideo = !prefersReducedMotion && (!isMobile || !disableOnMobile);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 z-0 pointer-events-none overflow-hidden select-none ${className}`}
    >
      {/* Video or Static Poster */}
      {shouldPlayVideo ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className={`h-full w-full object-cover saturate-[0.9] contrast-[1.02] transition-opacity duration-1000 ${blur}`}
          style={{ opacity }}
        />
      ) : (
        poster && (
          <div
            className={`h-full w-full bg-cover bg-center saturate-[0.8] ${blur}`}
            style={{
              backgroundImage: `url(${poster})`,
              opacity: opacity * 0.75,
            }}
          />
        )
      )}

      {/* Light Theme Gradient Overlays */}
      {theme === "light" ? (
        <>
          {/* Soft White/Slate radial frost */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: `radial-gradient(ellipse 95% 85% at 50% 20%, rgba(255, 255, 255, ${
                overlayStrength * 0.76
              }) 0%, rgba(248, 250, 252, ${overlayStrength * 0.94}) 100%)`,
            }}
          />
          {/* Edge fade */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-slate-50"
            style={{ opacity: overlayStrength }}
          />
        </>
      ) : (
        <>
          {/* Multi-layered Dark Navy Gradient Overlays */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: `radial-gradient(ellipse 90% 80% at 50% 20%, rgba(12, 16, 32, ${
                overlayStrength * 0.4
              }) 0%, #05050c ${Math.round(overlayStrength * 100)}%)`,
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#05050c]/60 via-transparent to-[#05050c]"
            style={{ opacity: overlayStrength }}
          />
        </>
      )}
    </div>
  );
};

export default AmbientVideoBackground;

