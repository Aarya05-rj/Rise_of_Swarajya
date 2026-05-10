import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { User, Shield, Star, X, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Character {
  id: string;
  name: string;
  title: string;
  role: string;
  description: string;
  history: string;
  achievements: string[];
  image_url: string; // Updated from image to image_url to match typical DB column
}

export const Characters: React.FC = () => {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/characters');
      if (!response.ok) throw new Error('Failed to fetch characters');
      
      const payload = await response.json();
      setCharacters(payload.data || payload || []);
    } catch (err) {
      console.error('Error fetching characters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCharSelect = async (char: Character) => {
    setSelectedChar(char);
    
    if (user) {
      try {
        await fetch('http://localhost:5000/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            activity_name: `Met Legend: ${char.name}`,
            score_boost: 5
          })
        });
      } catch (err) {
        console.error('Tracking Error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">LEGENDS OF <span className="text-saffron">MARATHA</span></h1>
          <p className="text-gray-500 font-light">Meet the brave souls who fought and sacrificed for the dream of Swarajya.</p>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-saffron animate-spin" />
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-20 bg-[#111] rounded-[3rem] border border-dashed border-white/10">
            <User className="w-16 h-16 text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500">No legends found in the archives.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {characters.map((char, i) => {
              // Check if image_url is a placeholder or real URL
              const hasRealImage = char.image_url && 
                                  char.image_url.startsWith('http') && 
                                  !char.image_url.includes('IMAGE_URL_');

              return (
                <motion.div
                  key={char.id || `char-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 text-center group cursor-pointer relative overflow-hidden transition-all hover:border-saffron/30"
                  onClick={() => handleCharSelect(char)}
                >
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-saffron/5 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-saffron/10 rounded-3xl mx-auto mb-6 flex items-center justify-center text-saffron group-hover:scale-110 transition-transform overflow-hidden">
                      {hasRealImage ? (
                        <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-white group-hover:text-saffron transition-colors">{char.name}</h3>
                    <p className="text-xs font-black tracking-widest text-gray-500 uppercase mb-4">{char.role}</p>
                    <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-2">{char.description}</p>
                    <div className="mt-6 flex justify-center space-x-2">
                      {[1, 2, 3].map(s => <Star key={s} className="w-3 h-3 text-saffron/30" />)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Character Detail Modal */}
        <AnimatePresence>
          {selectedChar && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
              onClick={() => setSelectedChar(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#111] border border-white/5 w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setSelectedChar(null)} className="absolute top-8 right-8 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all text-white">
                  <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5 bg-saffron/5 p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 bg-saffron/20 rounded-[2.5rem] flex items-center justify-center text-saffron mb-6 overflow-hidden">
                      {selectedChar.image_url && 
                       selectedChar.image_url.startsWith('http') && 
                       !selectedChar.image_url.includes('IMAGE_URL_') ? (
                        <img src={selectedChar.image_url} alt={selectedChar.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16" />
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">{selectedChar.name}</h2>
                    <p className="text-xs font-bold text-saffron tracking-widest uppercase mb-6">{selectedChar.title}</p>
                    
                    <div className="w-full space-y-3">
                      {Array.isArray(selectedChar.achievements) && selectedChar.achievements.map((ach, i) => (
                        <div key={i} className="bg-black/20 p-3 rounded-xl text-[10px] font-bold text-gray-400 flex items-center uppercase tracking-widest">
                          <Shield className="w-3 h-3 mr-2 text-saffron" /> {ach}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:w-3/5 p-12 overflow-y-auto max-h-[70vh]">
                    <h4 className="text-lg font-bold mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-saffron" /> Historical Legacy
                    </h4>
                    <p className="text-gray-400 font-light leading-relaxed text-lg mb-8">
                      {selectedChar.history}
                    </p>
                    <div className="p-6 bg-saffron/5 border border-saffron/10 rounded-2xl">
                      <p className="text-xs text-saffron font-bold uppercase tracking-widest mb-2">Quote / Creed</p>
                      <p className="text-white italic font-light">"Swarajya is the birthright of every soul born on this holy soil."</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
