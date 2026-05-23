import { createClient } from "@/lib/supabase/server";
import { Settings, Send } from "lucide-react";
import { ExchangeConnectionForm } from "../../login/components/ExchangeConnectionForm";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let isConnected = false;
  let telegramChatId: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("user_profiles")
      .select("is_exchange_connected, telegram_chat_id")
      .eq("user_id", user.id)
      .single();

    isConnected = !!data?.is_exchange_connected;
    telegramChatId = data?.telegram_chat_id || null;
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "QuantCore_Bot";

  const telegramLink = user ? `https://t.me/${botUsername}?start=${user.id}` : "#";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
          <Settings className="mr-3 text-slate-400" size={24} />
          Workspace Settings
        </h1>
        <p className="text-sm text-slate-500 font-mono">
          Керування підключеннями, сповіщеннями та конфігурацією торгового ядра.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 items-start">
        {/* ЛІВА КОЛОНКА: Підключення біржі */}
        <div className="flex flex-col gap-6">
          <ExchangeConnectionForm isConnected={isConnected} />
        </div>

        {/* ПРАВА КОЛОНКА */}
        <div className="flex flex-col gap-6">

          {/* Модуль Telegram Сповіщень */}
          <article className="p-6 bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Send className="text-blue-400" size={20} />
              </div>
              <div>
                <h2 className="font-mono text-sm tracking-widest text-slate-200 uppercase">Telegram Alerts</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Сповіщення про відкриті/закриті угоди</p>
              </div>
            </div>

            <div className="mt-2 relative z-10">
              {telegramChatId ? (
                <div className="w-full py-3 bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Підключено (ID: {telegramChatId})
                </div>
              ) : (
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs uppercase tracking-widest rounded-xl text-center transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 group"
                >
                  <Send size={14} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  ПІДКЛЮЧИТИ ТЕЛЕГРАМ БОТА
                </a>
              )}
            </div>

            <p className="text-[10px] text-slate-600 font-mono text-center relative z-10">
              Бот буде надсилати сигнали виключно щодо вашого портфеля.
            </p>
          </article>

          {/* Модуль Білінгу (Заглушка) */}
          <article className="bg-[#050505]/60 backdrop-blur-xl border border-white/5 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-50">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Billing & Subscription</p>
            <p className="text-[10px] text-slate-600 font-mono">Модуль оплати (Success Fee) контролюється адміністратором</p>
          </article>

        </div>
      </section>
    </div>
  );
}