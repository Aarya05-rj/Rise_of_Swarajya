import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { QuizQuestion } from './types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  onAnswer: (answer: number) => void;
  onNext: () => void;
}

export const QuizQuestionCard = ({
  question,
  index,
  total,
  selectedAnswer,
  isAnswered,
  onAnswer,
  onNext,
}: QuizQuestionCardProps) => {
  const progress = ((index + 1) / total) * 100;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-sm font-black text-cream/60">
          <span>Question {index + 1}/{total}</span>
          <span className="text-saffron">{Math.round(progress)}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-royal-gold to-saffron shadow-[0_0_18px_rgba(255,153,51,0.55)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-[2.25rem] border border-saffron/20 bg-[#26170d]/90 p-5 shadow-[0_0_45px_rgba(255,153,51,0.14)] md:p-8">
        <h2 className="mb-8 text-2xl font-black leading-snug text-cream md:text-4xl">{question.question}</h2>
        <div className="grid gap-4">
          {question.options.map((option, optionIndex) => {
            const correct = optionIndex === question.correctAnswer;
            const selected = selectedAnswer === optionIndex;
            const revealCorrect = isAnswered && correct;
            const revealWrong = isAnswered && selected && !correct;

            return (
              <button
                key={option}
                type="button"
                disabled={isAnswered}
                onClick={() => onAnswer(optionIndex)}
                className={`flex min-h-16 items-center justify-between rounded-3xl border px-5 py-4 text-left text-base font-black transition-all duration-300 md:text-lg ${
                  revealCorrect
                    ? 'border-green-400 bg-green-500/18 text-green-200'
                    : revealWrong
                      ? 'border-red-400 bg-red-500/18 text-red-200'
                      : selected
                        ? 'border-saffron bg-saffron/15 text-saffron'
                        : 'border-white/10 bg-black/20 text-cream/75 hover:scale-[1.015] hover:border-saffron/45 hover:text-cream'
                }`}
              >
                <span>{option}</span>
                {revealCorrect ? <CheckCircle2 className="h-6 w-6" /> : revealWrong ? <XCircle className="h-6 w-6" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          className="mt-6 w-full rounded-3xl bg-gradient-to-r from-saffron to-royal-gold px-6 py-5 text-lg font-black text-[#1A1A1A] shadow-[0_0_30px_rgba(255,153,51,0.35)] transition hover:scale-[1.015]"
        >
          {index === total - 1 ? 'Reveal Victory' : 'Continue'}
        </motion.button>
      )}
    </motion.div>
  );
};
