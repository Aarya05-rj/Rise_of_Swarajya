import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { HelpCircle, Clock, Trophy, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
}

export const Quiz: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'start' | 'quiz' | 'result'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "At which temple was the sacred oath of Swarajya taken in 1645?",
      options: ["Tuljapur", "Raireshwar", "Jejuri", "Trimbakeshwar"],
      answer: 1
    },
    {
      id: 2,
      question: "Which fort was the first to be captured by Shivaji Maharaj in 1646?",
      options: ["Raigad", "Torna", "Shivneri", "Sinhagad"],
      answer: 1
    },
    {
      id: 3,
      question: "Who was the rearguard commander who sacrificed his life at Pavankhind in 1660?",
      options: ["Tanaji Malusare", "Baji Prabhu Deshpande", "Netaji Palkar", "Yesaji Kank"],
      answer: 1
    },
    {
      id: 4,
      question: "In which year did the daring midnight raid on Shaista Khan take place in Pune?",
      options: ["1659", "1663", "1666", "1674"],
      answer: 1
    },
    {
      id: 5,
      question: "Which wealthy Mughal port city was raided by Shivaji Maharaj in 1664 to fund Swarajya?",
      options: ["Surat", "Goa", "Mumbai", "Kochi"],
      answer: 0
    },
    {
      id: 6,
      question: "From which Mughal city did Shivaji Maharaj make his miraculous escape in sweet baskets?",
      options: ["Delhi", "Agra", "Aurangabad", "Burhanpur"],
      answer: 1
    },
    {
      id: 7,
      question: "Who famously said 'The Fort is won, but the Lion is gone' after the capture of Sinhagad?",
      options: ["Jijabai", "Shivaji Maharaj", "Sambhaji Maharaj", "Soyarabai"],
      answer: 1
    },
    {
      id: 8,
      question: "On which date in 1674 was Shivaji Maharaj formally crowned as Chhatrapati at Raigad?",
      options: ["January 1", "April 15", "June 6", "October 24"],
      answer: 2
    },
    {
      id: 9,
      question: "What was the name of the grand Southern Campaign led by Maharaj in 1677?",
      options: ["Dakshin Digvijay", "Konkan Conquest", "Gondwana Raid", "Carnatic March"],
      answer: 0
    },
    {
      id: 10,
      question: "At which fort did Chhatrapati Shivaji Maharaj pass away in 1680?",
      options: ["Shivneri", "Pratapgad", "Raigad", "Sindhudurg"],
      answer: 2
    }
  ];

  useEffect(() => {
    let timer: any;
    if (currentStep === 'quiz' && timeLeft > 0 && !isAnswered) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(-1); // Timeout
    }
    return () => clearInterval(timer);
  }, [currentStep, timeLeft, isAnswered]);

  const handleStart = () => {
    setCurrentStep('quiz');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQuestion].answer) {
      setScore(prev => prev + 100);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(30);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setCurrentStep('result');
    
    if (user) {
      try {
        // 1. Update Score and Rank via Backend
        await fetch('http://localhost:5000/api/update-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, score: score })
        });

        // 2. Log Activity via Backend
        await fetch('http://localhost:5000/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            activity_name: `Victory! Earned ${score} XP in Quiz`,
            score_boost: 0 // Score already updated above
          })
        });

      } catch (err) {
        console.error('Error syncing quiz results:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {currentStep === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-md w-full text-center p-12 bg-[#111] border border-white/5 rounded-[3rem]"
            >
              <div className="w-20 h-20 bg-saffron/10 rounded-3xl mx-auto mb-8 flex items-center justify-center text-saffron">
                <HelpCircle className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black text-white mb-4">Historical Wisdom</h1>
              <p className="text-gray-500 font-light mb-10 leading-relaxed">Prove your knowledge of the Maratha Empire. 4 Questions, 30 seconds each.</p>
              <button 
                onClick={handleStart}
                className="w-full py-5 bg-saffron text-black font-black text-lg rounded-2xl hover:bg-saffron-light transition-all flex items-center justify-center group"
              >
                Begin Quest
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {currentStep === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl w-full"
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-xs font-black tracking-[0.2em] text-saffron uppercase mb-2">Question {currentQuestion + 1} of {questions.length}</p>
                  <div className="h-1.5 w-64 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-saffron"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    ></motion.div>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${timeLeft < 10 ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                  <Clock className={`w-4 h-4 ${timeLeft < 10 ? 'animate-pulse' : ''}`} />
                  <span className="font-mono font-bold">{timeLeft}s</span>
                </div>
              </div>

              <div className="bg-[#111] border border-white/5 p-12 rounded-[2.5rem] mb-8">
                <h2 className="text-2xl font-bold text-white mb-10 leading-snug">{questions[currentQuestion].question}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {questions[currentQuestion].options.map((option, i) => (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(i)}
                      className={`p-6 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                        selectedOption === i 
                          ? (i === questions[currentQuestion].answer ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-red-500/20 border-red-500 text-red-500')
                          : (isAnswered && i === questions[currentQuestion].answer ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-saffron/30 hover:text-white')
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                      {isAnswered && i === questions[currentQuestion].answer && <CheckCircle2 className="w-5 h-5" />}
                      {isAnswered && selectedOption === i && i !== questions[currentQuestion].answer && <XCircle className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>

              {isAnswered && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={nextQuestion}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center group border border-white/10"
                >
                  {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              )}
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full text-center p-12 bg-[#111] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,164,96,0.1),transparent_70%)]"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-saffron/20 rounded-full mx-auto mb-8 flex items-center justify-center text-saffron relative">
                  <Trophy className="w-12 h-12" />
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-saffron/30 rounded-full"
                  ></motion.div>
                </div>
                
                <h2 className="text-4xl font-black text-white mb-2">QUEST COMPLETE</h2>
                <p className="text-gray-500 font-light mb-10">You've earned your honors, Warrior.</p>
                
                <div className="p-8 bg-white/5 rounded-3xl mb-10 border border-white/5">
                  <p className="text-xs font-black tracking-widest text-gray-500 uppercase mb-2">Total Score</p>
                  <p className="text-6xl font-black text-saffron">{score}</p>
                  <div className="mt-6 flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <StarIcon key={s} active={s <= (score / 100)} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleStart}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" /> Retake
                  </button>
                  <button 
                    onClick={() => setCurrentStep('start')}
                    className="flex-1 py-4 bg-saffron text-black font-black rounded-2xl hover:bg-saffron-light transition-all"
                  >
                    Finish
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const StarIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? 'text-saffron fill-saffron' : 'text-gray-800'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
