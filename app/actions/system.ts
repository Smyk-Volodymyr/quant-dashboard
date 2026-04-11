"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Створюємо адмін-клієнт, який ігнорує RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateRecoveryBaselineAction(newBalance: number) {
  try {
    const { error } = await supabaseAdmin
      .from("system_state")
      .update({ starting_balance: newBalance })
      .eq("id", 1);

    if (error) throw error;
    
    // Кажемо Next.js оновити кеш сторінки
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Помилка БД:", err);
    return { error: err.message };
  }
}