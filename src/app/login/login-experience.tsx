"use client";

import Image from "next/image";
import { Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import adapLogo from "../../../data/adap_logo.png";
import { LoginForm } from "./login-form";

function BackgroundPattern({ reduceMotion }: { reduceMotion: boolean }) {
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
      <motion.div
        className="absolute -left-40 -top-48 size-[34rem] rounded-full bg-blue-200/25 blur-[120px]"
        animate={reduceMotion ? undefined : { x: [0, 55, 0], y: [0, 25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-56 right-[-8rem] size-[38rem] rounded-full bg-cyan-200/25 blur-[130px]"
        animate={reduceMotion ? undefined : { x: [0, -45, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function LoginExperience() {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#ffffff_0%,#f8fbff_52%,#f4fbfc_100%)] px-4 py-6 text-[#0B2A55] sm:px-6 sm:py-8 lg:px-8">
      <BackgroundPattern reduceMotion={reduceMotion} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1200px] items-center sm:min-h-[calc(100vh-4rem)]">
        <motion.section
          className="grid min-h-[650px] w-full overflow-hidden rounded-[32px] border border-white/90 bg-white/58 shadow-[0_30px_90px_rgba(15,42,82,0.13)] backdrop-blur-xl lg:grid-cols-2"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex items-center border-b border-slate-200/80 bg-[linear-gradient(155deg,rgba(255,255,255,0.94),rgba(244,250,255,0.82))] p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
            <div className="w-full text-center">
              <span className="mx-auto mb-8 block h-px w-12 bg-[#00B8C8]" />
              <motion.div
                className="mx-auto h-48 w-full max-w-[500px] overflow-hidden rounded-[24px] bg-white sm:h-52"
                animate={reduceMotion ? undefined : { y: [-3, 3, -3] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src={adapLogo}
                  alt="ADAP — Application Data Analysis Platform"
                  className="h-full w-full object-cover object-[50%_46%]"
                  priority
                />
              </motion.div>
              <span className="mx-auto mt-8 block h-px w-12 bg-slate-200" />
            </div>
          </div>

          <div className="flex items-center justify-center p-5 sm:p-9 lg:p-10">
            <motion.div
              className="relative isolate flex min-h-[460px] w-full max-w-[500px] flex-col justify-center overflow-hidden rounded-[32px] border border-white/95 bg-white/48 p-6 shadow-[0_2px_8px_rgba(15,42,82,0.05),0_28px_75px_rgba(15,42,82,0.16),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(148,163,184,0.16)] ring-1 ring-slate-200/35 backdrop-blur-[30px] backdrop-saturate-150 sm:aspect-square sm:min-h-0 sm:p-10"
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            >
              <div className="pointer-events-none absolute inset-[1px] -z-10 rounded-[31px] bg-[linear-gradient(145deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.3)_38%,rgba(219,247,250,0.22)_100%)]" />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              <div className="pointer-events-none absolute -right-20 -top-20 -z-10 size-56 rounded-full bg-cyan-100/35 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-20 -z-10 size-60 rounded-full bg-blue-100/30 blur-3xl" />

              <header className="relative z-10 mb-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00A6B6]">
                  Login
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#0B2A55] sm:text-4xl">
                  Welcome Back
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Please sign in to continue
                </p>
              </header>

              <div className="relative z-10">
                <Suspense
                  fallback={
                    <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
                  }
                >
                  <LoginForm />
                </Suspense>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
