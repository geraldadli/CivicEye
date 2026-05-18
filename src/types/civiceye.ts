export type BottomTab = 'home' | 'forum' | 'scan' | 'community' | 'store';
export type ReportStatus = 'Diterima' | 'Menuju Lokasi' | 'Proses' | 'Selesai';

export interface Task {
  id: string;
  location: string;
  issue: string;
  distanceKm: number;
  etaMin: number;
  payout: number;
  rating: number;
  completedTasks: number;
}

export interface Voucher {
  id: string;
  type: 'food' | 'money';
  title: string;
  description: string;
  points: number;
  badge: string;
  stock?: number;
}

export interface CommunityProject {
  id: string;
  title: string;
  location: string;
  volunteers: number;
  donated: number;
  target: number;
  emoji: string;
  category?: string;
  deadline?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  location: string;
  time: string;
  status: ReportStatus;
  description?: string;
  image?: string;
  pointsReward?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface UserProfile{
  id: string;
  name: string;
  points: number;
  rank: string;
  completedReports: number;
  badges: string[];
}

export interface DailyMission {
  id: string;
  title: string;
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
}