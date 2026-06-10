import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

export type Role = "volunteer" | "staff" | null;

export interface StaffChat {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export type ReportStatus =
  | "New"
  | "Processing"
  | "Needs Review"
  | "Selesai"
  | "Rejected";

export interface ReportItemExtended {
  id: string;
  title: string;
  location: string;
  time: string;
  status: ReportStatus;
  citizenName: string;
  citizenProfile: string;
  photoUrl: string;
  details: string;
  assignedTeam?: string;
  assignedSchedule?: string;
  notes?: string;
  chat?: StaffChat[];
  rejectReason?: string;
  taskAssignmentStatus?: string;
}

export interface FieldTeam {
  name: string;
  members: string[];
  status: "Available" | "Active" | "Offline";
  currentTaskId?: string;
}

export interface CommunityProject {
  id: string;
  title: string;
  location: string;
  volunteers: number;
  donated: number;
  target: number;
  emoji: string;
  joined?: boolean;
}

export interface VolunteerTask {
  id: string;
  location: string;
  issue: string;
  distanceKm: number;
  etaMin: number;
  payout: number;
  rating: number;
  completedTasks: number;
  status: "available" | "accepted" | "uploaded" | "completed" | "claimed";
}

export interface ProjectProposal {
  id: string;
  title: string;
  location: string;
  description: string;
  category: string;
  proposerName: string;
  status: "pending" | "approved" | "rejected";
}

export interface User {
  name: string;
  email: string;
  points: number;
  cashBalance: number;
  phone?: string;
  nik?: string;
  address?: string;
  staffId?: string;
  department?: string;
}

export interface TransactionItem {
  id: string;
  type: "points" | "cash";
  amount: number;
  description: string;
  time: string;
}

interface AppContextType {
  role: Role;
  user: User | null;
  reports: ReportItemExtended[];
  teams: FieldTeam[];
  projects: CommunityProject[];
  volunteerTask: VolunteerTask;
  proposals: ProjectProposal[];
  transactions: TransactionItem[];
  loading: boolean;
  login: (email: string, role: "volunteer" | "staff", password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerUser: (data: {
    fullName: string;
    email: string;
    phone: string;
    role: "volunteer" | "staff";
    password?: string;
    nik?: string;
    address?: string;
    staffId?: string;
    department?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  addReport: (title: string, location: string, details: string, photoFile?: File) => Promise<void>;
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>;
  assignReportTeam: (id: string, team: string) => Promise<void>;
  assignReportSchedule: (id: string, schedule: string) => Promise<void>;
  addStaffChat: (reportId: string, text: string) => Promise<void>;
  updateReportNotes: (id: string, notes: string) => Promise<void>;
  updateTaskAssignmentStatus: (reportId: string, status: string) => Promise<void>;
  rejectReport: (id: string, reason: string) => Promise<void>;
  addPoints: (amount: number) => Promise<void>;
  updateTeamStatus: (teamName: string, status: "Available" | "Active" | "Offline") => Promise<void>;
  // Volunteer interactions
  donateToProject: (id: string, pointsAmount: number) => Promise<boolean>;
  joinProject: (id: string) => Promise<boolean>;
  redeemVoucher: (pointsAmount: number, voucherId: string, title: string) => Promise<string | false>;
  acceptVolunteerTask: () => Promise<void>;
  uploadVolunteerTaskPhoto: () => Promise<void>;
  completeVolunteerTask: () => Promise<void>;
  claimVolunteerTaskPayout: () => Promise<void>;
  // Citizen Proposal actions
  proposeProject: (title: string, location: string, description: string, category: string) => Promise<void>;
  approveProjectProposal: (id: string, targetFund: number) => Promise<void>;
  rejectProjectProposal: (id: string) => Promise<void>;
  updateProjectTargetFund: (id: string, newTarget: number) => Promise<void>;
  updateProfile: (fullName: string) => Promise<boolean>;
  cancelTeamAssignment: (reportId: string, teamName: string) => Promise<void>;
  createTeam: (name: string, members: string[]) => Promise<boolean>;
  updateTeamMembers: (teamName: string, members: string[]) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_VOLUNTEER_TASK: Omit<VolunteerTask, "status"> = {
  id: "t1",
  location: "Jl. Margonda Raya No.45, Depok",
  issue: "Sampah Berserakan",
  distanceKm: 1.2,
  etaMin: 8,
  payout: 45000,
  rating: 4.8,
  completedTasks: 127,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportItemExtended[]>([]);
  const [teams, setTeams] = useState<FieldTeam[]>([]);
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [volunteerTask, setVolunteerTask] = useState<VolunteerTask>({
    ...DEFAULT_VOLUNTEER_TASK,
    status: "available",
  });
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tables from InsForge Database
  const fetchData = async (activeUserId: string, activeRole?: Role) => {
    const userRole = activeRole !== undefined ? activeRole : role;
    try {
      // 0. Fetch Profile details to sync points & cash wallet balance
      const { data: profile, error: profileErr } = await supabase.database
        .from("profiles")
        .select("*")
        .eq("id", activeUserId)
        .maybeSingle();

      if (!profileErr && profile) {
        setUser((prev) => ({
          name: profile.full_name,
          email: profile.email || prev?.email || "",
          points: profile.points,
          cashBalance: profile.cash_balance,
          phone: profile.phone || "",
          nik: profile.nik || "",
          address: profile.address || "",
          staffId: profile.staff_id || "",
          department: profile.department || "",
        }));
      }

      // 1. Fetch Reports
      const { data: reportsData, error: reportsErr } = await supabase.database
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (reportsErr) throw reportsErr;

      // 2. Fetch Teams
      const { data: teamsData, error: teamsErr } = await supabase.database
        .from("teams")
        .select("*")
        .order("name", { ascending: true });
      if (teamsErr) throw teamsErr;

      // 3. Fetch Projects
      const { data: projectsData, error: projectsErr } = await supabase.database
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (projectsErr) throw projectsErr;

      // 4. Fetch Proposals
      const { data: proposalsData, error: proposalsErr } = await supabase.database
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (proposalsErr) throw proposalsErr;

      // 5. Fetch Chats
      const { data: chatsData, error: chatsErr } = await supabase.database
        .from("report_chats")
        .select("*")
        .order("created_at", { ascending: true });
      if (chatsErr) throw chatsErr;

      // 6. Fetch project memberships to check which ones the user joined
      let joinedIds = new Set<string>();
      if (userRole === "volunteer") {
        const { data: memberProjects } = await supabase.database
          .from("project_members")
          .select("project_id")
          .eq("user_id", activeUserId);
        joinedIds = new Set((memberProjects || []).map((mp: any) => mp.project_id));
      }

      // 7. Fetch or Provision Volunteer Task
      if (userRole === "volunteer") {
        const { data: vTask, error: vTaskErr } = await supabase.database
          .from("volunteer_tasks")
          .select("*")
          .eq("user_id", activeUserId)
          .maybeSingle();

        if (vTaskErr) throw vTaskErr;

        if (vTask) {
          setVolunteerTask({
            id: vTask.id,
            location: vTask.location,
            issue: vTask.issue,
            distanceKm: vTask.distance_km,
            etaMin: vTask.eta_min,
            payout: vTask.payout,
            rating: vTask.rating,
            completedTasks: vTask.completed_tasks,
            status: vTask.status as any,
          });
        } else {
          // Create initial volunteer task for this user in the database
          const defaultTask = {
            id: "t_" + Math.floor(1000 + Math.random() * 9000).toString(),
            location: DEFAULT_VOLUNTEER_TASK.location,
            issue: DEFAULT_VOLUNTEER_TASK.issue,
            distance_km: DEFAULT_VOLUNTEER_TASK.distanceKm,
            eta_min: DEFAULT_VOLUNTEER_TASK.etaMin,
            payout: DEFAULT_VOLUNTEER_TASK.payout,
            rating: DEFAULT_VOLUNTEER_TASK.rating,
            completed_tasks: DEFAULT_VOLUNTEER_TASK.completedTasks,
            status: "available",
            user_id: activeUserId,
          };

          const { data: newVTask } = await supabase.database
            .from("volunteer_tasks")
            .insert([defaultTask])
            .select()
            .single();

          if (newVTask) {
            setVolunteerTask({
              id: newVTask.id,
              location: newVTask.location,
              issue: newVTask.issue,
              distanceKm: newVTask.distance_km,
              etaMin: newVTask.eta_min,
              payout: newVTask.payout,
              rating: newVTask.rating,
              completedTasks: newVTask.completed_tasks,
              status: newVTask.status as any,
            });
          }
        }
      }

      // Map chats onto reports
      const mappedReports: ReportItemExtended[] = (reportsData || []).map((rep: any) => {
        const repChats = (chatsData || [])
          .filter((c: any) => c.report_id === rep.id)
          .map((c: any) => ({
            id: c.id,
            sender: c.sender,
            text: c.text,
            time: c.time,
          }));
        return {
          id: rep.id,
          title: rep.title,
          location: rep.location,
          time: rep.time,
          status: rep.status as ReportStatus,
          citizenName: rep.citizen_name,
          citizenProfile: `https://profiletye.com/${rep.citizen_name}'s profile`,
          photoUrl: rep.photo_url || "/images/trash_debris.png",
          details: rep.details || "",
          assignedTeam: rep.assigned_team || "",
          assignedSchedule: rep.assigned_schedule || "",
          notes: rep.notes || "",
          taskAssignmentStatus: rep.task_assignment_status || "Available",
          rejectReason: rep.reject_reason || "",
          chat: repChats,
        };
      });

      // Map projects
      const mappedProjects: CommunityProject[] = (projectsData || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        volunteers: p.volunteers,
        donated: p.donated,
        target: p.target,
        emoji: p.emoji,
        joined: joinedIds.has(p.id),
      }));

      // Map proposals
      const mappedProposals: ProjectProposal[] = (proposalsData || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        description: p.description,
        category: p.category,
        proposerName: p.proposer_name,
        status: p.status as "pending" | "approved" | "rejected",
      }));

      // 8. Fetch Transactions
      let mappedTransactions: TransactionItem[] = [];
      console.log("fetchData [transactions] - userRole check:", userRole, "activeUserId:", activeUserId);
      if (userRole === "volunteer") {
        console.log("fetchData [transactions] - fetching transactions from database...");
        let { data: txData, error: txErr } = await supabase.database
          .from("transactions")
          .select("*")
          .eq("user_id", activeUserId)
          .order("created_at", { ascending: false });

        if (txErr) {
          console.error("fetchData [transactions] - database error:", txErr);
          throw txErr;
        }

        console.log("fetchData [transactions] - raw database transactions:", txData);

        // Auto-seed/backfill initial registration transaction if volunteer has points but no transactions logged yet
        if ((!txData || txData.length === 0) && profile && (profile.points || 0) > 0) {
          const initialPoints = profile.points || 1250;
          console.log("fetchData [transactions] - Auto-seeding initial points:", initialPoints);
          await supabase.database.from("transactions").insert([{
            user_id: activeUserId,
            type: "points",
            amount: initialPoints,
            description: "Pendaftaran Awal",
          }]);
          
          // Re-fetch transactions
          const { data: refetched } = await supabase.database
            .from("transactions")
            .select("*")
            .eq("user_id", activeUserId)
            .order("created_at", { ascending: false });
          if (refetched) {
            txData = refetched;
            console.log("fetchData [transactions] - refetched transactions:", txData);
          }
        }

        mappedTransactions = (txData || []).map((t: any) => {
          let timeStr = "";
          let dateStr = "";
          try {
            const date = new Date(t.created_at);
            timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
            dateStr = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
          } catch (dateErr) {
            console.error("fetchData [transactions] - date parsing exception for:", t.created_at, dateErr);
            try {
              const date = new Date(t.created_at);
              timeStr = date.toTimeString().split(' ')[0].slice(0, 5);
              dateStr = date.toDateString();
            } catch (fallbackErr) {
              timeStr = "";
              dateStr = "Unknown Date";
            }
          }
          return {
            id: t.id,
            type: t.type as "points" | "cash",
            amount: t.amount,
            description: t.description,
            time: dateStr && timeStr ? `${dateStr}, ${timeStr}` : (dateStr || "Unknown Date"),
          };
        });
        console.log("fetchData [transactions] - mapped transactions:", mappedTransactions);
      } else {
        console.log("fetchData [transactions] - userRole is not volunteer, skipping transaction fetch.");
      }

      setReports(mappedReports);
      setTeams(teamsData || []);
      setProjects(mappedProjects);
      setProposals(mappedProposals);
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error("Error fetching database tables:", err);
    }
  };

