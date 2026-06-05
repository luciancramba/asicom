"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  const ok = await login(user, password);
  redirect(ok ? "/" : "/login?error=1");
}
