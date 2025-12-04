// lib/admin/types.ts

export enum ViewState {
  DASHBOARD = "DASHBOARD",
  SCANS = "SCANS",
  USERS = "USERS",
  CONTENT = "CONTENT",
}

export enum ScanResult {
  REAL = "REAL",
  FAKE = "FAKE",
  SUSPICIOUS = "SUSPICIOUS",
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface ScanLog {
  id: string;
  userName: string;
  userEmail: string | null;
  type: MediaType;
  result: ScanResult;
  confidence: number;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  scansCount: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  image: string;
  link: string;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface QuizCategory {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  category_slug: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string | null;
  created_at: string;
}