  const addTransaction = async (userId: string, type: "points" | "cash", amount: number, description: string) => {
    try {
      const { error } = await supabase.database.from("transactions").insert([{
        user_id: userId,
        type,
        amount,
        description,
      }]);
      if (error) {
        console.error("Error inserting transaction:", error);
      }
    } catch (err) {
      console.error("Exception in addTransaction:", err);
    }
  };

  const handleAuthSession = async (authUser: any, selectedRole?: Role, registeredName?: string) => {
    try {
      setUserId(authUser.id);
      
      const { data: profile, error } = await supabase.database
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
      }

      const roleFallback = selectedRole || (authUser.email?.includes("staff") ? "staff" : "volunteer");
      let activeProfile = profile;

      if (!activeProfile) {
        console.log("Profile not found in database for user. Creating default profile...");
        const defaultPoints = roleFallback === "volunteer" ? 1250 : 0;
        const defaultName = registeredName || authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.name || authUser.email?.split("@")[0] || "User";

        const newProfile = {
          id: authUser.id,
          full_name: defaultName,
          role: roleFallback,
          phone: authUser.phone || "",
          email: authUser.email || "",
          nik: roleFallback === "volunteer" ? "1234567890123456" : "",
          address: roleFallback === "volunteer" ? "Jl. Margonda Raya No. 45" : "",
          staff_id: roleFallback === "staff" ? "STF-99" : "",
          department: roleFallback === "staff" ? "Dinas Lingkungan Hidup" : "",
          points: defaultPoints,
          cash_balance: 0,
        };

        const { data: inserted, error: insertErr } = await supabase.database
          .from("profiles")
          .insert([newProfile])
          .select()
          .maybeSingle();

        if (insertErr) {
          console.error("Error creating default profile in database:", insertErr);
        } else if (inserted) {
          activeProfile = inserted;
          // Record initial transaction in ledger
          if (roleFallback === "volunteer") {
            await addTransaction(authUser.id, "points", defaultPoints, "Pendaftaran Awal");
          }
        }
      }

      if (activeProfile) {
        setUser({
          name: activeProfile.full_name,
          email: authUser.email || "",
          points: activeProfile.points,
          cashBalance: activeProfile.cash_balance,
          phone: activeProfile.phone || "",
          nik: activeProfile.nik || "",
          address: activeProfile.address || "",
          staffId: activeProfile.staff_id || "",
          department: activeProfile.department || "",
        });
        setRole(activeProfile.role as Role);
      } else {
        // Fallback profile if record is not found and insert failed
        setUser({
          name: registeredName || authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
          points: roleFallback === "volunteer" ? 1250 : 0,
          cashBalance: 0,
        });
        setRole(roleFallback);
      }

      await fetchData(authUser.id, activeProfile?.role || roleFallback);
    } catch (err) {
      console.error("Exception in handleAuthSession:", err);
    }
  };

