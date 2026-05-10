import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { X, Info, MapPin, Camera, ChevronRight, BookOpen, Quote } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import { timelineEvents, type TimelineEvent } from '../data/timelineData';

export const Timeline: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const autoOpenDone = useRef(false);

  useEffect(() => {
    const eventQuery = searchParams.get('event');
    if (eventQuery && !autoOpenDone.current) {
      autoOpenDone.current = true;
      const needle = eventQuery.toLowerCase();
      const match = timelineEvents.find((e) => {
        const title = e.title.toLowerCase();
        return title === needle || title.includes(needle) || needle.includes(title);
      });

      if (match) {
        setSelectedEvent(match);
      }
      
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('event');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-2">
            <BookOpen className="w-8 h-8 text-saffron" />
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Swarajya <span className="text-saffron">Chronicles</span></h1>
          </div>
          <p className="text-gray-500 font-light max-w-2xl">A detailed historical journey through the monumental events that shaped the Maratha Empire and defined a legacy of valor.</p>
        </header>

        <div className="relative border-l-2 border-saffron/20 ml-4 py-8">
          {timelineEvents.map((event, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="mb-16 ml-8 relative group"
            >
              {/* Dot with pulse effect */}
              <div className="absolute -left-[41px] top-1.5 w-4 h-4 bg-saffron rounded-full shadow-[0_0_15px_rgba(244,164,96,0.5)] border-4 border-[#0a0a0a] z-10 group-hover:scale-125 transition-transform"></div>
              
              <div 
                className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] hover:border-saffron/30 transition-all cursor-pointer shadow-xl relative overflow-hidden max-w-4xl"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-saffron/10 transition-all"></div>
                
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="px-4 py-1.5 bg-saffron/10 text-saffron text-sm font-black rounded-xl uppercase tracking-widest border border-saffron/20">{event.year}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{event.category}</span>
                  </div>
                  <span
                    className="text-[10px] text-gray-400 hover:text-white hover:bg-saffron/20 px-3 py-1.5 rounded-xl border border-white/5 transition-all flex items-center cursor-pointer group/loc backdrop-blur-md"
                    onClick={(e) => { e.stopPropagation(); navigate(`/forts?fort=${encodeURIComponent(event.location)}`); }}
                  >
                    <MapPin className="w-3 h-3 mr-2 text-saffron" /> {event.location}
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black mb-4 text-white group-hover:text-saffron transition-colors tracking-tight">{event.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed text-lg line-clamp-3 italic">
                  {event.desc}
                </p>
                
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center text-xs text-saffron font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Read Detailed Account <ChevronRight className="ml-2 w-4 h-4" />
                  </div>
                  {event.gallery.length > 0 && (
                    <div className="flex items-center space-x-1 opacity-60">
                      <Camera className="w-4 h-4 text-gray-500" />
                      <span className="text-[10px] text-gray-500 font-bold">{event.gallery.length} Images</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-[#0d0d0d] border border-white/5 w-full max-w-5xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col md:flex-row relative shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all z-50 text-white group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>

                {/* Left Sidebar - Quick Info & Gallery */}
                <div className="md:w-1/3 bg-[#111] border-r border-white/5 overflow-y-auto custom-scrollbar p-10">
                  <div className="mb-12">
                    <span className="text-5xl font-black text-saffron/20 mb-4 block leading-none">{selectedEvent.year}</span>
                    <h2 className="text-3xl font-black text-white mb-6 leading-tight">{selectedEvent.title}</h2>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center text-gray-400 text-sm">
                         <MapPin className="w-4 h-4 mr-3 text-saffron" />
                         {selectedEvent.location}
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                         <Info className="w-4 h-4 mr-3 text-saffron" />
                         {selectedEvent.category} Event
                      </div>
                    </div>
                  </div>

                  {selectedEvent.gallery.length > 0 && (
                    <div>
                      <h4 className="text-saffron text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                        <Camera className="w-4 h-4 mr-2" /> Gallery
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {selectedEvent.gallery.map((img, idx) => (
                          <motion.div 
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            className="aspect-video rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-saffron/40 transition-all shadow-lg"
                            onClick={() => setActiveImage(img)}
                          >
                            <img src={img} alt={`Moment ${idx}`} className="w-full h-full object-cover" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Content - Long Form Text */}
                <div className="md:w-2/3 p-12 md:p-20 overflow-y-auto custom-scrollbar bg-[#0d0d0d]">
                  <div className="max-w-2xl mx-auto">
                    <Quote className="w-12 h-12 text-saffron/10 mb-8" />
                    <div className="space-y-8">
                      {selectedEvent.longDesc.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="text-gray-400 font-light leading-relaxed text-xl">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    
                    <div className="mt-16 pt-16 border-t border-white/5">
                      <button 
                        onClick={() => navigate(`/forts?fort=${encodeURIComponent(selectedEvent.location)}`)}
                        className="w-full py-5 bg-saffron text-black font-black rounded-2xl hover:bg-saffron-light transition-all flex items-center justify-center space-x-3 active:scale-95 shadow-2xl shadow-saffron/20"
                      >
                        <MapPin className="w-6 h-6" />
                        <span>Visit {selectedEvent.location} in History</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Fullscreen View */}
        <AnimatePresence>
          {activeImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/98"
              onClick={() => setActiveImage(null)}
            >
              <button className="absolute top-8 right-8 text-white p-4 hover:bg-white/10 rounded-full transition-all">
                <X className="w-10 h-10" />
              </button>
              <motion.img 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={activeImage} 
                alt="Full View" 
                className="max-w-full max-h-full rounded-3xl shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
