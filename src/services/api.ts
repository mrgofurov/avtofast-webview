import { Question, Topic, UserStats } from '@/types';
import { QUESTIONS_DATA, TOPICS_DATA, INITIAL_USER_STATS } from '@/data/mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    role: string;
  };
}

export interface BackendQuestionItem {
  id: string;
  packId: string;
  contentVersion: string;
  category: string;
  difficulty: string;
  image?: {
    url: string;
    sha256?: string;
    alt?: Record<string, string>;
  };
  videoUrl?: string;
  audioUrl?: string;
  source?: {
    reference: string;
    effectiveFrom?: string;
    officialSourceUrl?: string;
  };
  prompt: string;
  choices: Array<{
    id: string;
    text: string;
    position: number;
  }>;
  correctChoiceId?: string;
  explanation?: string;
}

class ApiService {
  private token: string | null = null;
  private packId = 'uz-theory-2026-09';

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('avtofast_jwt_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('avtofast_jwt_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('avtofast_jwt_token');
    }
    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const t = this.getToken();
    if (t) {
      headers['Authorization'] = `Bearer ${t}`;
    }
    return headers;
  }

  // Ensure user is authenticated (Guest or Telegram)
  async ensureAuthenticated(): Promise<string | null> {
    let t = this.getToken();
    if (t) return t;

    const guestSession = await this.authenticateGuest('YHQ O\'quvchi');
    if (guestSession?.token) {
      return guestSession.token;
    }
    return null;
  }

  // Telegram Mini App authentication
  async authenticateTelegram(params: {
    initData?: string;
    telegramId?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
  }): Promise<AuthSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) return null;
      const data: AuthSession = await res.json();
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err) {
      console.warn('API: Telegram auth fallback', err);
      return null;
    }
  }

  // Browser Guest authentication
  async authenticateGuest(displayName?: string): Promise<AuthSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName || 'Haydovchilik o\'rganuvchisi' }),
      });

      if (!res.ok) return null;
      const data: AuthSession = await res.json();
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err) {
      console.warn('API: Guest auth connection refused, using local mode', err);
      return null;
    }
  }

  // Fetch Questions from Backend (with automatic conversion to Question interface)
  async getQuestions(category?: string, limit: number = 50): Promise<Question[]> {
    try {
      await this.ensureAuthenticated();
      const token = this.getToken();
      if (!token) throw new Error('No auth token');

      const url = new URL(`${API_BASE_URL}/content/packs/${this.packId}/questions`);
      url.searchParams.set('limit', limit.toString());
      if (category) {
        url.searchParams.set('category', category);
      }

      const res = await fetch(url.toString(), {
        headers: this.getHeaders(),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((item: BackendQuestionItem, idx: number) => {
          // Resolve category title
          const catTitleMap: Record<string, string> = {
            road_signs: "Yo'l belgilari",
            intersections: "Chorrahalar",
            traffic_rules: "Harakat qoidalari",
            first_aid: "Birinchi tibbiy yordam",
            penalties: "Jarimalar va javobgarlik",
            vehicle_safety: "Texnik holat va xavfsizlik",
            situations: "Harakatlanish holatlari",
          };

          return {
            id: item.id,
            topicId: item.category || 'road_signs',
            topicTitle: catTitleMap[item.category] || "Yo'l harakati qoidalari",
            questionNumber: idx + 1,
            totalQuestions: data.items.length,
            imageUrl: item.image?.url || undefined,
            videoUrl: item.videoUrl || undefined,
            audioUrl: item.audioUrl || undefined,
            text: item.prompt,
            options: item.choices.map((c) => ({
              id: c.id,
              text: c.text,
            })),
            correctOptionId: item.correctChoiceId || 'a',
            explanation: {
              whyWrong: "Diqqat qiling: Yo'l harakati qoidalari talablariga asosan ushbu vaziyatda qat'iy ustuvorlik tartibiga amal qilinishi shart.",
              officialRule: item.explanation || (item.source?.reference
                ? `${item.source.reference} qoidalariga asosan transport vositalari xavfsiz harakatlanishi shart.`
                : "Yo'l harakati qoidalariga asosan haydovchi o'zaro ustuvorlik belgilariga amal qilishi shart."),
              ruleArticle: item.source?.reference || "YHQ",
              memoryTrick: "Harakatlanayotganda avval tartibga soluvchi, so'ng svetofor, so'ngra belgilar va o'ng qo'l qoidasiga e'tibor bering!",
              realLifeScenario: "O'zbekiston yo'llarida va chorrahalarida qat'iy yo'l harakati qoidalari amal qiladi.",
            },
          };
        });
      }
    } catch (err) {
      console.warn('API: Failed to fetch backend questions, falling back to bundled dataset', err);
    }

    // Fallback to local high quality questions
    return QUESTIONS_DATA;
  }

  // Create timed Mock Exam on backend
  async createMockExam(): Promise<{ id: string; questions: Question[]; durationSeconds: number } | null> {
    try {
      await this.ensureAuthenticated();
      const res = await fetch(`${API_BASE_URL}/mock-exams`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          packId: this.packId,
          locale: 'uz-Latn-UZ',
          format: 'official_20',
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();

      const questions: Question[] = (data.questions || []).map((item: BackendQuestionItem, idx: number) => ({
        id: item.id,
        topicId: item.category || 'road_signs',
        topicTitle: "Rasmiy Imtihon",
        questionNumber: idx + 1,
        totalQuestions: 20,
        imageUrl: item.image?.url,
        videoUrl: item.videoUrl,
        audioUrl: item.audioUrl,
        text: item.prompt,
        options: item.choices.map((c) => ({ id: c.id, text: c.text })),
        correctOptionId: 'a',
        explanation: {
          whyWrong: "Imtihon savolida qoidaning nozik jihatiga e'tibor bering.",
          officialRule: item.source?.reference || "YHQ Rasmiy Imtihon standarti",
          ruleArticle: item.source?.reference || "YHQ",
          memoryTrick: "Chorrahalar va belgilarda o'ngdan kelayotgan xavfni doimo inobatga oling.",
          realLifeScenario: "DYHXX rasmiy nazariy imtihonida xuddi shu formatda savol tushadi.",
        },
      }));

      return {
        id: data.id,
        questions,
        durationSeconds: 1200,
      };
    } catch (err) {
      console.warn('API: createMockExam fallback to local', err);
      return null;
    }
  }

  // Submit Answer to Practice Session
  async submitPracticeAnswer(sessionId: string, questionId: string, choiceId: string): Promise<any | null> {
    try {
      await this.ensureAuthenticated();
      const res = await fetch(`${API_BASE_URL}/practice-sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          questionId,
          selectedChoiceId: choiceId,
          elapsedMs: 2000,
        }),
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  // Get user profile / stats
  async getUserStats(): Promise<UserStats | null> {
    try {
      await this.ensureAuthenticated();
      const res = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: this.getHeaders(),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return {
        readinessScore: data.readinessScore || 85,
        questionsSolved: data.stats?.totalAnswered || 114,
        accuracyRate: data.stats?.accuracyPercent || 88,
        currentStreakDays: data.stats?.streakDays || 5,
        weakTopics: data.weakCategories?.length ? data.weakCategories : ["Chorrahalarda o'tish", "Svetofor signallari"],
        lastStudyDate: "Bugun",
      };
    } catch (err) {
      return null;
    }
  }
}

export const api = new ApiService();