  useEffect(() => {
    // Check initial session
    const restoreSession = async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getCurrentUser();
        if (userData?.user) {
          await handleAuthSession(userData.user);
        } else {
          setRole(null);
          setUser(null);
          setUserId(null);
        }
      } catch (err) {
        console.error("Session restoration failed:", err);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, _role: "volunteer" | "staff", password?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || "password123",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        await handleAuthSession(data.user, _role);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    } finally {
      setRole(null);
      setUser(null);
      setUserId(null);
      setReports([]);
      setProjects([]);
      setProposals([]);
      setLoading(false);
    }
  };

  const registerUser = async (data: {
    fullName: string;
    email: string;
    phone: string;
    role: "volunteer" | "staff";
    password?: string;
    nik?: string;
    address?: string;
    staffId?: string;
    department?: string;
  }) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password || "password123",
        name: data.fullName,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (authData?.user) {
        // Direct database insert into public.profiles
        const { error: dbErr } = await supabase.database.from("profiles").insert([{
          id: authData.user.id,
          full_name: data.fullName,
          role: data.role,
          phone: data.phone,
          email: data.email,
          nik: data.nik || "",
          address: data.address || "",
          staff_id: data.staffId || "",
          department: data.department || "",
          points: data.role === "volunteer" ? 1250 : 0,
          cash_balance: 0,
        }]);
        if (dbErr) {
          console.error("Error inserting profile into database:", dbErr);
        } else if (data.role === "volunteer") {
          await addTransaction(authData.user.id, "points", 1250, "Pendaftaran Awal");
        }

        // Setup session state
        await handleAuthSession(authData.user, data.role, data.fullName);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  const addReport = async (title: string, location: string, details: string, photoFile?: File) => {
    let photoUrl = "/images/trash_debris.png";

    // 1. Rate limit check: max 1 report every 3 minutes per citizen to prevent report flooding
    if (user?.name) {
      const { data: recentReports, error: rateLimitErr } = await supabase.database
        .from("reports")
        .select("created_at")
        .eq("citizen_name", user.name)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!rateLimitErr && recentReports && recentReports.length > 0) {
        const lastReportTime = new Date(recentReports[0].created_at).getTime();
        const now = Date.now();
        const diffMinutes = (now - lastReportTime) / 60000;
        if (diffMinutes < 3) {
          const waitTime = Math.ceil(3 - diffMinutes);
          throw new Error(`Proteksi Spam: Anda melaporkan terlalu cepat. Harap tunggu ${waitTime} menit lagi sebelum membuat laporan baru.`);
        }
      }
    }

    if (photoFile) {
      try {
        // 2. Generate SHA-256 hash of the photo file to prevent duplicate uploads (exploit check)
        const arrayBuffer = await photoFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const imageHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        // Check if a report with this image hash already exists
        const { data: duplicateReport, error: dupErr } = await supabase.database
          .from("reports")
          .select("id, title")
          .ilike("photo_url", `%${imageHash}%`)
          .maybeSingle();

        if (duplicateReport) {
          throw new Error(`Foto Duplikat Terdeteksi: Foto ini sudah pernah digunakan pada Laporan #${duplicateReport.id} ("${duplicateReport.title}"). Harap gunakan foto bukti yang baru.`);
        }

        const fileExt = photoFile.name.split(".").pop() || "png";
        const fileName = `${imageHash}.${fileExt}`;
        const { data, error: uploadErr } = await supabase.storage
          .from("report-photos")
          .upload(`reports/${fileName}`, photoFile);

        if (uploadErr) {
          console.error("Error uploading photo to storage:", uploadErr);
          throw new Error("Gagal mengunggah foto ke storage: " + uploadErr.message);
        } else if (data?.url) {
          photoUrl = data.url;
        }
      } catch (err: any) {
        console.error("Exception uploading photo to storage:", err);
        throw err;
      }
    } else {
      // Try to upload the mock image to Supabase Storage so we have a real remote file url
      try {
        const res = await fetch("/images/trash_debris.png");
        const blob = await res.blob();
        const fileName = `debris-${Date.now()}.png`;
        const { data, error: uploadErr } = await supabase.storage
          .from("report-photos")
          .upload(`reports/${fileName}`, blob);

        if (!uploadErr && data?.url) {
          photoUrl = data.url;
        }
      } catch (err) {
        console.warn("Could not upload seed image to storage, using fallback local path:", err);
      }
    }

    const reportId = Math.floor(10000 + Math.random() * 90000).toString();
    const newReport = {
      id: reportId,
      title,
      location,
      time: "Baru saja",
      status: "New",
      citizen_name: user?.name || "David",
      photo_url: photoUrl,
      details,
      assigned_team: "",
      assigned_schedule: "",
      notes: "",
      task_assignment_status: "Available",
      reject_reason: "",
    };

    const { error } = await supabase.database.from("reports").insert([newReport]);
    if (error) {
      console.error("Error inserting report into InsForge:", error);
      throw new Error("Gagal menyimpan laporan: " + error.message);
    }

    if (userId) {
      await fetchData(userId);
    }
  };

