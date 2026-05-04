import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { User, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Character {
  id: string;
  name: string;
  title: string;
  role: string;
  description: string;
  history: string;
  achievements: string[];
  image_url: string;
}

export const Characters: React.FC = () => {
  const { user } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  // ✅ FETCH CHARACTERS (FIXED)
  const fetchCharacters = async () => {
  try {
    setLoading(true);

    const res = await fetch('/api/characters');
    const result = await res.json();

    console.log("CHARACTER API:", result);

    setCharacters(Array.isArray(result.data) ? result.data : []);

  } catch (err) {
    console.error('Error fetching characters:', err);
    setCharacters([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCharacters();
  }, []);

  // ✅ SELECT CHARACTER + ACTIVITY LOG
  const handleCharSelect = async (char: Character) => {
    setSelectedChar(char);

    if (user) {
      try {
        await fetch('/api/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            activity_type: 'character',
            details: {
              name: char.name
            }
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

        {/* HEADER */}
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">
            LEGENDS OF <span className="text-saffron">MARATHA</span>
          </h1>
          <p className="text-gray-500">
            Meet the brave souls who built Swarajya.
          </p>
        </header>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-saffron animate-spin" />
          </div>
        ) : characters.length === 0 ? (
          <p className="text-gray-500">No characters found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {characters.map((char, index) => (
              <div
                key={char.id || char.name || index}
                onClick={() => handleCharSelect(char)}
                className="bg-[#111] border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-saffron/30 transition"
              >
                <div className="w-20 h-20 bg-saffron/10 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                  {char.image_url ? (
                    <img
                      src={char.image_url}
                      className="w-full h-full object-cover"
                      alt={char.name}
                    />
                  ) : (
                    <User className="text-saffron w-8 h-8" />
                  )}
                </div>

                <h3 className="text-white font-bold">{char.name}</h3>
                <p className="text-gray-500 text-sm">{char.role}</p>
              </div>
            ))}

          </div>
        )}

        {/* MODAL */}
        <AnimatePresence>
          {selectedChar && (
            <motion.div
              className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedChar(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="bg-[#111] p-10 rounded-3xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="float-right text-white"
                  onClick={() => setSelectedChar(null)}
                >
                  <X />
                </button>

                <h2 className="text-3xl text-white font-bold mb-2">
                  {selectedChar.name}
                </h2>

                <p className="text-saffron mb-4">{selectedChar.title}</p>

                <p className="text-gray-400 mb-6">
                  {selectedChar.history}
                </p>

                <div className="p-4 bg-saffron/5 rounded-xl border border-saffron/10">
                  <p className="text-white italic">
                    {selectedChar.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};