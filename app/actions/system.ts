"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return String(error);
}

async function getSecureClient() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("Неавторизований доступ. Будь ласка, увійдіть у систему.");
  }
  
  return { supabase, userId: user.id };
}

export async function updateRecoveryBaselineAction(newBalance: number) {
  try {
    const { supabase, userId } = await getSecureClient();

    const { error } = await supabase
      .from("bot_settings")
      .update({ starting_balance: newBalance })
      .eq("user_id", userId);

    if (error) throw error;
    
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("DEBUG [updateRecoveryBaselineAction]:", err);
    return { error: getErrorMessage(err) };
  }
}

export async function updateWhitelistAction(newWhitelist: string[]) {
  try {
    const { supabase, userId } = await getSecureClient();

    const { error } = await supabase
      .from("bot_settings")
      .update({ current_dynamic_whitelist: newWhitelist })
      .eq("user_id", userId);

    if (error) throw error;
    
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("Помилка БД при оновленні whitelist:", err);
    return { error: getErrorMessage(err) };
  }
}

export async function toggleEngineAction(newState: boolean) {
  try {
    const { supabase, userId } = await getSecureClient();

    const { error } = await supabase
      .from("bot_settings")
      .update({ is_running: newState })
      .eq("user_id", userId);

    if (error) throw error;
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Помилка БД [Toggle Engine]:", err);
    return { error: getErrorMessage(err) };
  }
}

export async function triggerKillSwitchAction() {
  try {
    const { supabase, userId } = await getSecureClient();

    const { error } = await supabase
      .from("bot_settings")
      .update({ 
        kill_switch_active: true, 
        is_running: false 
      })
      .eq("user_id", userId);

    if (error) throw error;
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Помилка БД [Kill-Switch]:", err);
    return { error: getErrorMessage(err) };
  }
}