  const updateReportStatus = async (id: string, status: ReportStatus) => {
    let taskAssignmentStatus = "Available";
    if (status === "Processing") {
      taskAssignmentStatus = "En Route";
    } else if (status === "Needs Review") {
      taskAssignmentStatus = "Needs Review";
    } else if (status === "Selesai") {
      taskAssignmentStatus = "Completed";
    } else if (status === "New") {
      taskAssignmentStatus = "Available";
    }

    const { error } = await supabase.database
      .from("reports")
      .update({
        status,
        task_assignment_status: taskAssignmentStatus
      })
      .eq("id", id);
      
    if (error) {
      console.error("Error updating report status:", error);
      return;
    }

    // Award citizen points if finished
    if (status === "Selesai") {
      const { data: report } = await supabase.database
        .from("reports")
        .select("title, citizen_name")
        .eq("id", id)
        .single();
      if (report) {
        const { data: citizen } = await supabase.database
          .from("profiles")
          .select("id, points")
          .eq("full_name", report.citizen_name)
          .maybeSingle();
        if (citizen) {
          await supabase.database
            .from("profiles")
            .update({ points: (citizen.points || 0) + 150 })
            .eq("id", citizen.id);
          await addTransaction(citizen.id, "points", 150, `Laporan Diselesaikan: ${report.title}`);
        }
      }
    }

    if (userId) {
      await fetchData(userId);
    }
  };

