import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import type { QuizQuestion } from './types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  onAnswer: (answer: number) => void;
  onNext: () => void;
  onBack: () => void;
  timeLeft: number;
  levelNumber: number;
  quizNumber: number;
}

export const QuizQuestionCard = ({
  question,
  index,
  total,
  selectedAnswer,
  isAnswered,
  onAnswer,
  onNext,
  onBack,
  timeLeft,
  levelNumber,
  quizNumber,
}: QuizQuestionCardProps) => {
  const progress = ((index + 1) / total) * 100;
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 text-white"
    >
      {/* Top Bar */}
      <div className="mb-12 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#151515] px-4 py-2 text-sm font-black text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Quizzes
        </button>
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 font-black text-white">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Sub Header */}
      <div className="mb-6 flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-500">
        <span>Level {levelNumber}. Quiz {quizNumber}. Question {index + 1}/{total}</span>
        <span>{Math.round(progress)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-12 h-1.5 w-full rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full rounded-full bg-saffron"
        />
      </div>

      {/* Question Container */}
      <div className="flex-1 rounded-[2.5rem] bg-[#111] p-8 md:p-12">
        <h2 className="mb-12 text-3xl font-black leading-tight text-white md:text-5xl">
          {question.question}
        </h2>

        <div className="grid gap-4">
          {question.options.map((option, optionIndex) => {
            const isSelected = selectedAnswer === optionIndex;
            const revealCorrect = isAnswered && optionIndex === question.correctAnswer;
            const revealWrong = isAnswered && isSelected && optionIndex !== question.correctAnswer;

            return (
              <button
                key={option}
                disabled={isAnswered}
                onClick={() => onAnswer(optionIndex)}
                className={`group flex min-h-20 items-center justify-between rounded-3xl border p-6 text-left text-lg font-black transition-all ${
                  revealCorrect
                    ? 'border-green-500 bg-green-500 text-white'
                    : revealWrong
                    ? 'border-red-500 bg-red-500 text-white'
                    : isSelected
                    ? 'border-saffron bg-saffron/10 text-saffron'
                    : 'border-white/5 bg-[#0a0a0a] text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <span>{option}</span>
                {revealCorrect && <CheckCircle2 className="h-6 w-6" />}
                {revealWrong && <XCircle className="h-6 w-6" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Bar */}
      {isAnswered && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`mt-8 flex items-center justify-between rounded-[2rem] p-6 ${
            isCorrect ? 'bg-green-600/90' : 'bg-red-600/90'
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xl font-black">
              {isCorrect ? 'Correct! +10 XP' : 'Incorrect'}
            </span>
            <span className="text-sm font-bold opacity-80">
              Correct answer: {question.options[question.correctAnswer]}
            </span>
          </div>
          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-2xl bg-white px-8 py-3 font-black text-black transition hover:scale-105"
          >
            {index === total - 1 ? 'Finish' : 'Next'} <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
