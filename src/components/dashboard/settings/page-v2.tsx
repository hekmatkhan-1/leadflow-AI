import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("settings")
    .eq("id", user.id)
    .maybeSingle();

  const savedSettings = (business?.settings ?? {}) as Record<string, string>;

  const initialSettings = {
    chatbot_greeting:
      savedSettings.chatbot_greeting ?? "Hi there! 👋 How can I help you today?",
    welcome_message:
      savedSettings.welcome_message ??
      "Welcome to our website! I'm here to help you find what you're looking for.",
    brand_color: savedSettings.brand_color ?? "#3b82f6",
    business_hours: savedSettings.business_hours ?? "9:00 AM - 5:00 PM EST",
    contact_email: savedSettings.contact_email ?? user.email ?? "",
  };

  const embedSnippet = `<script>
  (function() {
    var s = document.createElement("script");
    s.src = "${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/embed";
    s.async = true;
    s.setAttribute("data-business-id", "${user.id}");
    document.head.appendChild(s);
  })();
</script>`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your chatbot, branding, and integration settings.
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings} embedSnippet={embedSnippet} />
    </div>
  );
}