  const assignReportTeam = async (id: string, teamName: string) => {
    await supabase.database
      .from("reports")
      .update({
        assigned_team: teamName,
        status: "Processing",
      })
      .eq("id", id);

    await supabase.database
      .from("teams")
      .update({
        status: "Active",
        current_task_id: id,
      })
      .eq("name", teamName);

    if (userId) {
      await fetchData(userId);
    }
  };

  const assignReportSchedule = async (id: string, schedule: string) => {
    await supabase.database
      .from("reports")
      .update({ assigned_schedule: schedule })
      .eq("id", id);

    if (userId) {
      await fetchData(userId);
    }
  };

  const addStaffChat = async (reportId: string, text: string) => {
    const sender = role === "staff" ? `Staff ${user?.name || "David"}` : (user?.name || "David");
    await supabase.database
      .from("report_chats")
      .insert([{
        report_id: reportId,
        sender,
        text,
        time: "Baru saja",
      }]);

    if (userId) {
      await fetchData(userId);
    }
  };

  const updateReportNotes = async (id: string, notes: string) => {
    await supabase.database
      .from("reports")
      .update({ notes })
      .eq("id", id);

    if (userId) {
      await fetchData(userId);
    }
  };

  const updateTaskAssignmentStatus = async (id: string, status: string) => {
    let reportStatus: ReportStatus = "New";
    if (status === "En Route" || status === "On Site" || status === "In Progress") {
      reportStatus = "Processing";
    } else if (status === "Needs Review") {
      reportStatus = "Needs Review";
    } else if (status === "Completed") {
      reportStatus = "Selesai";
    } else if (status === "Available") {
      reportStatus = "New";
    }

    const { error } = await supabase.database
      .from("reports")
      .update({
        task_assignment_status: status,
        status: reportStatus
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating task assignment status:", error);
      return;
    }

    // Award citizen points if completed
    if (reportStatus === "Selesai") {
      const { data: report } = await supabase.database
        .from("reports")
        .select("title, citizen_name")
        .eq("id", id)
        .single();
      if (report) {
        const { data: citizen } = await supabase.database
          .from("profiles")
          .select("id, points")
          .eq("full_name", report.citizen_name)
          .maybeSingle();
        if (citizen) {
          await supabase.database
            .from("profiles")
            .update({ points: (citizen.points || 0) + 150 })
            .eq("id", citizen.id);
          await addTransaction(citizen.id, "points", 150, `Laporan Diselesaikan: ${report.title}`);
        }
      }
    }

    if (userId) {
      await fetchData(userId);
    }
  };

  const rejectReport = async (id: string, reason: string) => {
    await supabase.database
      .from("reports")
      .update({
        status: "Rejected",
        reject_reason: reason,
      })
      .eq("id", id);

    // Penalty deduction from submitter (anti-spam disincentive)
    try {
      const { data: report } = await supabase.database
        .from("reports")
        .select("title, citizen_name")
        .eq("id", id)
        .single();

      if (report && report.citizen_name) {
        const { data: citizen } = await supabase.database
          .from("profiles")
          .select("id, points")
          .eq("full_name", report.citizen_name)
          .maybeSingle();

        if (citizen) {
          const penalty = 100; // Deduct 100 points as spam penalty
          const newPoints = Math.max(0, (citizen.points || 0) - penalty);

          await supabase.database
            .from("profiles")
            .update({ points: newPoints })
            .eq("id", citizen.id);

          await addTransaction(
            citizen.id,
            "points",
            -penalty,
            `Laporan Ditolak (Spam/Duplikat): ${report.title}`
          );

          if (userId === citizen.id) {
            setUser((prev) => (prev ? { ...prev, points: newPoints } : null));
          }
        }
      }
    } catch (err) {
      console.error("Failed to apply spam penalty in rejectReport:", err);
    }

    if (userId) {
      await fetchData(userId);
    }
  };

  const addPoints = async (amount: number, description: string = "Penambahan Poin") => {
    if (!userId) return;

    let currentPoints = user?.points || 0;
    const { data: profile } = await supabase.database
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      currentPoints = profile.points || 0;
    }

    const newPoints = currentPoints + amount;
    await supabase.database
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", userId);

    setUser((prev) => (prev ? { ...prev, points: newPoints } : null));
    await addTransaction(userId, "points", amount, description);
  };

