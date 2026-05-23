"use server";

import { createClient } from "@/lib/supabase/server";
import { encryptString } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function connectExchangeAction(formData: FormData) {
  const apiKey = formData.get("apiKey") as string;
  const apiSecret = formData.get("apiSecret") as string;

  if (!apiKey || !apiSecret) {
    return { error: "Ключі не можуть бути порожніми" };
  }

  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: "Помилка автентифікації. Будь ласка, увійдіть знову." };
  }

  try {
    const encryptedKey = encryptString(apiKey);
    const encryptedSecret = encryptString(apiSecret);

    const { error: dbError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        binance_api_key_encrypted: encryptedKey,
        binance_secret_key_encrypted: encryptedSecret,
        is_exchange_connected: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (dbError) throw dbError;

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err: unknown) {
    console.error("Помилка підключення біржі:", err);
    return { error: "Внутрішня помилка шифрування або збереження. " + getErrorMessage(err) };
  }
}