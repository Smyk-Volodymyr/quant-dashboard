"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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
    
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Помилка БД:", err);
    return { error: err.message };
  }
}

export async function updateWhitelistAction(newWhitelist: string[]) {
  try {
    const { error } = await supabaseAdmin
      .from("system_state")
      .update({ current_dynamic_whitelist: newWhitelist })
      .eq("id", 1);

    if (error) throw error;
    
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Помилка БД при оновленні whitelist:", err);
    return { error: err.message };
  }
}

export async function toggleEngineAction(newState: boolean) {
  try {
    const { error } = await supabaseAdmin
      .from("system_state")
      .update({ is_running: newState })
      .eq("id", 1);

    if (error) throw error;
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Помилка БД [Toggle Engine]:", err);
    return { error: err.message };
  }
}

export async function triggerKillSwitchAction() {
  try {
    const { error } = await supabaseAdmin
      .from("system_state")
      .update({ 
        kill_switch_active: true, 
        is_running: false 
      })
      .eq("id", 1);

    if (error) throw error;
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Помилка БД [Kill-Switch]:", err);
    return { error: err.message };
  }
}