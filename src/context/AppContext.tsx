import React, { createContext, useContext, useState, useEffect } from "react";

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

interface User {
  name: string;
  email: string;
  points: number;
  cashBalance: number;
}

interface AppContextType {
  role: Role;
  user: User | null;
  reports: ReportItemExtended[];
  teams: FieldTeam[];
  projects: CommunityProject[];
  volunteerTask: VolunteerTask;
  login: (email: string, role: "volunteer" | "staff") => void;
  logout: () => void;
  addReport: (title: string, location: string, details: string) => void;
  updateReportStatus: (id: string, status: ReportStatus) => void;
  assignReportTeam: (id: string, team: string) => void;
  assignReportSchedule: (id: string, schedule: string) => void;
  addStaffChat: (reportId: string, text: string) => void;
  updateReportNotes: (id: string, notes: string) => void;
  updateTaskAssignmentStatus: (reportId: string, status: string) => void;
  rejectReport: (id: string, reason: string) => void;
  addPoints: (amount: number) => void;
  updateTeamStatus: (teamName: string, status: "Available" | "Active" | "Offline") => void;
  // Volunteer interactions
  donateToProject: (id: string, pointsAmount: number) => boolean;
  joinProject: (id: string) => boolean;
  redeemVoucher: (pointsAmount: number) => boolean;
  acceptVolunteerTask: () => void;
  uploadVolunteerTaskPhoto: () => void;
  completeVolunteerTask: () => void;
  claimVolunteerTaskPayout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_REPORTS: ReportItemExtended[] = [
  {
    id: "10245",
    title: "Sampah Berserakan",
    location: "Jl. Anggrek",
    time: "2 jam lalu",
    status: "New",
    citizenName: "David",
    citizenProfile: "https://profiletye.com/David's profile",
    photoUrl: "/images/trash_debris.png",
    details: "Sampah plastik menumpuk di pinggir jalan raya mengganggu lalu lintas dan mengeluarkan bau menyengat.",
    assignedTeam: "",
    assignedSchedule: "",
    notes: "",
    chat: [],
    taskAssignmentStatus: "Available",
  },
  {
    id: "10246",
    title: "Sampah Berserakan",
    location: "Jl. Anggrek",
    time: "2 jam lalu",
    status: "New",
    citizenName: "David",
    citizenProfile: "https://profiletye.com/David's profile",
    photoUrl: "/images/trash_debris.png",
    details: "Tumpukan plastik belanjaan dan styrofoam menyumbat saluran air di trotoar depan halte bus.",
    assignedTeam: "",
    assignedSchedule: "",
    notes: "",
    chat: [],
    taskAssignmentStatus: "Available",
  },
  {
    id: "10247",
    title: "Sampah Berserakan",
    location: "Jl. Anggrek",
    time: "2 jam lalu",
    status: "Processing",
    citizenName: "David",
    citizenProfile: "https://profiletye.com/David's profile",
    photoUrl: "/images/trash_debris.png",
    details: "Puing-puing sisa konstruksi dibuang sembarangan di persimpangan jalan.",
    assignedTeam: "Team A",
    assignedSchedule: "Schedule for Friday",
    notes: "Tim A sedang dalam perjalanan membawa truk pengangkut.",
    chat: [
      {
        id: "c1",
        sender: "Staff David",
        text: "Tim A sudah bersiap berangkat menuju lokasi.",
        time: "1 jam lalu",
      },
    ],
    taskAssignmentStatus: "Available",
  },
  {
    id: "10248",
    title: "Sampah Berserakan",
    location: "Jl. Anggrek",
    time: "2 jam lalu",
    status: "Needs Review",
    citizenName: "David",
    citizenProfile: "https://profiletye.com/David's profile",
    photoUrl: "/images/trash_debris.png",
    details: "Sampah basah dan botol kaca berserakan setelah pasar kaget bubar.",
    assignedTeam: "Team A",
    assignedSchedule: "Schedule for Friday",
    notes: "Pembersihan selesai dilakukan. Menunggu verifikasi akhir dari pengawas wilayah.",
    chat: [],
    taskAssignmentStatus: "Available",
  },
  {
    id: "10249",
    title: "Daun Berserakan",
    location: "Taman Anggrek",
    time: "Kemarin",
    status: "Selesai",
    citizenName: "David",
    citizenProfile: "https://profiletye.com/David's profile",
    photoUrl: "/images/trash_debris.png",
    details: "Guguran daun kering menutupi area bermain anak-anak dan taman hias.",
    assignedTeam: "Team B",
    assignedSchedule: "Schedule for Yesterday",
    notes: "Masalah selesai diatasi dengan kerja bakti warga dan bantuan petugas kebersihan dinas terkait.",
    chat: [
      {
        id: "c2",
        sender: "Staff David",
        text: "Lokasi sudah bersih, silakan ditutup tiketnya.",
        time: "Kemarin",
      },
    ],
    taskAssignmentStatus: "Available",
  },
  {
    id: "10250",
    title: "Lampu Jalan Mati",
    location: "Jl. Melati",
    time: "5 jam lalu",
    status: "New",
    citizenName: "Budi",
    citizenProfile: "https://profiletye.com/Budi's profile",
    photoUrl: "/images/trash_debris.png",
    details: "Lampu penerangan utama jalan padam sepanjang 50 meter. Gelap gulita di malam hari.",
    assignedTeam: "",
    assignedSchedule: "",
    notes: "",
    chat: [],
    taskAssignmentStatus: "Available",
  },
];

const INITIAL_TEAMS: FieldTeam[] = [
  { name: "Team A", members: ["Andi", "Bayu", "Candra"], status: "Active" },
  { name: "Team B", members: ["Doni", "Eko"], status: "Available" },
  { name: "Team C", members: ["Faris", "Guntur", "Hadi"], status: "Offline" },
];

const INITIAL_PROJECTS: CommunityProject[] = [
  { id: "p1", title: "Pembersihan Kali Ciliwung", location: "Kec. Beji, Depok", volunteers: 47, donated: 13000000, target: 20000000, emoji: "🌊", joined: false },
  { id: "p2", title: "Pembersihan Kali Anggrek", location: "Kec. Kemanggisan", volunteers: 50, donated: 15000000, target: 25000000, emoji: "🌊", joined: false },
];

const INITIAL_TASK: VolunteerTask = {
  id: "t1",
  location: "Jl. Margonda Raya No.45, Depok",
  issue: "Sampah Berserakan",
  distanceKm: 1.2,
  etaMin: 8,
  payout: 45000,
  rating: 4.8,
  completedTasks: 127,
  status: "available",
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem("civiceye_role") as Role) || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("civiceye_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [reports, setReports] = useState<ReportItemExtended[]>(() => {
    const saved = localStorage.getItem("civiceye_reports");
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [teams, setTeams] = useState<FieldTeam[]>(() => {
    const saved = localStorage.getItem("civiceye_teams");
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [projects, setProjects] = useState<CommunityProject[]>(() => {
    const saved = localStorage.getItem("civiceye_projects");
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [volunteerTask, setVolunteerTask] = useState<VolunteerTask>(() => {
    const saved = localStorage.getItem("civiceye_vtask");
    return saved ? JSON.parse(saved) : INITIAL_TASK;
  });

  useEffect(() => {
    if (role) {
      localStorage.setItem("civiceye_role", role);
    } else {
      localStorage.removeItem("civiceye_role");
    }
  }, [role]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("civiceye_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("civiceye_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("civiceye_reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem("civiceye_teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("civiceye_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("civiceye_vtask", JSON.stringify(volunteerTask));
  }, [volunteerTask]);

  const login = (email: string, userRole: "volunteer" | "staff") => {
    const name = email.split("@")[0];
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const mockUser: User = {
      name: capitalized,
      email: email,
      points: userRole === "volunteer" ? 1250 : 0,
      cashBalance: userRole === "volunteer" ? 0 : 0,
    };
    setUser(mockUser);
    setRole(userRole);
  };

  const logout = () => {
    setRole(null);
    setUser(null);
  };

  const addReport = (title: string, location: string, details: string) => {
    const newReport: ReportItemExtended = {
      id: Math.floor(10000 + Math.random() * 90000).toString(),
      title,
      location,
      time: "Baru saja",
      status: "New",
      citizenName: user?.name || "David",
      citizenProfile: `https://profiletye.com/${user?.name || "David"}'s profile`,
      photoUrl: "/images/trash_debris.png",
      details,
      assignedTeam: "",
      assignedSchedule: "",
      notes: "",
      chat: [],
      taskAssignmentStatus: "Available",
    };
    setReports((prev) => [newReport, ...prev]);

    if (role === "volunteer") {
      addPoints(50);
    }
  };

  const updateReportStatus = (id: string, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === id) {
          if (status === "Selesai" && rep.status !== "Selesai") {
            addPoints(150);
          }
          return { ...rep, status };
        }
        return rep;
      })
    );
  };

  const assignReportTeam = (id: string, teamName: string) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === id) {
          return {
            ...rep,
            assignedTeam: teamName,
            status: rep.status === "New" ? "Processing" : rep.status,
          };
        }
        return rep;
      })
    );

    setTeams((prev) =>
      prev.map((team) => {
        if (team.name === teamName) {
          return { ...team, status: "Active", currentTaskId: id };
        }
        return team;
      })
    );
  };

  const assignReportSchedule = (id: string, schedule: string) => {
    setReports((prev) =>
      prev.map((rep) => (rep.id === id ? { ...rep, assignedSchedule: schedule } : rep))
    );
  };

  const addStaffChat = (reportId: string, text: string) => {
    const newChat: StaffChat = {
      id: Math.random().toString(),
      sender: role === "staff" ? `Staff ${user?.name || "David"}` : (user?.name || "David"),
      text,
      time: "Baru saja",
    };
    setReports((prev) =>
      prev.map((rep) =>
        rep.id === reportId ? { ...rep, chat: [...(rep.chat || []), newChat] } : rep
      )
    );
  };

  const updateReportNotes = (id: string, notes: string) => {
    setReports((prev) =>
      prev.map((rep) => (rep.id === id ? { ...rep, notes } : rep))
    );
  };

  const updateTaskAssignmentStatus = (id: string, status: string) => {
    setReports((prev) =>
      prev.map((rep) => (rep.id === id ? { ...rep, taskAssignmentStatus: status } : rep))
    );
  };

  const rejectReport = (id: string, reason: string) => {
    setReports((prev) =>
      prev.map((rep) =>
        rep.id === id ? { ...rep, status: "Rejected", rejectReason: reason } : rep
      )
    );
  };

  const addPoints = (amount: number) => {
    setUser((prev) => (prev ? { ...prev, points: prev.points + amount } : null));
  };

  const updateTeamStatus = (
    teamName: string,
    status: "Available" | "Active" | "Offline"
  ) => {
    setTeams((prev) =>
      prev.map((team) => (team.name === teamName ? { ...team, status } : team))
    );
  };

  // Volunteer actions
  const donateToProject = (projectId: string, pointsAmount: number) => {
    if (!user || user.points < pointsAmount) return false;
    setUser((prev) => (prev ? { ...prev, points: prev.points - pointsAmount } : null));
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, donated: p.donated + pointsAmount * 100 } : p
      )
    );
    return true;
  };

  const joinProject = (projectId: string) => {
    let success = false;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId && !p.joined) {
          success = true;
          return { ...p, volunteers: p.volunteers + 1, joined: true };
        }
        return p;
      })
    );

    if (success) {
      addPoints(50);
      return true;
    }
    return false;
  };

  const redeemVoucher = (pointsAmount: number) => {
    if (!user || user.points < pointsAmount) return false;
    setUser((prev) => (prev ? { ...prev, points: prev.points - pointsAmount } : null));
    return true;
  };

  const acceptVolunteerTask = () => {
    setVolunteerTask((prev) => ({ ...prev, status: "accepted" }));
  };

  const uploadVolunteerTaskPhoto = () => {
    setVolunteerTask((prev) => ({ ...prev, status: "uploaded" }));
  };

  const completeVolunteerTask = () => {
    setVolunteerTask((prev) => ({ ...prev, status: "completed" }));
  };

  const claimVolunteerTaskPayout = () => {
    if (volunteerTask.status !== "completed") return;
    setVolunteerTask((prev) => ({ ...prev, status: "claimed" }));
    setUser((prev) =>
      prev
        ? {
            ...prev,
            cashBalance: prev.cashBalance + volunteerTask.payout,
            points: prev.points + 100,
          }
        : null
    );
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
        login,
        logout,
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
