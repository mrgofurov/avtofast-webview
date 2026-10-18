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

// One exam question as the backend serves it. Explanation and reference are
// the official text from the question bank — never generated on the client,
// because a learner trusts this screen to be the rule as written.
export interface Question {
  id: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  text: string;
  options: QuestionOption[];
  correctOptionId?: string;
  explanation?: string;
  reference?: string;
}

// One row of the topics list (GET /topics).
export interface TopicSummary {
  category: string;
  questionCount: number;
  testCount: number;
  completedTests: number;
  accuracyPercent: number;
  dueMistakes: number;
}

// One numbered test inside a topic (GET /topics/:category/tests).
export interface TopicTest {
  index: number;
  questionCount: number;
  attempts: number;
  bestCorrect?: number;
  lastAttemptAt?: string;
}

export interface WeakCategory {
  category: string;
  accuracyPercent: number;
  dueMistakes: number;
}

// GET /dashboard, as the home and profile screens read it.
export interface Dashboard {
  xp: number;
  level: number;
  streakDays: number;
  dailyGoal: { completed: number; target: number };
  readinessScore: number;
  accuracyPercent: number;
  completedMockExams: number;
  dueMistakeCount: number;
  weakCategories: WeakCategory[];
  nextRecommendedAction: string;
}

// What the practice screen is asked to run. A numbered topic test is a fixed
// slice of the bank; mistakes and random are drawn by the server per attempt;
// retry re-runs questions the learner just got wrong, straight away — the
// server only offers a mistake for review a day later.
export type PracticeRequest =
  | { kind: 'topic_test'; category: string; testIndex: number }
  | { kind: 'mistakes'; category?: string }
  | { kind: 'random'; category?: string }
  | { kind: 'retry'; questions: Question[] };

export interface PracticeSession {
  id: string;
  request: PracticeRequest;
  questions: Question[];
}

export interface PracticeAnswerResult {
  questionId: string;
  isCorrect: boolean;
  correctChoiceId: string;
  explanation: string;
  reference: string;
}

export interface MockExamSession {
  id: string;
  deadlineAt: string;
  passCorrectCount: number;
  questions: Question[];
}

export interface MockExamReviewItem {
  questionId: string;
  selectedChoiceId: string;
  correctChoiceId: string;
  isCorrect: boolean;
  explanation: string;
  reference: string;
}

export interface MockExamResult {
  correctCount: number;
  questionCount: number;
  passCorrectCount: number;
  passed: boolean;
  scorePercent: number;
  review: MockExamReviewItem[];
}

// POST /ai/tutor. Every citation is an official explanation from the question
// bank, chosen on the server from the sources the answer used — never text
// the model wrote — so the clause shown is one the bank really cites.
export interface TutorCitation {
  questionId: string;
  clause?: string;
  text: string;
}

export interface TutorAnswer {
  answer: string;
  // False when the official sources do not cover the question; the answer is
  // then a fixed "not in my sources" text and there are no citations.
  grounded: boolean;
  citations: TutorCitation[];
}

export interface TutorTurn {
  role: 'user' | 'assistant';
  text: string;
}

// The question a learner just got wrong, handed from the explanation card to
// the tutor so its official explanation is always one of the sources.
export interface TutorContext {
  questionId: string;
  questionText: string;
  selectedChoiceId?: string;
  selectedText?: string;
  correctText?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  grounded?: boolean;
  citations?: TutorCitation[];
  // An AI bubble standing in for a request that failed; retrying resends
  // the user message it answers.
  failed?: boolean;
}
