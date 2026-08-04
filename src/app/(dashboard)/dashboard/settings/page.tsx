import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Settings2,
  Bot,
  Palette,
  Bell,
  Code,
  Globe,
  Clock,
  Mail,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const defaultSettings = {
    chatbot_greeting: "Hi there! 👋 How can I help you today?",
    welcome_message: "Welcome to our website! I'm here to help you find what you're looking for.",
    brand_color: "#3b82f6",
    business_hours: "9:00 AM - 5:00 PM EST",
    contact_email: user.email ?? "",
    embed_snippet: `<script>
  (function() {
    var s = document.createElement("script");
    s.src = "${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/embed";
    s.async = true;
    s.setAttribute("data-business-id", "${user.id}");
    document.head.appendChild(s);
  })();
</script>`,
  };

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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chatbot Configuration
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Greeting message"
            defaultValue={defaultSettings.chatbot_greeting}
            placeholder="Enter greeting message..."
          />
          <Input
            label="Welcome message"
            defaultValue={defaultSettings.welcome_message}
            placeholder="Enter welcome message..."
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Business hours
            </label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <Input
                defaultValue={defaultSettings.business_hours}
                placeholder="9:00 AM - 5:00 PM EST"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Branding
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand color
            </label>
            <input
              type="color"
              defaultValue={defaultSettings.brand_color}
              className="h-9 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {defaultSettings.brand_color}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            label="Contact email"
            type="email"
            defaultValue={defaultSettings.contact_email}
            placeholder="you@company.com"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Embed Code
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add this script to your website&apos;s <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono dark:bg-gray-800">&lt;head&gt;</code>{" "}
            to activate the LeadFlow AI chatbot. No other setup required.
          </p>
          <div className="relative">
            <textarea
              readOnly
              rows={8}
              value={defaultSettings.embed_snippet}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 font-mono text-xs text-gray-700 p-4 resize-none focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
          }
