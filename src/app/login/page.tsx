import Image from "next/image";
import { Suspense } from "react";
import adapLogo from "../../../data/adap_logo.png";
import { LoginForm } from "./login-form";
export const metadata = { title: "Login" };
export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071426] px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#163b5e_0%,#0d1d35_20%,#071426_62%,#030b16_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03),transparent_35%,rgba(31,111,104,0.12))]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl place-items-center">
        <div className="grid w-full overflow-hidden rounded-[30px] border border-white/10 bg-white/96 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex items-center justify-center bg-[#0b172b] p-0 text-white">
            <div className="w-full bg-[#0b172b] p-0">
              <div className="relative w-full">
                <Image
                  src={adapLogo}
                  alt="ADAP — Application Data Analysis Platform"
                  width={1600}
                  height={500}
                  priority
                  className="h-auto w-full object-contain object-center"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#f5f7fa] p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Login
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Welcome back
              </h2>
              <Suspense>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
