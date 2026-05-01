import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Search, MapPin, Shield, Camera, X, Loader2, Map as MapIcon } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Fort {
  id: string;
  name: string;
  location: string;
  description: string;
  history?: string;
  image_url: string; // Updated from 'fort_img_url'
  altitude?: string;
  built_by?: string;
  map_url?: string;
}

export const Forts: React.FC = () => {
  const { user } = useAuth();
  const [forts, setForts] = useState<Fort[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFort, setSelectedFort] = useState<Fort | null>(null);

  useEffect(() => {
    fetchForts();
  }, []);

  const fetchForts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/forts');
      if (!response.ok) throw new Error('Failed to fetch forts');
      
      const data = await response.json();
      setForts(data || []);
    } catch (err) {
      console.error('Error fetching forts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapOpen = (fort: Fort) => {
    const url = fort.map_url || `https://www.google.com/maps/search/${encodeURIComponent(`${fort.name} ${fort.location}`)}`;
    window.open(url, '_blank');
  };

  const handleFortSelect = async (fort: Fort) => {
    setSelectedFort(fort);
    
    if (user) {
      try {
        await fetch('http://localhost:5000/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            activity_name: `Scouted Fort: ${fort.name}`,
            score_boost: 10
          })
        });
      } catch (err) {
        console.error('Tracking Error:', err);
      }
    }
  };

  const filteredForts = forts.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">CITADELS OF <span className="text-saffron">GLORY</span></h1>
            <p className="text-gray-500 font-light">Explore the magnificent forts that stood as the backbone of Swarajya.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search for a fort..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#111] border border-white/5 rounded-2xl focus:outline-none focus:border-saffron/30 transition-all text-white"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-saffron animate-spin" />
          </div>
        ) : filteredForts.length === 0 ? (
          <div className="text-center py-20 bg-[#111] rounded-[3rem] border border-dashed border-white/10">
            <MapIcon className="w-16 h-16 text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500">No forts found in the chronicles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredForts.map((fort, i) => {
              const hasValidImage = fort.image_url && fort.image_url.startsWith('http');
              
              return (
                <motion.div
                  key={fort.id || i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden group cursor-pointer"
                  onClick={() => handleFortSelect(fort)}
                >
                  <div className="h-56 relative overflow-hidden bg-[#1a1a1a]">
                    {hasValidImage ? (
                      <img 
                        src={fort.image_url} 
                        alt={fort.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <MapIcon className="w-12 h-12 text-saffron" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center text-[10px] font-black tracking-widest text-saffron uppercase mb-1">
                        <MapPin className="w-3 h-3 mr-1" /> {fort.location}
                      </div>
                      <h3 className="text-2xl font-black text-white">{fort.name}</h3>
                    </div>
                  </div>
                <div className="p-8">
                  <p className="text-gray-400 font-light text-sm mb-6 line-clamp-2">{fort.description}</p>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-600">
                    <span className="flex items-center"><Shield className="w-3 h-3 mr-1" /> {fort.built_by || 'Swarajya'}</span>
                    <span className="flex items-center"><Camera className="w-3 h-3 mr-1" /> Gallery</span>
                  </div>
                </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedFort && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
              onClick={() => setSelectedFort(null)}
            >
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-[#111] border border-white/5 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="md:w-1/2 h-64 md:h-auto relative bg-[#1a1a1a]">
                  {selectedFort.image_url && selectedFort.image_url.startsWith('http') ? (
                    <img src={selectedFort.image_url} alt={selectedFort.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <MapIcon className="w-24 h-24 text-saffron" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-transparent to-transparent md:block hidden"></div>
                </div>
                <div className="md:w-1/2 p-12 overflow-y-auto max-h-[80vh] relative">
                  <button onClick={() => setSelectedFort(null)} className="absolute top-8 right-8 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                    <X className="w-6 h-6" />
                  </button>
                  <span className="text-xs font-black tracking-widest text-saffron uppercase mb-2 block">{selectedFort.location}</span>
                  <h2 className="text-4xl font-black text-white mb-6">{selectedFort.name}</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Altitude</p>
                      <p className="text-white font-bold">{selectedFort.altitude || 'Unknown'}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Architect</p>
                      <p className="text-white font-bold">{selectedFort.built_by || 'Maratha Empire'}</p>
                    </div>
                  </div>

                  <h4 className="text-saffron font-bold mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" /> Strategic Description
                  </h4>
                  <p className="text-gray-400 font-light leading-relaxed mb-8">
                    {selectedFort.history || selectedFort.description}
                  </p>

                  <button 
                    onClick={() => handleMapOpen(selectedFort)}
                    className="w-full py-4 bg-saffron text-black font-black rounded-2xl hover:bg-saffron-light transition-all flex items-center justify-center space-x-2"
                  >
                    <MapIcon className="w-5 h-5" />
                    <span>View on Google Maps</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
