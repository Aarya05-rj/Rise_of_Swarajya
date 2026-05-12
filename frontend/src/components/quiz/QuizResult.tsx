import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, Sparkles, Star } from 'lucide-react';

interface QuizResultProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  bestScore: number;
  xpEarned: number;
  stars: number;
  canGoNext: boolean;
  onBack: () => void;
  onRetry: () => void;
  onNextQuiz: () => void;
}

export const QuizResult = ({ 
  score, 
  bestScore, 
  xpEarned, 
  stars, 
  canGoNext, 
  onBack, 
  onRetry, 
  onNextQuiz 
}: QuizResultProps) => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[480px] rounded-[2rem] border border-white/5 bg-[#111] p-8 text-center shadow-2xl md:p-12"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute left-1/2 top-8 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-white/10 bg-[#151515] px-4 py-2 text-xs font-black text-gray-500 transition hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>

      {/* Trophy Header */}
      <div className="mt-12 mb-6 flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3D2817] text-saffron shadow-lg">
          <Trophy className="h-10 w-10" />
        </div>
      </div>

      {/* Result Titles */}
      <div className="mb-10">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-saffron">Quiz Result</p>
        <h1 className="mt-2 text-5xl font-black text-white md:text-6xl">{score}/100</h1>
        <p className="mt-4 text-sm font-bold text-gray-500">
          {stars > 0 ? 'Quiz cleared. The next quiz is unlocked.' : 'Keep training to unlock the path.'}
        </p>
      </div>

      {/* Stars Section */}
      <div className="mb-12 flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            className={`h-8 w-8 ${s <= stars ? 'fill-saffron text-saffron' : 'text-white/10'}`}
          />
        ))}
      </div>

      {/* Stats Cards */}
      <div className="mb-12 grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white/5 p-6 text-center">
          <div className="mb-3 flex justify-center text-saffron">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-2xl font-black text-white">{xpEarned}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">XP Earned</p>
        </div>
        <div className="rounded-3xl bg-white/5 p-6 text-center">
          <div className="mb-3 flex justify-center text-saffron">
            <Trophy className="h-6 w-6" />
          </div>
          <p className="text-2xl font-black text-white">{bestScore}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Best Score</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onRetry}
          className="flex h-16 items-center justify-center rounded-2xl border border-white/10 bg-[#151515] font-black text-white transition hover:bg-[#1a1a1a]"
        >
          Retry
        </button>
        <button
          onClick={onNextQuiz}
          disabled={!canGoNext}
          className="flex h-16 items-center justify-center rounded-2xl bg-saffron font-black text-black transition hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
        >
          Continue
        </button>
      </div>
    </motion.div>
  </div>
);
