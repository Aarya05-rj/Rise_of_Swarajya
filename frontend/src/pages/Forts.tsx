import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Search, MapPin, Shield, Camera, X, Loader2, Map as MapIcon, Info, Castle, Sword, Image as ImageIcon, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { majorForts, type Fort } from '../data/fortsData';
import { timelineEvents } from '../data/timelineData';
import { supabase } from '../services/supabaseClient';

export const Forts: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [forts, setForts] = useState<Fort[]>(majorForts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFort, setSelectedFort] = useState<Fort | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const autoOpenDone = useRef(false);

  useEffect(() => {
    fetchForts();
  }, []);

  const fetchForts = async () => {
    try {
      setLoading(true);
      
      // ✅ DIRECT SUPABASE FETCH
      const { data: dbData, error } = await supabase
        .from('fort_images')
        .select('*');

      if (error) {
        console.warn('Supabase fetch error, using local fallback:', error.message);
        setForts(majorForts);
      } else if (dbData && dbData.length > 0) {
        // Smart Merge: Use API data but keep rich local info for matched forts
        const mergedForts = dbData.map((apiFort: any) => {
          const localMatch = majorForts.find(f => 
            f.name.toLowerCase().includes(apiFort.name.split(' ')[0].toLowerCase()) || 
            apiFort.name.toLowerCase().includes(f.name.split(' ')[0].toLowerCase())
          );
          
          if (localMatch) {
            const isInvalid = (val: any) => !val || val === 'Unknown' || (typeof val === 'string' && val.trim() === '');
            
            return {
              ...localMatch, // Start with rich local data
              ...apiFort,    // Overwrite with API data
              // Force local data if API is "Unknown" or truly empty
              altitude: isInvalid(apiFort.altitude) ? localMatch.altitude : apiFort.altitude,
              gallery: !apiFort.gallery || apiFort.gallery.length === 0 ? localMatch.gallery : apiFort.gallery,
              history: isInvalid(apiFort.history) ? localMatch.history : apiFort.history,
              architecture: isInvalid(apiFort.architecture) ? localMatch.architecture : apiFort.architecture,
              importance: isInvalid(apiFort.importance) ? localMatch.importance : apiFort.importance,
              built_by: isInvalid(apiFort.built_by) ? localMatch.built_by : apiFort.built_by
            };
          }
          return apiFort;
        });

        const finalForts = [...mergedForts];
        majorForts.forEach(localFort => {
          const isDuplicate = finalForts.some(f => 
            f.name.toLowerCase().includes(localFort.name.split(' ')[0].toLowerCase()) || 
            localFort.name.toLowerCase().includes(f.name.split(' ')[0].toLowerCase())
          );
          
          if (!isDuplicate) {
            finalForts.push(localFort);
          }
        });

        setForts(finalForts);

        // Auto-open fort from ?fort= query param
        const fortQuery = searchParams.get('fort');
        if (fortQuery && !autoOpenDone.current) {
          autoOpenDone.current = true;
          const needle = fortQuery.toLowerCase().replace(' fort', '').trim();
          
          const match = finalForts.find((f) => {
            const name = f.name.toLowerCase();
            return name.includes(needle) || needle.includes(name.split(' ')[0]);
          });

          if (match) {
            setSelectedFort(match);
          } else {
            setSearch(fortQuery);
          }
          
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('fort');
          setSearchParams(newParams, { replace: true });
        }
      } else {
        setForts(majorForts);
      }
    } catch (err) {
      console.error('Error fetching forts:', err);
      setForts(majorForts);
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
        await fetch('/api/log-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            user_id: user.id,
            activity_type: 'fort',
            activity_name: `Scouted Fort: ${fort.name}`,
            score_boost: 10,
            details: { name: fort.name }
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
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">Citadels of <span className="text-saffron">Glory</span></h1>
            <p className="text-gray-500 font-light">Explore the magnificent forts that stood as the backbone of Swarajya.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search for a fort..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#111] border border-white/5 rounded-2xl focus:outline-none focus:border-saffron/30 transition-all text-white placeholder:text-gray-600"
            />
          </div>
        </header>

        {loading && forts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
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
                  <p className="text-gray-400 font-light text-sm mb-6 line-clamp-2 leading-relaxed">{fort.description}</p>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-600">
                    <span className="flex items-center"><Shield className="w-3 h-3 mr-1" /> {fort.built_by || 'Swarajya'}</span>
                    <span className="flex items-center"><ImageIcon className="w-3 h-3 mr-1" /> Gallery</span>
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
              onClick={() => setSelectedFort(null)}
            >
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-[#0d0d0d] border border-white/5 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[95vh] md:h-auto max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image Section */}
                <div className="md:w-[45%] h-72 md:h-auto relative bg-[#151515] overflow-hidden">
                  {selectedFort.image_url && selectedFort.image_url.startsWith('http') ? (
                    <img src={selectedFort.image_url} alt={selectedFort.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <MapIcon className="w-24 h-24 text-saffron" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="md:w-[55%] p-8 md:p-12 overflow-y-auto relative custom-scrollbar">
                  <button onClick={() => setSelectedFort(null)} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all z-10 text-white group">
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  </button>
                  
                  <div className="mb-10">
                    <span className="text-xs font-black tracking-widest text-saffron uppercase mb-2 block">{selectedFort.location}</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{selectedFort.name}</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-saffron/20 transition-all">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Altitude</p>
                        <p className="text-white text-xl font-black">{selectedFort.altitude || 'Unknown'}</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-saffron/20 transition-all">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Architect</p>
                        <p className="text-white text-xl font-black">{selectedFort.built_by || 'Maratha Empire'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <section>
                      <h4 className="text-saffron text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                        <Info className="w-5 h-5 mr-3" /> Historical Significance
                      </h4>
                      <p className="text-gray-400 font-light leading-relaxed text-lg italic">
                        {selectedFort.history || selectedFort.description}
                      </p>
                    </section>

                    <section>
                      <h4 className="text-saffron text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                        <Castle className="w-5 h-5 mr-3" /> Architecture
                      </h4>
                      <p className="text-gray-400 font-light leading-relaxed text-lg">
                        {selectedFort.architecture}
                      </p>
                    </section>

                    <section>
                      <h4 className="text-saffron text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                        <Sword className="w-5 h-5 mr-3" /> Strategic Importance
                      </h4>
                      <p className="text-gray-400 font-light leading-relaxed text-lg">
                        {selectedFort.importance}
                      </p>
                    </section>

                    {/* Historical Timeline Connection */}
                    {timelineEvents && timelineEvents.filter(e => 
                      e.location.toLowerCase().includes(selectedFort.name.toLowerCase()) || 
                      selectedFort.name.toLowerCase().includes(e.location.toLowerCase()) ||
                      e.location.toLowerCase().includes(selectedFort.location.toLowerCase())
                    ).length > 0 && (
                      <section className="p-6 bg-saffron/5 rounded-3xl border border-saffron/10">
                        <h4 className="text-saffron text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                          <Calendar className="w-4 h-4 mr-3" /> Historical Timeline
                        </h4>
                        <div className="space-y-4">
                          {timelineEvents
                            .filter(e => 
                              e.location.toLowerCase().includes(selectedFort.name.toLowerCase()) || 
                              selectedFort.name.toLowerCase().includes(e.location.toLowerCase()) ||
                              e.location.toLowerCase().includes(selectedFort.location.toLowerCase())
                            )
                            .map((event, idx) => (
                              <div 
                                key={idx}
                                className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group/event cursor-pointer hover:border-saffron/30 transition-all"
                                onClick={() => navigate(`/timeline?event=${encodeURIComponent(event.title)}`)}
                              >
                                <div className="flex items-center space-x-4">
                                  <span className="text-saffron font-black text-sm">{event.year}</span>
                                  <span className="text-white font-bold text-sm group-hover/event:text-saffron transition-colors">{event.title}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover/event:text-saffron group-hover/event:translate-x-1 transition-all" />
                              </div>
                            ))
                          }
                        </div>
                      </section>
                    )}

                    {/* Gallery Section */}
                    {selectedFort.gallery && selectedFort.gallery.length > 0 && (
                      <section>
                        <h4 className="text-saffron text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                          <Camera className="w-5 h-5 mr-3" /> Gallery
                        </h4>
                        <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide">
                          {selectedFort.gallery.map((img, idx) => (
                            <motion.div 
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              className="flex-shrink-0 w-48 h-32 rounded-2xl overflow-hidden cursor-pointer border-2 border-white/5 hover:border-saffron/40 transition-all"
                              onClick={() => setSelectedImage(img)}
                            >
                              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  <button 
                    onClick={() => handleMapOpen(selectedFort)}
                    className="mt-12 w-full py-5 bg-saffron text-black font-black rounded-[2rem] hover:bg-saffron-light transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-saffron/20 active:scale-95"
                  >
                    <MapIcon className="w-6 h-6" />
                    <span className="text-xl">View on Google Maps</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox for Gallery Images */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95"
              onClick={() => setSelectedImage(null)}
            >
              <button className="absolute top-8 right-8 text-white p-4 hover:bg-white/10 rounded-full transition-all">
                <X className="w-10 h-10" />
              </button>
              <motion.img 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                src={selectedImage} 
                alt="Full Preview" 
                className="max-w-full max-h-full rounded-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
