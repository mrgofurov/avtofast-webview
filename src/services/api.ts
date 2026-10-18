import type {
  Dashboard,
  MockExamResult,
  MockExamSession,
  PracticeAnswerResult,
  PracticeRequest,
  PracticeSession,
  Question,
  TopicSummary,
  TopicTest,
  TutorAnswer,
  TutorTurn,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';
const PACK_ID = 'uz-theory-2026-09';
const LOCALE = 'uz-Latn-UZ';

const TOKEN_KEY = 'avtofast_jwt_token';
// Whose token is stored: "tg:<id>" or "guest". A guest token left over from a
// browser visit must not be reused once the same device opens the app inside
// Telegram, or the learner's progress lands on an anonymous account.
const OWNER_KEY = 'avtofast_jwt_owner';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface BackendQuestion {
  id: string;
  category: string;
  image?: { url: string };
  videoUrl?: string;
  audioUrl?: string;
  source?: { reference?: string };
  prompt: string;
  choices: Array<{ id: string; text: string; position: number }>;
  correctChoiceId?: string;
  explanation?: string;
}

interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

// The imported bank labels every question "YHQ" (some "YHQ (Prepdrive)"),
// which says nothing the explanation does not already cite — the explanation
// itself names the exact clause. Only a specific reference is worth showing.
function specificReference(reference?: string): string | undefined {
  if (!reference || /^YHQ(\s*\(.*\))?$/i.test(reference.trim())) return undefined;
  return reference.trim();
}

function toQuestion(item: BackendQuestion): Question {
  return {
    id: item.id,
    category: item.category,
    imageUrl: item.image?.url || undefined,
    videoUrl: item.videoUrl || undefined,
    audioUrl: item.audioUrl || undefined,
    text: item.prompt,
    options: [...item.choices]
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ id: c.id, text: c.text })),
    correctOptionId: item.correctChoiceId || undefined,
    explanation: item.explanation?.trim() || undefined,
    reference: specificReference(item.source?.reference),
  };
}

// Media paths come back relative to the API origin ("/medias/questions/x.webp").
export function resolveMediaUrl(path?: string): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/v1\/?$/, '');
  return `${origin}/${path.replace(/^\/+/, '')}`;
}

