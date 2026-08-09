import Link from "next/link";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "./login-form";
export const metadata = { title: "Login" };
export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#071426] p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#12344c] text-teal-300">
            <ShieldCheck />
          </span>
          <span>
            <b className="block text-slate-900">ADAP</b>
            <small className="text-slate-500">
              Application Data Analysis Platform
            </small>
          </span>
        </Link>
        <p className="eyebrow">Login</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Welcome back, analyst
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use the prefilled demonstration credentials to access activity data.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
