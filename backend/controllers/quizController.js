const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

let cachedSeedQuestions = null;

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

const getFallbackQuestions = (level, quiz) =>
  getSeedQuestions()
    .filter((question) => question.level === level && question.quiz === quiz)
    .map((question, index) => ({
      id: level * 1000 + quiz * 100 + index + 1,
      ...question,
    }));

const getStars = (score) => {
  if (score >= 9) return 3;
  if (score >= 7) return 2;
  if (score >= 5) return 1;
  return 0;
};

const toClientQuestion = (question) => ({
  id: question.id,
  level: question.level,
  quiz: question.quiz,
  question: question.question,
  options: question.options,
  correctAnswer: question.correct_answer,
});

exports.getQuestions = async (req, res) => {
  try {
    const level = Number(req.query.level);
    const quiz = Number(req.query.quiz);

    if (!Number.isInteger(level) || !Number.isInteger(quiz) || level < 1 || quiz < 1) {
      return res.status(400).json({ success: false, error: 'Valid level and quiz query params are required' });
    }

    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, level, quiz, question, options, correct_answer')
      .eq('level', level)
      .eq('quiz', quiz)
      .order('id', { ascending: true });

    if (error) throw error;

    const questions = data?.length ? data.map(toClientQuestion) : getFallbackQuestions(level, quiz).map(toClientQuestion);

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const { data, error } = await supabase
      .from('quiz_progress')
      .select('user_id, level, quiz, score, stars, completed, updated_at')
      .eq('user_id', userId)
      .order('level', { ascending: true })
      .order('quiz', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { userId, level, quiz, answers } = req.body;

    if (!userId || !Number.isInteger(level) || !Number.isInteger(quiz) || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'userId, level, quiz, and answers are required' });
    }

    const questionIds = answers.map((answer) => answer.questionId).filter(Number.isInteger);
    if (!questionIds.length) {
      return res.status(400).json({ success: false, error: 'At least one answer is required' });
    }

    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer')
      .eq('level', level)
      .eq('quiz', quiz)
      .in('id', questionIds);

    if (questionsError) throw questionsError;

    const fallbackQuestions = getFallbackQuestions(level, quiz);
    const correctById = new Map([
      ...fallbackQuestions.map((question) => [question.id, question.correct_answer]),
      ...(questions || []).map((question) => [question.id, question.correct_answer]),
    ]);
    const score = answers.reduce((total, answer) => {
      return total + (correctById.get(answer.questionId) === answer.selectedAnswer ? 1 : 0);
    }, 0);
    const stars = getStars(score);
    const completed = stars > 0;

    const { data: existingProgress, error: existingError } = await supabase
      .from('quiz_progress')
      .select('score, stars, completed')
      .eq('user_id', userId)
      .eq('level', level)
      .eq('quiz', quiz)
      .maybeSingle();

    if (existingError) throw existingError;

    const progressPayload = {
      user_id: userId,
      level,
      quiz,
      score: Math.max(score, existingProgress?.score || 0),
      stars: Math.max(stars, existingProgress?.stars || 0),
      completed: completed || Boolean(existingProgress?.completed),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('quiz_progress')
      .upsert(progressPayload, { onConflict: 'user_id,level,quiz' })
      .select('user_id, level, quiz, score, stars, completed, updated_at')
      .single();

    if (error) throw error;

    await supabase.from('user_activities').insert({
      user_id: userId,
      activity_name: `Quiz Level ${level} - Quiz ${quiz} Completed`,
      activity_type: 'quiz_completed',
      details: { level, quiz, score, stars },
      created_at: new Date().toISOString(),
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
