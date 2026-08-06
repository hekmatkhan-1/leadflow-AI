"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSettingsAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const chatbot_greeting = formData.get("chatbot_greeting") as string;
  const welcome_message = formData.get("welcome_message") as string;
  const business_hours = formData.get("business_hours") as string;
  const brand_color = formData.get("brand_color") as string;
  const contact_email = formData.get("contact_email") as string;

  const settings = {
    chatbot_greeting,
    welcome_message,
    business_hours,
    brand_color,
    contact_email,
  };

  const { error } = await supabase
    .from("businesses")
    .update({ settings, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    console.error("Save settings error:", error);
    return { error: "Failed to save settings. Please try again." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

