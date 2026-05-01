import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { ChevronRight, Shield, Map as MapIcon, Users, BookOpen, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <Shield className="w-8 h-8" />, title: 'Historical Accuracy', desc: 'Verified accounts of the Maratha Empire.' },
    { icon: <MapIcon className="w-8 h-8" />, title: 'Fort Exploration', desc: 'Interactive maps of legendary Maratha forts.' },
    { icon: <Users className="w-8 h-8" />, title: 'Great Leaders', desc: 'Biography of Chhatrapati Shivaji Maharaj & more.' },
    { icon: <BookOpen className="w-8 h-8" />, title: 'Interactive Quizzes', desc: 'Test your knowledge of the glorious history.' },
    { icon: <Music className="w-8 h-8" />, title: 'Powadas', desc: 'Authentic ballads of bravery and victory.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-saffron/5 rounded-full blur-[200px]"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-saffron/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 lg:py-0">
            {/* Left Column: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left w-full"
            >
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-10">
                <div className="h-px w-16 bg-saffron"></div>
                <span className="text-saffron font-black tracking-[0.4em] text-xs uppercase">Hindavi Swarajya Chronicles</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-[6.5rem] font-black mb-8 tracking-tighter leading-[0.85] text-white">
                RISE OF <br />
                <span className="text-saffron italic drop-shadow-[0_0_30px_rgba(244,164,96,0.3)]">SWARAJYA</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 mb-14 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                Immerse yourself in the legendary era of the Maratha Empire. A journey of honor, valor, and the founding of a great nation.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <button 
                  onClick={() => navigate('/register')}
                  className="group px-12 py-5 bg-saffron hover:bg-saffron-light text-black font-black text-xl rounded-2xl flex items-center transition-all hover:scale-105 shadow-[0_20px_50px_rgba(244,164,96,0.25)]"
                >
                  Start Quest
                  <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/timeline')}
                  className="px-12 py-5 border-2 border-white/5 hover:border-saffron/40 text-white font-bold text-xl rounded-2xl transition-all hover:bg-saffron/5 backdrop-blur-sm"
                >
                  Chronicles
                </button>
              </div>

              <div className="mt-20 grid grid-cols-3 gap-8 border-t border-white/5 pt-12 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-3xl lg:text-4xl font-black text-white">350+</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-saffron">Forts</p>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-black text-white">100k</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-saffron">Mavalas</p>
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-black text-white">1674</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-saffron">Empire</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Artwork */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full flex items-center justify-center"
            >
              <div className="absolute -inset-10 bg-saffron/20 rounded-full blur-[120px] animate-pulse"></div>
              
              <div className="relative z-10 w-full max-w-2xl aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(244,164,96,0.2)] group">
                <img 
                  src="/hero_shivaji_new.jpg" 
                  alt="Chhatrapati Shivaji Maharaj" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent opacity-60"></div>
              </div>
              
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 lg:-left-12 bg-[#111]/90 backdrop-blur-md border border-saffron/30 p-6 rounded-[2rem] shadow-2xl z-20"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-saffron/10 rounded-2xl flex items-center justify-center text-saffron">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-saffron uppercase tracking-[0.3em] mb-1">Founder</p>
                    <p className="text-xl font-black text-white leading-tight">HINDAVI <br/>SWARAJYA</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#0d0d0d] border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Core Modules</h2>
            <div className="h-1 w-20 bg-saffron mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-[#151515] rounded-3xl border border-white/5 hover:border-saffron/30 transition-all group"
              >
                <div className="mb-6 p-4 bg-saffron/10 rounded-2xl w-fit group-hover:bg-saffron/20 transition-colors text-saffron">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 text-center text-gray-500 font-light">
          <p>© 2026 Rise of Swarajya. Built with honor and respect for Maratha History.</p>
        </div>
      </footer>
    </div>
  );
};