function telegramUser(): { initData: string; user: TelegramWebAppUser } | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg = (window as any).Telegram?.WebApp;
  if (!tg?.initDataUnsafe?.user?.id) return null;
  return { initData: tg.initData, user: tg.initDataUnsafe.user };
}

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class ApiService {
  private token: string | null = null;
  // One sign-in at a time: every screen asks for data on mount, and without
  // this each of them would create its own guest account.
  private signingIn: Promise<string> | null = null;

  private readStoredToken(owner: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      if (localStorage.getItem(OWNER_KEY) !== owner) return null;
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private storeToken(token: string, owner: string) {
    this.token = token;
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(OWNER_KEY, owner);
    } catch {
      // Private mode: the token still lives for this page load.
    }
  }

  private async signIn(): Promise<string> {
    const tg = telegramUser();
    const owner = tg ? `tg:${tg.user.id}` : 'guest';

    const stored = this.readStoredToken(owner);
    if (stored) {
      this.token = stored;
      return stored;
    }

    const res = tg
      ? await fetch(`${API_BASE_URL}/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initData: tg.initData,
            telegramId: tg.user.id,
            firstName: tg.user.first_name,
            lastName: tg.user.last_name,
            username: tg.user.username,
            photoUrl: tg.user.photo_url,
          }),
        })
      : await fetch(`${API_BASE_URL}/auth/guest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: "Avtofast o'quvchisi" }),
        });

    if (!res.ok) throw new ApiError(res.status, 'Tizimga kirib bo\'lmadi');
    const data: { token?: string } = await res.json();
    if (!data.token) throw new ApiError(500, 'Token qaytmadi');
    this.storeToken(data.token, owner);
    return data.token;
  }

  private async ensureToken(): Promise<string> {
    if (this.token) return this.token;
    if (!this.signingIn) {
      this.signingIn = this.signIn().finally(() => {
        this.signingIn = null;
      });
    }
    return this.signingIn;
  }

  private async request<T>(
    path: string,
    init: { method?: string; body?: unknown; idempotent?: boolean } = {},
    retried = false,
  ): Promise<T> {
    const token = await this.ensureToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (init.body !== undefined) headers['Content-Type'] = 'application/json';
    if (init.idempotent) headers['Idempotency-Key'] = newIdempotencyKey();

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

    // An expired or revoked token: sign in again once, then give up.
    if (res.status === 401 && !retried) {
      this.token = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // ignore
      }
      return this.request<T>(path, init, true);
    }

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        message = err?.error?.message || err?.message || message;
      } catch {
        // non-JSON error body
      }
      throw new ApiError(res.status, message);
    }

    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  async getDashboard(): Promise<Dashboard> {
    const d = await this.request<Dashboard>('/dashboard');
    return { ...d, weakCategories: d.weakCategories ?? [] };
  }

  async getTopics(): Promise<TopicSummary[]> {
    const res = await this.request<{ items: TopicSummary[] }>(`/topics?packId=${PACK_ID}`);
    return res.items ?? [];
  }

  async getTopicTests(category: string): Promise<TopicTest[]> {
    const res = await this.request<{ items: TopicTest[] }>(
      `/topics/${encodeURIComponent(category)}/tests?packId=${PACK_ID}`,
    );
    return res.items ?? [];
  }

  async startPractice(request: Exclude<PracticeRequest, { kind: 'retry' }>): Promise<PracticeSession> {
    const body: Record<string, unknown> = { packId: PACK_ID, locale: LOCALE, questionCount: 20 };
    if (request.kind === 'topic_test') {
      body.mode = 'category';
      body.category = request.category;
      body.testIndex = request.testIndex;
    } else if (request.kind === 'mistakes') {
      body.mode = 'mistake_review';
      if (request.category) body.category = request.category;
    } else {
      body.mode = 'adaptive';
      if (request.category) body.category = request.category;
    }

    const res = await this.request<{ id: string; questions: BackendQuestion[] }>('/practice-sessions', {
      method: 'POST',
      body,
      idempotent: true,
    });
    return { id: res.id, request, questions: (res.questions ?? []).map(toQuestion) };
  }

  async submitPracticeAnswer(
    sessionId: string,
    questionId: string,
    choiceId: string,
    elapsedMs: number,
  ): Promise<PracticeAnswerResult> {
    const res = await this.request<PracticeAnswerResult>(`/practice-sessions/${sessionId}/answers`, {
      method: 'POST',
      body: { questionId, selectedChoiceId: choiceId, elapsedMs: Math.round(elapsedMs) },
      idempotent: true,
    });
    return { ...res, reference: specificReference(res.reference) ?? '' };
  }

  async completePractice(sessionId: string): Promise<{ answeredCount: number; correctCount: number }> {
    return this.request(`/practice-sessions/${sessionId}/complete`, { method: 'POST', idempotent: true });
  }

  async createMockExam(): Promise<MockExamSession> {
    const res = await this.request<{
      id: string;
      deadlineAt: string;
      passCorrectCount: number;
      questions: BackendQuestion[];
    }>('/mock-exams', {
      method: 'POST',
      body: { packId: PACK_ID, locale: LOCALE, format: 'official_20' },
      idempotent: true,
    });
    return {
      id: res.id,
      deadlineAt: res.deadlineAt,
      passCorrectCount: res.passCorrectCount,
      // The exam is graded on the server; the client never shows the key
      // before submission, so it is dropped here rather than trusted to the UI.
      questions: (res.questions ?? []).map((q) => ({ ...toQuestion(q), correctOptionId: undefined, explanation: undefined })),
    };
  }

  async submitMockAnswer(examId: string, questionId: string, choiceId: string, elapsedMs: number): Promise<void> {
    await this.request(`/mock-exams/${examId}/answers/${encodeURIComponent(questionId)}`, {
      method: 'PUT',
      body: { selectedChoiceId: choiceId, elapsedMs: Math.round(elapsedMs) },
    });
  }

  async submitMockExam(examId: string): Promise<MockExamResult> {
    const res = await this.request<MockExamResult>(`/mock-exams/${examId}/submit`, { method: 'POST', idempotent: true });
    return {
      ...res,
      review: (res.review ?? []).map((r) => ({ ...r, reference: specificReference(r.reference) ?? '' })),
    };
  }

  async askTutor(request: {
    message: string;
    questionId?: string;
    selectedChoiceId?: string;
    history: TutorTurn[];
  }): Promise<TutorAnswer> {
    const res = await this.request<TutorAnswer>('/ai/tutor', { method: 'POST', body: request });
    return { ...res, citations: res.citations ?? [] };
  }
}

export const api = new ApiService();
