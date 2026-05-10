import { supabase } from "./supabaseClient";

const BASE_URL = "/api";

function getTokenExpiry(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return typeof payload.exp === "number" ? payload.exp : 0;
  } catch {
    return 0;
  }
}

async function getFreshAccessToken() {
  const { data: sessionData } = await supabase.auth.getSession();
  let token = sessionData.session?.access_token;

  if (token && getTokenExpiry(token) <= Math.floor(Date.now() / 1000) + 60) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    token = error ? undefined : refreshed.session?.access_token;
  }

  return token && getTokenExpiry(token) > Math.floor(Date.now() / 1000) ? token : undefined;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const token = await getFreshAccessToken();
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(data.error || "API Error");
    return data;
  } catch (err: any) {
    throw err;
  }
}

// Data fetching
export const getForts = () => apiRequest("/forts");
export const getCharacters = () => apiRequest("/characters");
export const getPowadas = () => apiRequest("/powadas");
export const getProfile = (id: string) => apiRequest(`/profile/${id}`);
export const getActivities = (id: string) => apiRequest(`/activities/${id}`);
export const getQuizQuestions = (level: number, quiz: number) =>
  apiRequest(`/questions?level=${level}&quiz=${quiz}`);
export const getQuizProgress = (userId: string) => apiRequest(`/progress/${userId}`);
export const getUserStats = (userId: string) => apiRequest(`/user-stats/${userId}`);

// Mutations
export const updateProfile = (id: string, full_name: string) =>
  apiRequest(`/profile/${id}`, {
    method: "POST",
    body: JSON.stringify({ full_name }),
  });

export const updateScore = (user_id: string, score: number) =>
  apiRequest("/update-score", {
    method: "POST",
    body: JSON.stringify({ user_id, score }),
  });

export const logActivity = (
  user_id: string,
  activity_type: string,
  details: Record<string, any> = {}
) =>
  apiRequest("/log-activity", {
    method: "POST",
    body: JSON.stringify({
      user_id,
      activity_type,
      details,
      timestamp: new Date().toISOString(),
    }),
  });

export const submitQuiz = (payload: {
  userId: string;
  level: number;
  quiz: number;
  answers: { questionId: number; selectedAnswer: number | null; selectedAnswerText?: string | null }[];
}) =>
  apiRequest("/submit-quiz", {
    method: "POST",
    body: JSON.stringify(payload),
  });
