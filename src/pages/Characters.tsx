import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { User, Shield, Star, X, Info, Loader2, Sword, Award, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { legendaryCharacters, type Character } from '../data/charactersData';
import { supabase } from '../services/supabaseClient';

export const Characters: React.FC = () => {
  const { user, session } = useAuth();
  const [characters, setCharacters] = useState<Character[]>(legendaryCharacters);
  const [loading, setLoading] = useState(true);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      // Direct Supabase Interconnection
      const { data: dbData, error } = await supabase
        .from('characters')
        .select('*');

      if (error) {
        console.warn('Supabase fetch error, trying backend API:', error.message);
        const response = await fetch('/api/characters');
        if (!response.ok) throw new Error('Failed to fetch characters from API');
        const payload = await response.json();
        const apiData: Character[] = payload.data || payload || [];
        processCharacterData(apiData);
      } else if (dbData && dbData.length > 0) {
        processCharacterData(dbData);
      } else {
        setCharacters(legendaryCharacters);
      }
    } catch (err) {
      console.error('Error fetching characters:', err);
      setCharacters(legendaryCharacters);
    } finally {
      setLoading(false);
    }
  };

  const processCharacterData = (apiData: any[]) => {
    // Smart Merge: Enrich API data with our high-quality local records
    const merged = apiData.map(apiChar => {
      const localMatch = legendaryCharacters.find(l => 
        l.id === apiChar.id ||
        l.name.toLowerCase().includes(apiChar.name.toLowerCase()) || 
        apiChar.name.toLowerCase().includes(l.name.toLowerCase())
      );
      
      if (localMatch) {
        const isInvalid = (val: any) => !val || val === 'Unknown' || (typeof val === 'string' && val.trim() === '');
        return {
          ...localMatch,
          ...apiChar,
          history: isInvalid(apiChar.history) ? localMatch.history : apiChar.history,
          description: isInvalid(apiChar.description) ? localMatch.description : apiChar.description,
          achievements: !apiChar.achievements || apiChar.achievements.length === 0 ? localMatch.achievements : apiChar.achievements,
          image_url: isInvalid(apiChar.image_url) || apiChar.image_url.includes('IMAGE_URL') ? localMatch.image_url : apiChar.image_url,
          wars: !apiChar.wars || apiChar.wars.length === 0 ? (localMatch.wars || []) : apiChar.wars,
          born: apiChar.born || localMatch.born,
          died: apiChar.died || localMatch.died,
          quote: apiChar.quote || localMatch.quote
        };
      }
      return apiChar;
    });

    // Add local characters that aren't in the API, avoiding duplicates
    const finalCharacters = [...merged];
    legendaryCharacters.forEach(localChar => {
      if (!finalCharacters.some(f => f.id === localChar.id || f.name.toLowerCase().includes(localChar.name.split(' ')[0].toLowerCase()))) {
        finalCharacters.push(localChar);
      }
    });

    setCharacters(finalCharacters);
  };

  const handleCharSelect = async (char: Character) => {
    setSelectedChar(char);
    
    if (user) {
      try {
        await fetch('/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
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
          <div className="flex items-center space-x-4 mb-2">
            <Award className="w-8 h-8 text-saffron" />
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Legends of <span className="text-saffron">Maratha</span></h1>
          </div>
          <p className="text-gray-500 font-light max-w-2xl">Meet the brave souls who fought and sacrificed for the dream of Swarajya. Their valor shaped the destiny of an empire.</p>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-saffron animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((char, i) => (
              <motion.div
                key={char.id || `char-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[3rem] p-8 text-center group cursor-pointer overflow-hidden transition-all hover:border-saffron/30 shadow-2xl"
                onClick={() => handleCharSelect(char)}
              >
                {/* Lifespan Side-Badge */}
                <div className="absolute top-8 right-8 flex flex-col items-end opacity-20 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-0 translate-x-4">
                  <span className="text-[10px] font-black text-saffron tracking-widest">{char.born || '16xx'}</span>
                  <div className="h-px w-6 bg-saffron/20 my-1"></div>
                  <span className="text-[10px] font-black text-white/40 tracking-widest">{char.died || '16xx'}</span>
                </div>

                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-saffron/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="w-28 h-28 bg-saffron/10 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center text-saffron group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 overflow-hidden border border-saffron/20 shadow-inner group-hover:shadow-saffron/20">
                    {char.image_url ? (
                      <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-14 h-14" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 text-white group-hover:text-saffron transition-colors tracking-tight">{char.name}</h3>
                  <p className="text-[10px] font-black tracking-[0.2em] text-saffron/60 uppercase mb-4">{char.role}</p>
                  
                  <div className="relative">
                    <Quote className="w-4 h-4 text-saffron/20 absolute -left-2 -top-2" />
                    <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-2 italic px-4">
                      {char.quote || char.description}
                    </p>
                  </div>

                  <div className="mt-8 flex justify-center space-x-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    {[1, 2, 3].map(s => <Star key={s} className="w-3 h-3 text-saffron" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Character Detail Modal */}
        <AnimatePresence>
          {selectedChar && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
              onClick={() => setSelectedChar(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-[#0d0d0d] border border-white/5 w-full max-w-5xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedChar(null)} 
                  className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>

                {/* Profile Section */}
                <div className="md:w-1/3 bg-[#111] p-10 border-r border-white/5 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-40 h-40 bg-saffron/10 rounded-[3rem] flex items-center justify-center text-saffron mb-8 overflow-hidden border-2 border-saffron/20 shadow-2xl">
                      {selectedChar.image_url ? (
                        <img src={selectedChar.image_url} alt={selectedChar.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-20 h-20" />
                      )}
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 leading-tight">{selectedChar.name}</h2>
                    <p className="text-xs font-bold text-saffron tracking-[0.2em] uppercase mb-8">{selectedChar.title}</p>
                    
                    <div className="w-full space-y-3">
                      <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-4 text-left">Key Achievements</h4>
                      {selectedChar.achievements.map((ach, i) => (
                        <div key={i} className="bg-black/40 p-4 rounded-2xl text-[11px] font-bold text-gray-300 flex items-center uppercase tracking-widest border border-white/5">
                          <Shield className="w-4 h-4 mr-3 text-saffron" /> {ach}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Narrative Section */}
                <div className="md:w-2/3 p-12 md:p-20 overflow-y-auto custom-scrollbar bg-[#0d0d0d]">
                  <div className="max-w-2xl mx-auto">
                    <Quote className="w-12 h-12 text-saffron/10 mb-8" />
                    
                    <section className="mb-16">
                      <h4 className="text-saffron text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                        <Info className="w-4 h-4 mr-3" /> Historical Account
                      </h4>
                      <div className="space-y-6">
                        {selectedChar.history.split('\n\n').map((para, i) => (
                          <p key={i} className="text-gray-400 font-light leading-relaxed text-xl">
                            {para}
                          </p>
                        ))}
                      </div>
                    </section>

                    {selectedChar.wars && selectedChar.wars.length > 0 && (
                      <section className="mb-16">
                        <h4 className="text-saffron text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                          <Sword className="w-4 h-4 mr-3" /> Wars & Campaigns
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedChar.wars.map((war, i) => (
                            <span key={i} className="px-5 py-3 bg-saffron/10 text-saffron text-xs font-bold rounded-xl border border-saffron/20 uppercase tracking-widest">
                              {war}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    <div className="p-8 bg-saffron/5 border border-saffron/10 rounded-[2rem] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                      <p className="text-[10px] text-saffron font-black uppercase tracking-[0.3em] mb-4">Legendary Creed</p>
                      <p className="text-white italic font-light text-xl leading-relaxed relative z-10">
                        "{selectedChar.quote || (selectedChar.id === 'shivaji' ? 'Swarajya is the birthright of every soul born on this holy soil.' : 'To serve the Chhatrapati and the Swarajya is the highest honor a warrior can attain.')}"
                      </p>
                      {selectedChar.legacy && (
                        <div className="mt-6 pt-6 border-t border-saffron/10">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-2">Historical Legacy</p>
                          <p className="text-gray-400 text-sm font-light">{selectedChar.legacy}</p>
                        </div>
                      )}
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
