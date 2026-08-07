export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  resume?: string;
  college?: string;
  branch?: string;
  graduationYear?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardSummary {
  user: {
    name: string;
    email: string;
    college: string;
    branch: string;
    graduationYear: string;
  };
  resume: {
    uploaded: boolean;
    score: number;
  };
  roadmap: {
    generated: boolean;
  };
  dsa: {
    total: number;
    completed: number;
    pending: number;
    completionPercentage: number;
  };
}

export interface ReadinessScoreData {
  overallScore: number;
  resumeScore: number;
  dsaProgress: number;
  roadmapProgress: number;
  profileCompletion: number;
  recommendation: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  atsSuggestions: string[];
  improvementSuggestions: string[];
  createdAt?: string;
}

export interface RoadmapResponse {
  roadmap: string;
  targetRole?: string;
  targetCompany?: string;
  currentYear?: string;
  currentSkills?: string[];
  targetPackage?: string;
}

export interface DsaTopic {
  _id: string;
  user?: string;
  topic: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  completedAt?: string;
  createdAt?: string;
}

export interface DsaStats {
  total: number;
  completed: number;
  pending: number;
  completionPercentage: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface InterviewSession {
  _id: string;
  user?: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company?: string;
  questions: string[];
  feedback: string[];
  score: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'resume' | 'roadmap' | 'dsa' | 'interview' | 'system';
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  token?: string;
  user?: User;
}
