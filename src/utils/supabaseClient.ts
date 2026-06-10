import { createClient } from "@insforge/sdk";

const baseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!baseUrl || !anonKey || anonKey === "YOUR_SUPABASE_ANON_KEY") {
  console.warn(
    "InsForge credentials are not fully configured in your .env file. The application will experience database errors until keys are supplied."
  );
}

export const supabase = createClient({
  baseUrl,
  anonKey,
});
