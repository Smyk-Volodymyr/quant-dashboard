import { LoginForm } from "./components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Auth | Quant Bot",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505] pointer-events-none" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>

      <div className="absolute bottom-6 text-center z-10">
        <p className="text-[10px] font-mono text-slate-600 tracking-widest uppercase">
          Secure Connection Established
        </p>
      </div>
    </main>
  );
}