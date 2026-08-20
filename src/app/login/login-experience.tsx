"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import platformFrame from "../../../data/ChatGPT Image Aug 20, 2026, 12_09_18 PM (1).png";
import rideSharingFrame from "../../../data/ChatGPT Image Aug 20, 2026, 12_09_18 PM (2).png";
import ecommerceFrame from "../../../data/ChatGPT Image Aug 20, 2026, 12_09_19 PM (3).png";
import courierFrame from "../../../data/ChatGPT Image Aug 20, 2026, 12_09_19 PM (4).png";
import overviewFrame from "../../../data/ChatGPT Image Aug 20, 2026, 12_09_19 PM (5).png";
import { LoginForm } from "./login-form";

const motionFrames = [
  platformFrame,
  rideSharingFrame,
  ecommerceFrame,
  courierFrame,
  overviewFrame,
];

function BackgroundPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full text-[#0b2a55] opacity-[0.085]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="adap-dots"
            width="42"
            height="42"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#adap-dots)" />
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M-80 670C180 520 350 760 610 610S1020 420 1520 590" />
          <path d="M-80 715C190 565 370 805 640 655S1060 470 1520 635" />
          <path d="M120 0V145H280V245H440" />
          <path d="M1320 900V730H1180V625H1040" />
          <path d="M0 330H180L245 395H440L505 330H680" />
          <path d="M760 170H930L995 235H1180L1245 170H1440" />
          <path d="M760 760H910L975 695H1160L1230 765H1440" />
          <rect x="66" y="90" width="300" height="180" rx="18" />
          <rect x="1080" y="560" width="280" height="180" rx="18" />
        </g>
        <g fill="currentColor">
          <circle cx="180" cy="330" r="3.5" />
          <circle cx="440" cy="395" r="3.5" />
          <circle cx="930" cy="170" r="3.5" />
          <circle cx="1180" cy="235" r="3.5" />
          <circle cx="910" cy="760" r="3.5" />
          <circle cx="1160" cy="695" r="3.5" />
        </g>
      </svg>
    </div>
  );
}

export function LoginExperience() {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveFrame((frame) => (frame + 1) % motionFrames.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef5f8] px-3 py-3 text-[#0B2A55] sm:px-6 sm:py-6 lg:px-8">
      <BackgroundPattern />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1240px] items-center sm:min-h-[calc(100vh-3rem)]">
        <motion.section
          className="grid w-full overflow-hidden rounded-lg border border-white bg-white shadow-[0_28px_80px_rgba(15,42,82,0.16)] lg:min-h-[690px] lg:grid-cols-[1.08fr_0.92fr]"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex min-h-[350px] items-center overflow-hidden border-b border-slate-200 bg-[#e8f4f7] px-5 py-16 sm:min-h-[470px] sm:px-10 lg:min-h-0 lg:border-b-0 lg:border-r lg:px-12">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(11,42,85,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(11,42,85,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <motion.div
              className="relative mx-auto aspect-[3/2] w-full max-w-[570px] overflow-hidden bg-white shadow-[0_22px_55px_rgba(15,42,82,0.16)]"
              animate={reduceMotion ? undefined : { y: [-4, 4, -4] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="absolute inset-0"
                role="img"
                aria-label="ADAP Application Data Analysis Platform"
              >
                {motionFrames.map((frame, index) => (
                  <motion.div
                    key={frame.src}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: index === activeFrame ? 1 : 0,
                      scale:
                        !reduceMotion && index === activeFrame ? 1.025 : 1,
                    }}
                    transition={{
                      opacity: { duration: reduceMotion ? 0 : 0.75 },
                      scale: { duration: 2.4, ease: "linear" },
                    }}
                    aria-hidden="true"
                  >
                    <Image
                      src={frame}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 570px, 92vw"
                      className="object-cover"
                      priority={index < 2}
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="pointer-events-none absolute inset-y-0 z-10 w-px bg-cyan-400 shadow-[0_0_18px_4px_rgba(34,211,238,0.24)]"
                animate={reduceMotion ? { left: "50%" } : { left: ["7%", "93%"] }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />

              <span className="pointer-events-none absolute left-3 top-3 z-20 size-7 border-l-2 border-t-2 border-[#00A6B6]" />
              <span className="pointer-events-none absolute right-3 top-3 z-20 size-7 border-r-2 border-t-2 border-[#00A6B6]" />
              <span className="pointer-events-none absolute bottom-3 left-3 z-20 size-7 border-b-2 border-l-2 border-[#00A6B6]" />
              <span className="pointer-events-none absolute bottom-3 right-3 z-20 size-7 border-b-2 border-r-2 border-[#00A6B6]" />
            </motion.div>

            <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center gap-4 sm:bottom-8 sm:left-10 sm:right-10">
              <span className="w-7 font-mono text-xs font-bold text-[#0B2A55]">
                {String(activeFrame + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-1 items-center gap-2">
                {motionFrames.map((frame, index) => (
                  <button
                    key={frame.src}
                    type="button"
                    onClick={() => setActiveFrame(index)}
                    className="relative h-5 flex-1 cursor-pointer"
                    aria-label={`Show motion frame ${index + 1}`}
                    title={`Frame ${index + 1}`}
                  >
                    <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-slate-300" />
                    <motion.span
                      className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#00A6B6]"
                      animate={{ scaleX: index === activeFrame ? 1 : 0 }}
                      transition={{ duration: 0.35 }}
                      style={{ transformOrigin: "left" }}
                    />
                  </button>
                ))}
              </div>
              <span className="font-mono text-[10px] text-slate-500">LIVE</span>
            </div>
          </div>

          <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-14">
            <motion.div
              className="w-full max-w-[450px]"
              initial={reduceMotion ? false : { opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <header className="mb-8 border-l-2 border-[#00A6B6] pl-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00A6B6]">
                  Secure login
                </p>
                <h1 className="mt-3 text-3xl font-bold text-[#0B2A55] sm:text-4xl">
                  Welcome
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Please sign in to continue
                </p>
              </header>

              <Suspense
                fallback={<div className="h-64 animate-pulse bg-slate-100" />}
              >
                <LoginForm />
              </Suspense>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
