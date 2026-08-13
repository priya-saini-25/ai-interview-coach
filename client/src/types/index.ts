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
  targetRole?: string;
  targetCompany?: string;
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
  updatedAt?: string;
}

export interface DsaTopic {
  _id: string;
  user?: string;
  topic: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  savedForRevision?: boolean;
  completedAt?: string;
  createdAt?: string;
}

export interface DsaProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface DsaProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  topic: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
  roles: string[];
  tags: string[];
  examples?: DsaProblemExample[];
  constraints?: string[];
  hints?: string[];
  status?: 'Not Started' | 'In Progress' | 'Solved';
  savedForRevision?: boolean;
  solvedAt?: string;
  progressId?: string;
  score?: number;
}

export interface DsaRecommendationResponse {
  targetRole: string;
  targetCompany: string;
  total: number;
  solved: number;
  inProgress: number;
  problems: DsaProblem[];
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

export interface QuestionItem {
  id: number;
  section: string;
  question: string;
}

export interface SectionScores {
  technical: number;
  logical: number;
  personal: number;
  hr: number;
}

export interface DetailedAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  questionsToImprove: string[];
  overallReadiness: string;
}

export interface InterviewSession {
  _id: string;
  user?: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company?: string;
  questions: (string | QuestionItem)[];
  answers?: string[];
  feedback: string[];
  score: number;
  sectionScores?: SectionScores;
  detailedAnalysis?: DetailedAnalysis;
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

export interface MentorMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface MentorChatResponse {
  reply: string;
  messages: MentorMessage[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  token?: string;
  user?: User;
  reply?: string;
  messages?: MentorMessage[];
}

export interface DsaAnalyticsSummary {
  totalTracked: number;
  solved: number;
  pending: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  completionPercentage: number;
  currentStreak: number;
  longestStreak: number;
  solvedThisWeek: number;
  solvedThisMonth: number;
}

export interface DsaRevisionSummary {
  dueToday: number;
  overdue: number;
  revisionCompletionPercentage: number;
  revisionSuccessRate: number;
  currentRevisionStreak: number;
}

export interface DsaTopicProgressItem {
  topic: string;
  total: number;
  solved: number;
  inProgress: number;
  remaining: number;
  completionPercentage: number;
}

export interface DsaDifficultyProgressItem {
  solved: number;
  total: number;
  completionPercentage: number;
}

export interface DsaDifficultyProgress {
  easy: DsaDifficultyProgressItem;
  medium: DsaDifficultyProgressItem;
  hard: DsaDifficultyProgressItem;
  distribution: {
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  };
}

export interface DsaWeeklyProgressItem {
  date: string;
  day: string;
  solved: number;
}

export interface DsaMonthlyProgressItem {
  week: number;
  label: string;
  solved: number;
}

export interface DsaWeakTopicItem {
  topic: string;
  score: number;
  completionPercentage: number;
  solved: number;
  total: number;
  reasons: string[];
}

export interface DsaPlatformItem {
  connected: boolean;
  handle?: string;
  totalSolved?: number;
  easy?: number;
  medium?: number;
  hard?: number;
  rating?: number;
  rank?: string;
  stars?: string;
  badgeStars?: number;
  lastSyncedAt?: string;
}

export interface DsaAnalyticsData {
  summary: DsaAnalyticsSummary;
  topicProgress: DsaTopicProgressItem[];
  difficultyProgress: DsaDifficultyProgress;
  weeklyProgress: DsaWeeklyProgressItem[];
  monthlyProgress: DsaMonthlyProgressItem[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastSolvedDate: string | null;
  };
  weakTopics: DsaWeakTopicItem[];
  platforms: {
    leetcode?: DsaPlatformItem;
    codeforces?: DsaPlatformItem;
    codechef?: DsaPlatformItem;
    hackerrank?: DsaPlatformItem;
  };
  revisionSummary?: DsaRevisionSummary;
}

export interface DsaAiWeaknessItem {
  topic: string;
  severity: 'high' | 'medium' | 'low';
  reason: string;
  evidence: string[];
  recommendation: string;
}

export interface DsaAiStrengthItem {
  topic: string;
  reason: string;
}

export interface DsaAiAnalysisData {
  aiAvailable?: boolean;
  message?: string;
  overallAssessment?: string;
  strengths?: DsaAiStrengthItem[];
  weaknesses?: DsaAiWeaknessItem[];
  difficultyAdvice?: {
    easy?: string;
    medium?: string;
    hard?: string;
  };
  practiceStrategy?: string[];
  interviewReadinessAdvice?: string[];
  deterministicWeakTopics?: DsaWeakTopicItem[];
}

export interface DsaRoadmapProblemItem {
  problemId: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  completedAt?: string;
}

export interface DsaRoadmapDayItem {
  dayNumber: number;
  date: string;
  focusTopics: string[];
  learningGoals: string[];
  estimatedMinutes: number;
  revisionTasks: string[];
  problems: DsaRoadmapProblemItem[];
}

export interface DsaRoadmapData {
  _id: string;
  title: string;
  goal: string;
  targetRole: string;
  generatedAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'expired';
  days: DsaRoadmapDayItem[];
  totalProblems: number;
  completedProblems: number;
  completionPercentage: number;
}

export interface DsaRevisionItem {
  _id: string;
  problemId: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dueDate: string;
  daysOverdue: number;
  revisionLevel: number;
  intervalDays: number;
  status: 'pending' | 'due' | 'completed' | 'skipped';
  lastReviewedAt?: string;
  reviewCount: number;
  successCount: number;
  failureCount: number;
  lastResult?: 'success' | 'failure' | 'skipped' | null;
  difficultyRating: number;
  priorityScore: number;
  successRate: number;
}

export interface DsaRevisionTodayData {
  overdue: DsaRevisionItem[];
  dueToday: DsaRevisionItem[];
  upcoming: DsaRevisionItem[];
}

export interface DsaRevisionStatsData {
  totalRevisionProblems: number;
  dueToday: number;
  overdue: number;
  completedToday: number;
  totalReviews: number;
  successfulReviews: number;
  failedReviews: number;
  successRate: number;
  currentRevisionStreak: number;
  longestRevisionStreak: number;
}

export interface DsaRevisionCalendarDay {
  date: string;
  count: number;
  problems: {
    problemId: string;
    title: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    revisionLevel: number;
  }[];
}



