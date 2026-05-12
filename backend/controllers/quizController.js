const supabase = require('../config/supabase');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const LEVEL_COUNT = 10;
const QUIZZES_PER_LEVEL = 9;
const PASSING_SCORE = 70;

let cachedSeedQuestions = null;
let cachedProgressSchema = null;
let cachedActivitySchema = null;

const levelTitles = [
  ['Rise of Shivaji', 'Origins, oath, courage'],
  ['Forts of Swarajya', 'Citadels and strategy'],
  ['Battles & Conquests', 'Speed, surprise, victory'],
  ['Ashtapradhan Mandal', 'Council of statecraft'],
  ['Naval Supremacy', 'Guardians of the coast'],
  ['Culture & Dharma', 'Values of governance'],
  ["Sambhaji's Legacy", 'Defiance and sacrifice'],
  ['Maratha Confederacy', 'Power beyond forts'],
  ['The Peshwa Era', 'Expansion and administration'],
  ['Glory of Swarajya', 'The enduring flame'],
];

const levels = levelTitles.map(([title, subtitle], index) => ({
  id: index + 1,
  title,
  subtitle,
  quizCount: QUIZZES_PER_LEVEL,
}));

const getRequestSupabase = (req) => {
  const authorization = req.headers?.authorization;
  if (!authorization) return supabase;
  const token = authorization.replace(/^Bearer\s+/i, '');

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64url').toString('utf8'));
    if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) {
      return supabase;
    }
  } catch (error) {
    return supabase;
  }

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    global: {
      headers: { Authorization: authorization },
    },
  });
};