  const updateTeamStatus = async (
    teamName: string,
    status: "Available" | "Active" | "Offline"
  ) => {
    await supabase.database
      .from("teams")
      .update({ status })
      .eq("name", teamName);

    if (userId) {
      await fetchData(userId);
    }
  };

  // Volunteer actions
  const donateToProject = async (projectId: string, pointsAmount: number) => {
    if (!user || user.points < pointsAmount || !userId) return false;

    // Decrement user points
    const newPoints = user.points - pointsAmount;
    const { error: profileErr } = await supabase.database
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", userId);

    if (profileErr) {
      console.error("Error updating user points during donation:", profileErr);
      alert("Gagal mendonasikan poin: " + profileErr.message);
      return false;
    }

    // Update local state immediately for fast visual feedback
    setUser((prev) => (prev ? { ...prev, points: newPoints } : null));

    // Fetch current donated fund & title
    const { data: project } = await supabase.database
      .from("projects")
      .select("title, donated")
      .eq("id", projectId)
      .single();

    if (project) {
      const newDonated = (project.donated || 0) + (pointsAmount * 100);
      const { error: projectErr } = await supabase.database
        .from("projects")
        .update({ donated: newDonated })
        .eq("id", projectId);

      if (projectErr) {
        console.error("Error updating project donated amount:", projectErr);
      }

      await addTransaction(userId, "points", -pointsAmount, `Donasi Aksi: ${project.title}`);
    }

    await fetchData(userId);
    return true;
  };

