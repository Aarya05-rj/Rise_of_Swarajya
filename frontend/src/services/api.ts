const BASE_URL = "/api";

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "API Error");
    return data;
  } catch (err: any) {
    console.error(`[API Error] ${endpoint}:`, err.message);
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
  answers: { questionId: number; selectedAnswer: number | null }[];
}) =>
  apiRequest("/submit-quiz", {
    method: "POST",
    body: JSON.stringify(payload),
  });
