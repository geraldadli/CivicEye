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
}

export interface CommunityProject {
  id: string;
  title: string;
  location: string;
  volunteers: number;
  donated: number;
  target: number;
  emoji: string;
}

export interface ReportItem {
  id: string;
  title: string;
  location: string;
  time: string;
  status: ReportStatus;
}