const getSeedQuestions = () => {
  if (cachedSeedQuestions) return cachedSeedQuestions;

  try {
    const seedPath = path.join(__dirname, '../sql/quiz_schema_seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    const match = sql.match(/from jsonb_to_recordset\('([\s\S]*?)'::jsonb\)/);
    cachedSeedQuestions = match ? JSON.parse(match[1]) : [];
  } catch (error) {
    console.error('[Quiz Seed Error]', error.message);
    cachedSeedQuestions = [];
  }

  return cachedSeedQuestions;
};

const getFallbackQuestions = (level, quiz) => {
  const seedQuestions = getSeedQuestions();
  const exactQuestions = seedQuestions.filter((question) => question.level === level && question.quiz === quiz);
  const reusableQuestions = exactQuestions.length
    ? exactQuestions
    : seedQuestions.filter((question) => question.level === 1 && question.quiz === quiz);
  const questions = reusableQuestions.length
    ? reusableQuestions
    : seedQuestions.filter((question) => question.level === 1 && question.quiz === 1);

  return questions.slice(0, 10).map((question, index) => ({
    ...question,
    id: level * 1000 + quiz * 100 + index + 1,
    level,
    quiz,
  }));
};

const getStars = (score) => {
  if (score >= 90) return 3;
  if (score >= 60) return 2;
  if (score >= 30) return 1;
  return 0;
};

const rankForScore = (score) => {
  if (score >= 200) return 'King';
  if (score >= 101) return 'Hero';
  if (score >= 51) return 'Warrior';
  return 'Soldier';
};

const syncProfileQuizScore = async (userId, progressRows, db = supabase) => {
  try {
    const totalScore = progressRows.reduce((sum, item) => {
      const bestScore = item.best_score ?? item.score ?? 0;
      return sum + bestScore + (item.stars || 0) * 25;
    }, 0);

    // Try 'users' first as it's our new standard
    let { data: profile, error: profileError } = await db
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    let tableName = 'users';

    if (profileError || !profile) {
      // Fallback to 'profiles'
      ({ data: profile, error: profileError } = await db
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle());
      tableName = 'profiles';
    }

    if (profileError || !profile) return null;

    const updatePayload = {};
    const scoreColumn = Object.prototype.hasOwnProperty.call(profile, 'total_score') ? 'total_score' : 'score';
    updatePayload[scoreColumn] = totalScore;

    if (Object.prototype.hasOwnProperty.call(profile, 'rank')) {
      updatePayload.rank = rankForScore(totalScore);
    }
    if (Object.prototype.hasOwnProperty.call(profile, 'progress')) {
      updatePayload.progress = Math.min(Math.round((progressRows.filter((item) => item.completed).length / (LEVEL_COUNT * QUIZZES_PER_LEVEL)) * 100), 100);
    }

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await db
      .from(tableName)
      .update(updatePayload)
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (error) {
      console.warn(`[Profile Quiz Score Warning] Failed to update ${tableName}:`, error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('[Profile Quiz Score Warning] Critical Error:', error.message);
    return null;
  }
};

const isMissingTableError = (error, tableName) => {
  const message = error?.message || '';
  return message.includes(tableName) && message.includes('schema cache');
};

const isRlsError = (error) => {
  const message = error?.message || '';
  return error?.code === '42501' || message.includes('row-level security');
};

const toClientQuestion = (question) => {
  const options = [...question.options];

  return {
    id: question.id,
    level: question.level,
    quiz: question.quiz,
    quizId: `${question.level}-${question.quiz}`,
    question: question.question,
    options,
    correctAnswer: question.correct_answer,
  };
};

const encodeLegacyQuizId = (level, quiz) => level * 100 + quiz;

const parseQuizRef = (value, fallbackQuiz = 1) => {
  if (typeof value === 'string' && value.includes('-')) {
    const [level, quiz] = value.split('-').map(Number);
    return { level, quiz };
  }

  const numericValue = Number(value);
  if (Number.isInteger(numericValue) && numericValue >= 100) {
    return {
      level: Math.floor(numericValue / 100),
      quiz: numericValue % 100,
    };
  }

  return { level: Number(value), quiz: Number(fallbackQuiz || 1) };
};

const scoreFromStars = (stars = 0, completed = false) => {
  if (stars >= 3) return 90;
  if (stars >= 2) return 70;
  if (stars >= 1) return 50;
  return completed ? PASSING_SCORE : 0;
};

const normalizeProgressRow = (row) => {
  const parsed = row.level && row.quiz
    ? { level: Number(row.level), quiz: Number(row.quiz) }
    : parseQuizRef(row.quiz_id);
  const score = row.score ?? row.best_score ?? scoreFromStars(row.stars, row.completed);

  return {
    ...row,
    quiz_id: row.quiz_id || `${parsed.level}-${parsed.quiz}`,
    level: parsed.level,
    quiz: parsed.quiz,
    score,
    best_score: row.best_score ?? score,
    stars: row.stars ?? getStars(score),
    completed: Boolean(row.completed),
    attempts: row.attempts ?? 0,
    unlocked: Boolean(row.unlocked),
    last_played: row.last_played || row.completed_at || row.updated_at || row.created_at || null,
    updated_at: row.updated_at || row.completed_at || row.created_at || null,
  };
};

const parseQuizActivity = (activity, userId, index = 0) => {
  const name = activity.activity_name || '';
  const quizMatch = name.match(/level\s+(\d+).*quiz\s+(\d+)/i);
  const scoreMatch = name.match(/score\s+(\d+)\s*\/?\s*100/i) || name.match(/(\d+)\s*\/\s*100/i);
  if (!scoreMatch) return null;

  const level = quizMatch ? Number(quizMatch[1]) : 1;
  const quiz = quizMatch ? Number(quizMatch[2]) : index + 1;
  const score = scoreMatch ? Math.min(Number(scoreMatch[1]), 100) : 0;
  const stars = getStars(score);

  return {
    id: activity.id,
    user_id: userId,
    quiz_id: encodeLegacyQuizId(level, quiz),
    level,
    quiz,
    level_id: level,
    score,
    best_score: score,
    correct_answers: Math.round(score / 10),
    total_questions: 10,
    stars,
    completed: score >= PASSING_SCORE,
    attempts: 1,
    unlocked: true,
    time_taken: 0,
    last_played: activity.created_at,
    updated_at: activity.created_at,
    created_at: activity.created_at,
  };
};

const isValidPosition = (level, quiz = 1) =>
  Number.isInteger(level) &&
  Number.isInteger(quiz) &&
  level >= 1 &&
  level <= LEVEL_COUNT &&
  quiz >= 1 &&
  quiz <= QUIZZES_PER_LEVEL;

const getProgressSchema = async () => {
  if (cachedProgressSchema) return cachedProgressSchema;

  const modernColumns = 'id,user_id,level,quiz,score,best_score,stars,completed,attempts,unlocked,last_played,updated_at';
  const { error: modernError } = await supabase
    .from('quiz_progress')
    .select(modernColumns)
    .limit(1);

  cachedProgressSchema = modernError
    ? {
        type: 'legacy',
        columns: 'id,user_id,quiz_id,stars,completed,attempts,unlocked,xp,completed_at,created_at',
        conflict: 'user_id,quiz_id',
      }
    : {
        type: 'modern',
        columns: modernColumns,
        conflict: 'user_id,level,quiz',
      };

  return cachedProgressSchema;
};

const getProgressRows = async (userId, db = supabase) => {
  if (!userId) return [];
  const schema = await getProgressSchema();

  let query = db
    .from('quiz_progress')
    .select(schema.columns)
    .eq('user_id', userId);

  if (schema.type === 'modern') {
    query = query.order('level', { ascending: true }).order('quiz', { ascending: true });
  } else {
    query = query.order('quiz_id', { ascending: true });
  }

  const { data, error } = await query;

  if (error) throw error;
  const rows = (data || [])
    .map(normalizeProgressRow)
    .filter((row) => isValidPosition(row.level, row.quiz))
    .sort((a, b) => a.level - b.level || a.quiz - b.quiz);

  if (rows.length) return rows;

  const { data: activities, error: activityError } = await db
    .from('user_activities')
    .select('id, activity_name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (activityError) return rows;

  const bestByQuiz = new Map();
  (activities || [])
    .filter((activity) => activity.activity_name?.toLowerCase().includes('quiz'))
    .map((activity, index) => parseQuizActivity(activity, userId, index))
    .filter(Boolean)
    .filter((row) => isValidPosition(row.level, row.quiz))
    .forEach((row) => {
      const key = `${row.level}-${row.quiz}`;
      const current = bestByQuiz.get(key);
      if (!current || row.score > current.score) bestByQuiz.set(key, row);
    });

  return Array.from(bestByQuiz.values()).sort((a, b) => a.level - b.level || a.quiz - b.quiz);
};

const findProgress = (progress, level, quiz) =>
  progress.find((item) => item.level === level && item.quiz === quiz);

const isQuizCompleted = (progress, level, quiz) => {
  const row = findProgress(progress, level, quiz);
  return Boolean(row?.completed && (row.best_score ?? row.score ?? 0) >= PASSING_SCORE);
};

const isLevelUnlocked = (progress, level) => {
  if (level === 1) return true;

  for (let quiz = 1; quiz <= QUIZZES_PER_LEVEL; quiz += 1) {
    if (!isQuizCompleted(progress, level - 1, quiz)) return false;
  }

  return true;
};

const isQuizUnlocked = (progress, level, quiz) => {
  if (!isLevelUnlocked(progress, level)) return false;
  if (quiz === 1) return true;
  return isQuizCompleted(progress, level, quiz - 1);
};

const buildLevelPayload = (progress) =>
  levels.map((level) => {
    const completedQuizzes = Array.from({ length: QUIZZES_PER_LEVEL }).filter((_, index) =>
      isQuizCompleted(progress, level.id, index + 1)
    ).length;

    return {
      ...level,
      unlocked: isLevelUnlocked(progress, level.id),
      completed: completedQuizzes === QUIZZES_PER_LEVEL,
      completedQuizzes,
      totalQuizzes: QUIZZES_PER_LEVEL,
    };
  });

const buildQuizPayload = (progress, level) =>
  Array.from({ length: QUIZZES_PER_LEVEL }).map((_, index) => {
    const quiz = index + 1;
    const row = findProgress(progress, level, quiz);
    const bestScore = row?.best_score ?? row?.score ?? 0;

    return {
      id: `${level}-${quiz}`,
      level,
      quiz,
      title: `Quiz ${quiz}`,
      questionCount: 10,
      unlocked: isQuizUnlocked(progress, level, quiz),
      completed: Boolean(row?.completed),
      score: row?.score ?? 0,
      bestScore,
      stars: row?.stars ?? getStars(bestScore),
      attempts: row?.attempts ?? 0,
      lastPlayed: row?.last_played || row?.updated_at || null,
    };
  });

const normalizeAnswerRows = (answers, correctById) =>
  answers.map((answer) => {
    const correctAnswer = correctById.get(answer.questionId)?.index;
    return {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer,
      isCorrect: correctAnswer === answer.selectedAnswer,
    };
  });

const selectedAnswerIsCorrect = (answer, correct) => {
  if (!correct) return false;
  
  // Cast both to Number for reliable comparison of numeric indexes
  const selected = Number(answer.selectedAnswer);
  const target = Number(correct.index);
  if (!isNaN(selected) && !isNaN(target) && selected === target) return true;

  if (typeof answer.selectedAnswerText === 'string' && typeof correct.value === 'string') {
    return answer.selectedAnswerText.trim().toLowerCase() === correct.value.trim().toLowerCase();
  }
  return false;
};

const updateStreak = async (userId, db = supabase) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const { data: streak } = await db
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];
    const lastDate = streak?.last_active_date ? new Date(streak.last_active_date).toISOString().split('T')[0] : null;

    let nextCount;
    if (lastDate === today) {
      nextCount = streak?.current_streak || 1;
    } else if (lastDate === yesterday) {
      nextCount = (streak?.current_streak || 0) + 1;
    } else {
      nextCount = 1;
    }

    const longestStreak = Math.max(nextCount, streak?.longest_streak || 0);

    const payload = {
      user_id: userId,
      current_streak: nextCount,
      longest_streak: longestStreak,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    };

    let { error: upsertError } = await db.from('user_streaks').upsert(payload, { onConflict: 'user_id' });

    // If longest_streak column doesn't exist yet, retry without it
    if (upsertError && upsertError.message?.includes('longest_streak')) {
      const { longest_streak: _ls, ...fallbackPayload } = payload;
      ({ error: upsertError } = await db.from('user_streaks').upsert(fallbackPayload, { onConflict: 'user_id' }));
    }

    if (upsertError) {
      console.warn('[Streak Warning] Upsert failed:', upsertError.message);
    }

    return { currentStreak: nextCount, longestStreak };
  } catch (error) {
    console.warn('[Streak Warning]', error.message);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

const getActivitySchema = async () => {
  if (cachedActivitySchema) return cachedActivitySchema;

  const { error } = await supabase
    .from('user_activities')
    .select('user_id,activity_name,activity_type,details,created_at')
    .limit(1);

  cachedActivitySchema = error ? 'minimal' : 'full';
  return cachedActivitySchema;
};

const logQuizActivity = async (userId, level, quiz, score, stars, correct, total, db = supabase) => {
  try {
    const schema = await getActivitySchema();
    const payload = {
      user_id: userId,
      activity_name: `Quiz Level ${level} - Quiz ${quiz} Completed - Score ${score}/100`,
      created_at: new Date().toISOString(),
    };

    if (schema === 'full') {
      payload.activity_type = 'quiz_completed';
      payload.details = { level, quiz, score, stars, correct, total };
    }

    const { error } = await db.from('user_activities').insert(payload);
    if (error) console.warn('[Quiz Activity Warning]', error.message);
  } catch (error) {
    console.warn('[Quiz Activity Warning]', error.message);
  }
};

const insertQuizAttempt = async ({
  db = supabase,
  userId,
  level,
  quiz,
  score,
  correctCount,
  totalQuestions,
  stars,
  timeTaken,
  detailedAnswers,
}) => {
  const basePayload = {
    user_id: userId,
    level_id: level,
    score,
    correct_answers: correctCount,
    total_questions: totalQuestions,
    stars,
    time_taken: Math.round(timeTaken),
    answers: detailedAnswers,
  };
  const textQuizId = `${level}-${quiz}`;

  const insertAttempt = (quizId) =>
    db
      .from('quiz_attempts')
      .insert({ ...basePayload, quiz_id: quizId })
      .select('*')
      .single();

  let { data, error } = await insertAttempt(textQuizId);
  if (error && error.message?.includes('invalid input syntax for type bigint')) {
    ({ data, error } = await insertAttempt(quiz));
  }

  if (error) {
    console.warn('[Quiz Submit Warning] Failed to insert attempt:', error.message);
    return null;
  }

  return data;
};

exports.getLevels = async (req, res) => {
  try {
    const progress = await getProgressRows(req.query.userId, getRequestSupabase(req));
    res.json({ success: true, data: buildLevelPayload(progress) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    const db = getRequestSupabase(req);
    const level = Number(req.params.levelId);
    if (!isValidPosition(level, 1)) {
      return res.status(400).json({ success: false, error: 'Valid levelId is required' });
    }

    const progress = await getProgressRows(req.query.userId, db);
    res.json({ success: true, data: buildQuizPayload(progress, level) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const parsed = req.params.quizId
      ? parseQuizRef(req.params.quizId, req.query.quiz)
      : parseQuizRef(req.params.levelId || req.query.level, req.query.quiz);
    const { level, quiz } = parsed;

    if (!isValidPosition(level, quiz)) {
      return res.status(400).json({ success: false, error: 'Valid quiz id is required. Use /questions/1-1.' });
    }

    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, level, quiz, question, options, correct_answer')
      .eq('level', level)
      .eq('quiz', quiz)
      .order('id', { ascending: true })
      .limit(10);

    if (error) throw error;

    const questions = data?.length ? data.map(toClientQuestion) : getFallbackQuestions(level, quiz).map(toClientQuestion);
    res.json({ success: true, data: questions.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const db = getRequestSupabase(req);
    const userId = req.params.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const progress = await getProgressRows(userId, db);
    res.json({
      success: true,
      data: progress,
      levels: buildLevelPayload(progress),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const db = getRequestSupabase(req);
    const { userId, answers } = req.body;
    const timeTaken = Math.max(Number(req.body.timeTaken || req.body.time_taken || 0), 0);
    const parsed = req.body.quizId
      ? parseQuizRef(req.body.quizId)
      : parseQuizRef(req.body.level ?? req.body.levelId, req.body.quiz);
    const { level, quiz } = parsed;

    if (!userId || !isValidPosition(level, quiz) || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'userId, quizId, and answers are required' });
    }

    const questionIds = answers.map((answer) => Number(answer.questionId)).filter(id => !isNaN(id));
    if (!questionIds.length) {
      return res.status(400).json({ success: false, error: 'At least one valid answer is required' });
    }

    const { data: questions, error: questionsError } = await db
      .from('quiz_questions')
      .select('id, options, correct_answer')
      .eq('level', level)
      .eq('quiz', quiz)
      .in('id', questionIds);

    if (questionsError) throw questionsError;

    const fallbackQuestions = getFallbackQuestions(level, quiz);
    const correctById = new Map();
    
    // Fill map with fallback values first
    fallbackQuestions.forEach(q => {
      correctById.set(Number(q.id), {
        index: q.correct_answer,
        value: q.options?.[q.correct_answer],
      });
    });

    // Override with database values
    (questions || []).forEach(q => {
      correctById.set(Number(q.id), {
        index: q.correct_answer,
        value: q.options?.[q.correct_answer],
      });
    });

    const correctCount = answers.reduce((total, answer) => {
      const qId = Number(answer.questionId);
      const isCorrect = selectedAnswerIsCorrect(answer, correctById.get(qId));
      console.log(`[Submit] Question ${qId}: Selected=${answer.selectedAnswer} (${answer.selectedAnswerText}) Correct=${isCorrect}`);
      return total + (isCorrect ? 1 : 0);
    }, 0);

    const totalQuestions = 10; 
    const score = correctCount * 10; // Strictly 10 marks per correct answer
    console.log(`[Submit] Final: Correct=${correctCount}/${totalQuestions} Score=${score}`);
    
    const stars = getStars(score);
    const completed = score >= PASSING_SCORE;

    const progressSchema = await getProgressSchema();
    let existingQuery = db
      .from('quiz_progress')
      .select(progressSchema.columns)
      .eq('user_id', userId);

    if (progressSchema.type === 'modern') {
      existingQuery = existingQuery.eq('level', level).eq('quiz', quiz);
    } else {
      existingQuery = existingQuery.eq('quiz_id', encodeLegacyQuizId(level, quiz));
    }

    let { data: existingRow, error: existingError } = await existingQuery.maybeSingle();

    if (existingError && isRlsError(existingError)) {
      console.warn('[Quiz Submit Warning] Progress lookup blocked by RLS; returning local result if save is also blocked.');
      existingRow = null;
      existingError = null;
    }
    if (existingError) throw existingError;

    const existingProgress = existingRow ? normalizeProgressRow(existingRow) : null;
    const bestScore = Math.max(score, existingProgress?.best_score ?? existingProgress?.score ?? 0);
    const now = new Date().toISOString();
    const progressPayload = progressSchema.type === 'modern'
      ? {
          user_id: userId,
          level,
          quiz,
          score,
          best_score: bestScore,
          stars: Math.max(stars, existingProgress?.stars || 0),
          completed: completed || Boolean(existingProgress?.completed),
          attempts: (existingProgress?.attempts || 0) + 1,
          unlocked: true,
          last_played: now,
          updated_at: now,
        }
      : {
          user_id: userId,
          quiz_id: encodeLegacyQuizId(level, quiz),
          stars: Math.max(stars, existingProgress?.stars || 0),
          completed: completed || Boolean(existingProgress?.completed),
          attempts: (existingProgress?.attempts || 0) + 1,
          unlocked: true,
          xp: Math.max(existingRow?.xp || 0, correctCount * 10),
          completed_at: completed ? now : existingRow?.completed_at || null,
        };

    const { data, error } = await db
      .from('quiz_progress')
      .upsert(progressPayload, { onConflict: progressSchema.conflict })
      .select(progressSchema.columns)
      .single();

    const localProgress = normalizeProgressRow({
      user_id: userId,
      quiz_id: encodeLegacyQuizId(level, quiz),
      level,
      quiz,
      score,
      best_score: bestScore,
      stars: Math.max(stars, existingProgress?.stars || 0),
      completed: completed || Boolean(existingProgress?.completed),
      attempts: (existingProgress?.attempts || 0) + 1,
      unlocked: true,
      last_played: now,
      updated_at: now,
    });

    if (error && isRlsError(error)) {
      console.warn('[Quiz Submit Warning] Progress save blocked by RLS; returning local result.');
      await logQuizActivity(userId, level, quiz, score, stars, correctCount, totalQuestions, db);
      return res.json({
        success: true,
        data: localProgress,
        score,
        bestScore,
        stars,
        xp: correctCount * 10,
        passed: completed,
        attempt: null,
        streak: { currentStreak: 0, longestStreak: 0 },
        saved: false,
        unlockedQuizzes: buildQuizPayload([localProgress], level),
        levels: buildLevelPayload([localProgress]),
      });
    }
    if (error) throw error;
    const savedProgress = normalizeProgressRow(data);

    const streak = await updateStreak(userId, db);
    const detailedAnswers = normalizeAnswerRows(answers, correctById);
    const attempt = await insertQuizAttempt({
      db,
      userId,
      level,
      quiz,
      score,
      correctCount,
      totalQuestions,
      stars,
      timeTaken,
      detailedAnswers,
    });

    await logQuizActivity(userId, level, quiz, score, stars, correctCount, totalQuestions, db);

    const progress = await getProgressRows(userId, db);
    const profile = await syncProfileQuizScore(userId, progress, db);
    res.json({
      success: true,
      data: savedProgress,
      score,
      correctCount,
      totalQuestions,
      bestScore,
      stars,
      xp: (correctCount || 0) * 10,
      passed: completed,
      attempt: attempt || null,
      streak,
      profile,
      unlockedQuizzes: buildQuizPayload(progress, level),
      levels: buildLevelPayload(progress),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuizHistory = async (req, res) => {
  try {
    const { userId, quizId } = req.params;
    const levelId = req.query.levelId || req.query.level;
    const queryQuizId = quizId || req.query.quizId;
    const limit = Math.min(Number(req.query.limit || 100), 250);

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (levelId) query = query.eq('level_id', Number(levelId));
    if (queryQuizId) query = query.eq('quiz_id', queryQuizId);

    const { data, error } = await query;
    if (error && isMissingTableError(error, 'quiz_attempts')) {
      return res.json({
        success: true,
        data: [],
        meta: {
          totalAttempts: 0,
          averageScore: 0,
          bestByQuiz: {},
        },
      });
    }
    if (error) throw error;

    const attempts = data || [];
    const bestByQuiz = attempts.reduce((acc, attempt) => {
      const current = acc[attempt.quiz_id];
      if (!current || attempt.score > current.score) acc[attempt.quiz_id] = attempt;
      return acc;
    }, {});
    const averageScore = attempts.length
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length)
      : 0;

    res.json({
      success: true,
      data: attempts,
      meta: {
        totalAttempts: attempts.length,
        averageScore,
        bestByQuiz,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const db = getRequestSupabase(req);
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const { data: attempts, error: attemptsError } = await db
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (attemptsError) {
      console.error('[User Stats Error] Failed to fetch attempts:', attemptsError);
      throw attemptsError;
    }

    let { data: streak, error: streakError } = await db
      .from('user_streaks')
      .select('current_streak, longest_streak, last_active_date')
      .eq('user_id', userId)
      .maybeSingle();

    // If longest_streak column doesn't exist, retry without it
    if (streakError && streakError.message?.includes('longest_streak')) {
      ({ data: streak, error: streakError } = await db
        .from('user_streaks')
        .select('current_streak, last_active_date')
        .eq('user_id', userId)
        .maybeSingle());
    }

    if (streakError) {
      console.warn('[User Stats Warning] Failed to fetch streaks:', streakError.message);
      streak = null;
    }

    // Automatically create a default row if missing
    if (!streak) {
      const { data: newStreak, error: createError } = await db
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 0,
          last_active_date: null,
        })
        .select('current_streak, last_active_date')
        .single();
      
      if (createError) {
        console.warn('[User Stats Warning] Failed to create default streak:', createError.message);
        streak = { current_streak: 0, longest_streak: 0, last_active_date: null };
      } else {
        streak = newStreak;
      }
    }

    // Validate current streak — if last_active_date is stale, the streak is broken
    if (streak && streak.last_active_date) {
      const lastDate = new Date(streak.last_active_date).toISOString().split('T')[0];
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      if (lastDate !== today && lastDate !== yesterday) {
        // Streak is broken — reset to 0 in response
        streak.current_streak = 0;
      }
    }

    let rows = attempts || [];
    if (!rows.length) {
      rows = (await getProgressRows(userId, db))
        .filter((item) => item.completed || item.attempts > 0)
        .map((item) => ({
          id: item.id || item.quiz_id,
          user_id: item.user_id,
          level_id: item.level,
          quiz_id: item.quiz_id || `${item.level}-${item.quiz}`,
          score: item.score || item.best_score || scoreFromStars(item.stars, item.completed),
          correct_answers: Math.round(((item.score || item.best_score || 0) / 100) * 10),
          total_questions: 10,
          stars: item.stars || 0,
          time_taken: 0,
          created_at: item.last_played || item.updated_at || item.created_at || new Date().toISOString(),
        }));
    }
    if (!rows.length) {
      const { data: activities } = await db
        .from('user_activities')
        .select('id, activity_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      rows = (activities || [])
        .filter((activity) => activity.activity_name?.toLowerCase().includes('quiz'))
        .map((activity, index) => parseQuizActivity(activity, userId, index))
        .filter(Boolean);
    }
    const totalAttempts = rows.length;
    const averageScore = totalAttempts
      ? Math.round(rows.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
      : 0;
    const bestScore = totalAttempts
      ? Math.max(...rows.map((attempt) => attempt.score))
      : 0;
    const totalXp = rows.reduce((sum, attempt) => sum + (attempt.correct_answers || 0) * 10 + (attempt.stars || 0) * 25, 0);
    const perfectScores = rows.filter((attempt) => attempt.score === 100).length;

    // Achievement logic
    const achievements = [
      { id: 'first_quiz', unlocked: totalAttempts >= 1 },
      { id: 'perfect_score', unlocked: perfectScores >= 1 },
      { id: 'streak_5', unlocked: (streak?.current_streak || 0) >= 5 },
      { id: 'xp_1000', unlocked: totalXp >= 1000 }
    ];

    res.json({
      success: true,
      data: {
        totalAttempts,
        averageScore,
        bestScore,
        totalXp,
        perfectScores,
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || streak?.current_streak || 0,
        lastActiveDate: streak?.last_active_date || null,
        recentAttempts: rows.slice(0, 5),
        achievements
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
