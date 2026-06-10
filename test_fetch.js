import { createClient } from "@insforge/sdk";
import fs from "fs";
import path from "path";

// Manually parse .env file
const envPath = path.resolve(process.cwd(), ".env");
let baseUrl = "";
let anonKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        if (key === "VITE_SUPABASE_URL") baseUrl = value;
        if (key === "VITE_SUPABASE_ANON_KEY") anonKey = value;
      }
    }
  }
}

const supabase = createClient({ baseUrl, anonKey });

const activeUserId = "2c22a109-d309-43b2-ba1c-6b8b49c278f5"; // David (Volunteer)
const userRole = "volunteer";

async function testFetch() {
  try {
    console.log("Starting test fetch...");
    
    // 0. Fetch Profile
    const { data: profile, error: profileErr } = await supabase.database
      .from("profiles")
      .select("*")
      .eq("id", activeUserId)
      .maybeSingle();
    if (profileErr) throw profileErr;
    console.log("0. PROFILE OK:", profile);

    // 1. Fetch Reports
    const { data: reportsData, error: reportsErr } = await supabase.database
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (reportsErr) throw reportsErr;
    console.log("1. REPORTS OK:", reportsData.length);

    // 2. Fetch Teams
    const { data: teamsData, error: teamsErr } = await supabase.database
      .from("teams")
      .select("*")
      .order("name", { ascending: true });
    if (teamsErr) throw teamsErr;
    console.log("2. TEAMS OK:", teamsData.length);

    // 3. Fetch Projects
    const { data: projectsData, error: projectsErr } = await supabase.database
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (projectsErr) throw projectsErr;
    console.log("3. PROJECTS OK:", projectsData.length);

    // 4. Fetch Proposals
    const { data: proposalsData, error: proposalsErr } = await supabase.database
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (proposalsErr) throw proposalsErr;
    console.log("4. PROPOSALS OK:", proposalsData.length);

    // 5. Fetch Chats
    const { data: chatsData, error: chatsErr } = await supabase.database
      .from("report_chats")
      .select("*")
      .order("created_at", { ascending: true });
    if (chatsErr) throw chatsErr;
    console.log("5. CHATS OK:", chatsData.length);

    // 6. Fetch project memberships
    const { data: memberProjects, error: pmErr } = await supabase.database
      .from("project_members")
      .select("project_id")
      .eq("user_id", activeUserId);
    if (pmErr) throw pmErr;
    console.log("6. PROJECT MEMBERS OK:", memberProjects.length);

    // 7. Fetch volunteer tasks
    const { data: vTask, error: vTaskErr } = await supabase.database
      .from("volunteer_tasks")
      .select("*")
      .eq("user_id", activeUserId)
      .maybeSingle();
    if (vTaskErr) throw vTaskErr;
    console.log("7. VOLUNTEER TASKS OK:", vTask);

    // 8. Fetch Transactions
    let txDataResult;
    const { data: txData, error: txErr } = await supabase.database
      .from("transactions")
      .select("*")
      .eq("user_id", activeUserId)
      .order("created_at", { ascending: false });

    if (txErr) throw txErr;
    txDataResult = txData;
    console.log("8. TRANSACTIONS OK:", txDataResult.length);
    console.log("TRANSACTIONS ROWS:", txDataResult);

  } catch (err) {
    console.error("FETCH ERROR TRIGGERED:", err);
  }
}

testFetch();
