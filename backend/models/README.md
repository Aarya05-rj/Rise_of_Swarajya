# Models
Database schema references for Supabase tables used in this project:

## Tables
- `profiles` - User profiles (id, full_name, total_score, rank, progress)
- `fort_images` - Fort data (id, name, description, image_url, location)
- `character_image` - Historical figures (id, name, title, role, description, history, achievements, image_url)
- `powada` - Ballads (id, title, singer, audio_url, lyrics)
- `user_activities` - User action log (user_id, activity_type, timestamp, details)
- `quiz_results` - Quiz history (user_id, score, created_at)
- `quiz_questions` - Duolingo-style quiz bank (level, quiz, question, options, correct_answer)
- `quiz_progress` - Per-user quiz progress (user_id, level, quiz, score, stars, completed, updated_at)

## Quiz setup
Run `backend/sql/quiz_schema_seed.sql` in Supabase SQL Editor to create the quiz tables and seed Level 1 with 9 quizzes of 10 questions each.