  const joinProject = async (projectId: string) => {
    if (!userId) return false;

    const { data: existing } = await supabase.database
      .from("project_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) return false;

    await supabase.database
      .from("project_members")
      .insert([{ project_id: projectId, user_id: userId }]);

    const { data: project } = await supabase.database
      .from("projects")
      .select("title, volunteers")
      .eq("id", projectId)
      .single();

    if (project) {
      await supabase.database
        .from("projects")
        .update({ volunteers: (project.volunteers || 0) + 1 })
        .eq("id", projectId);
      await addPoints(50, `Gabung Relawan: ${project.title}`);
    } else {
      await addPoints(50, "Gabung Relawan Aksi");
    }

    await fetchData(userId);
    return true;
  };

  const redeemVoucher = async (pointsAmount: number, voucherId: string, title: string) => {
    if (!user || !userId || user.points < pointsAmount) return false;

    const newPoints = user.points - pointsAmount;
    const mockCode = `CE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error: profileErr } = await supabase.database
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", userId);

    if (profileErr) {
      console.error("Error updating points in profiles during voucher redeem:", profileErr);
      alert("Gagal memperbarui poin: " + profileErr.message);
      return false;
    }

    // Update local state immediately for fast visual feedback
    setUser((prev) => (prev ? { ...prev, points: newPoints } : null));

    const { error: voucherErr } = await supabase.database
      .from("user_vouchers")
      .insert([{
        user_id: userId,
        voucher_id: voucherId,
        title: title,
        code: mockCode,
      }]);

    if (voucherErr) {
      console.error("Error saving user voucher:", voucherErr);
    }

    await addTransaction(userId, "points", -pointsAmount, `Klaim Voucher: ${title}`);
    await fetchData(userId);

    return mockCode;
  };

  const acceptVolunteerTask = async () => {
    if (!userId) return;
    setVolunteerTask((prev) => ({ ...prev, status: "accepted" }));
    await supabase.database
      .from("volunteer_tasks")
      .update({ status: "accepted" })
      .eq("user_id", userId);
  };

  const uploadVolunteerTaskPhoto = async () => {
    if (!userId) return;
    setVolunteerTask((prev) => ({ ...prev, status: "uploaded" }));
    await supabase.database
      .from("volunteer_tasks")
      .update({ status: "uploaded" })
      .eq("user_id", userId);
  };

  const completeVolunteerTask = async () => {
    if (!userId) return;
    setVolunteerTask((prev) => ({ ...prev, status: "completed" }));
    await supabase.database
      .from("volunteer_tasks")
      .update({ status: "completed" })
      .eq("user_id", userId);
  };

  const claimVolunteerTaskPayout = async () => {
    if (volunteerTask.status !== "completed" || !user || !userId) return;

    setVolunteerTask((prev) => ({ ...prev, status: "claimed" }));
    
    await supabase.database
      .from("volunteer_tasks")
      .update({ status: "claimed" })
      .eq("user_id", userId);

    const newCash = user.cashBalance + volunteerTask.payout;
    const newPoints = user.points + 100;

    const { error: profileErr } = await supabase.database
      .from("profiles")
      .update({
        cash_balance: newCash,
        points: newPoints,
      })
      .eq("id", userId);

    if (profileErr) {
      console.error("Error updating profile during payout claim:", profileErr);
      alert("Gagal mengklaim upah: " + profileErr.message);
      return;
    }

    // Update local state immediately for fast visual feedback
    setUser((prev) => (prev ? { ...prev, points: newPoints, cashBalance: newCash } : null));

    await addTransaction(userId, "cash", volunteerTask.payout, `Upah Kerja: ${volunteerTask.issue}`);
    await addTransaction(userId, "points", 100, `Poin Tugas: ${volunteerTask.issue}`);

    await fetchData(userId);
  };

  // Citizen Proposal actions
  const proposeProject = async (
    title: string,
    location: string,
    description: string,
    category: string
  ) => {
    const proposalId = "prop" + Math.floor(1000 + Math.random() * 9000).toString();
    const newProposal = {
      id: proposalId,
      title,
      location,
      description,
      category,
      proposer_name: user?.name || "David",
      status: "pending",
    };

    const { error } = await supabase.database.from("proposals").insert([newProposal]);
    if (error) {
      console.error("Error inserting proposal:", error);
      alert("Gagal mengirim usulan aksi warga: " + error.message);
      return;
    }

    if (userId) {
      await fetchData(userId, role);
    }
  };

  const approveProjectProposal = async (id: string, targetFund: number = 10000000) => {
    const { data: p } = await supabase.database
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (!p) return;

    await supabase.database
      .from("proposals")
      .update({ status: "approved" })
      .eq("id", id);

    const emojiMap: Record<string, string> = {
      Greenery: "🌳",
      Repair: "🚧",
      Cleanup: "🌊",
    };

    const newProject = {
      id: p.id,
      title: p.title,
      location: p.location,
      volunteers: 1,
      donated: 0,
      target: targetFund,
      emoji: emojiMap[p.category] || "🌊",
    };

    await supabase.database.from("projects").insert([newProject]);

    const { data: proposerProfile } = await supabase.database
      .from("profiles")
      .select("id")
      .eq("full_name", p.proposer_name)
      .maybeSingle();

    if (proposerProfile) {
      await supabase.database
        .from("project_members")
        .insert([{ project_id: p.id, user_id: proposerProfile.id }]);
    }

    if (userId) {
      await fetchData(userId);
    }
  };

  const rejectProjectProposal = async (id: string) => {
    await supabase.database
      .from("proposals")
      .update({ status: "rejected" })
      .eq("id", id);

    if (userId) {
      await fetchData(userId);
    }
  };

  const updateProjectTargetFund = async (id: string, newTarget: number) => {
    await supabase.database
      .from("projects")
      .update({ target: newTarget })
      .eq("id", id);

    if (userId) {
      await fetchData(userId);
    }
  };

  const updateProfile = async (fullName: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase.database
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", userId);

      if (error) {
        console.error("Error updating profile in database:", error);
        return false;
      }

      setUser((prev) => (prev ? { ...prev, name: fullName } : null));
      return true;
    } catch (err) {
      console.error("Exception in updateProfile:", err);
      return false;
    }
  };
  const cancelTeamAssignment = async (reportId: string, teamName: string) => {
    await supabase.database
      .from("reports")
      .update({
        assigned_team: "",
        status: "New",
        task_assignment_status: "Available",
      })
      .eq("id", reportId);

    await supabase.database
      .from("teams")
      .update({
        status: "Available",
        current_task_id: null,
      })
      .eq("name", teamName);

    if (userId) {
      await fetchData(userId);
    }
  };
  const createTeam = async (name: string, members: string[]) => {
    const { error } = await supabase.database
      .from("teams")
      .insert([{
        name,
        members,
        status: "Available",
        current_task_id: null
      }]);

    if (error) {
      console.error("Error creating team:", error);
      return false;
    }

    if (userId) {
      await fetchData(userId);
    }
    return true;
  };

  const updateTeamMembers = async (teamName: string, members: string[]) => {
    const { error } = await supabase.database
      .from("teams")
      .update({ members })
      .eq("name", teamName);

    if (error) {
      console.error("Error updating team members:", error);
      return false;
    }

    if (userId) {
      await fetchData(userId);
    }
    return true;
  };
  return (
    <AppContext.Provider
      value={{
        role,
        user,
        reports,
        teams,
        projects,
        volunteerTask,
        proposals,
        transactions,
        loading,
        login,
        logout,
        registerUser,
        addReport,
        updateReportStatus,
        assignReportTeam,
        assignReportSchedule,
        addStaffChat,
        updateReportNotes,
        updateTaskAssignmentStatus,
        rejectReport,
        addPoints,
        updateTeamStatus,
        // Volunteer interactions
        donateToProject,
        joinProject,
        redeemVoucher,
        acceptVolunteerTask,
        uploadVolunteerTaskPhoto,
        completeVolunteerTask,
        claimVolunteerTaskPayout,
        // Citizen Proposal actions
        proposeProject,
        approveProjectProposal,
        rejectProjectProposal,
        updateProjectTargetFund,
        updateProfile,
        cancelTeamAssignment,
        createTeam,
        updateTeamMembers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
