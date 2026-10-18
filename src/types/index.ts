export type TabType = 'home' | 'topics' | 'ai' | 'exam' | 'profile';

export interface TrafficSign {
  id: string;
  name: string;
  code: string;
  category: string;
  image?: string;
  description: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  topicId: string;
  topicTitle: string;
  questionNumber?: number;
  totalQuestions?: number;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  signImage?: string;
  signType?: 'warning' | 'priority' | 'prohibitory' | 'mandatory' | 'information';
  signSymbol?: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: {
    whyWrong: string;
    officialRule: string;
    ruleArticle: string;
    memoryTrick: string;
    realLifeScenario: string;
  };
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  iconName: string;
  totalQuestions: number;
  completedQuestions: number;
  estimatedMinutes: number;
  isAiRecommended?: boolean;
  color: string;
}

export interface UserStats {
  readinessScore: number; // e.g. 84%
  questionsSolved: number; // e.g. 342
  accuracyRate: number; // e.g. 88%
  currentStreakDays: number; // e.g. 7
  weakTopics: string[];
  lastStudyDate: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  signBadge?: {
    code: string;
    title: string;
  };
  ruleReference?: string;
  audioDuration?: string;
}

export interface ExamSession {
  totalQuestions: number;
  durationMinutes: number;
  timeRemainingSeconds: number;
  currentIndex: number;
  answers: Record<string, string>; // questionId -> selectedOptionId
  isCompleted: boolean;
  score?: number;
  passed?: boolean;
}
