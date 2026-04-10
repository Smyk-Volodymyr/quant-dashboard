"use server";

import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

// Схема валідації
const loginSchema = z.object({
  username: z.string().min(1, "Введіть логін"),
  password: z.string().min(1, "Введіть пароль"),
});

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Некоректні дані" };
  }

  const { username, password } = parsed.data;

  // Безпечна перевірка з .env
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    await createSession(username);
    redirect("/"); // Редирект на головну (Dashboard) після успіху
  }

  return { error: "Невірний логін або пароль" };
}
