import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { X, Calendar, Info, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { timelineEvents, type TimelineEvent } from '../data/timelineData';

export const Timeline: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const openFort = (event: TimelineEvent) => {
    navigate(`/forts?fort=${encodeURIComponent(event.location)}`);
  };

  // Data is now imported from ../data/timelineData


  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">SWARAJYA <span className="text-saffron">CHRONICLES</span></h1>
          <p className="text-gray-500 font-light">Journey through the pivotal moments of the Maratha Empire.</p>
        </header>

        <div className="relative border-l-2 border-saffron/20 ml-4 py-8">
          {timelineEvents.map((event, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="mb-12 ml-8 relative"
            >
              {/* Dot */}
              <div className="absolute -left-[41px] top-1.5 w-4 h-4 bg-saffron rounded-full shadow-[0_0_10px_rgba(244,164,96,0.8)] border-4 border-[#0a0a0a]"></div>
              
              <div className="bg-[#111] border border-white/5 p-6 rounded-3xl hover:border-saffron/30 transition-all cursor-pointer group max-w-2xl" onClick={() => setSelectedEvent(event)}>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-saffron/10 text-saffron text-xs font-bold rounded-full uppercase tracking-widest">{event.year}</span>
                  <button
                    type="button"
                    className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center transition-colors hover:text-saffron"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFort(event);
                    }}
                    title={`Open ${event.location} in Forts`}
                  >
                    <MapPin className="w-3 h-3 mr-1" /> {event.location}
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-saffron transition-colors">{event.title}</h3>
                <p className="text-gray-400 font-light text-sm line-clamp-2">{event.desc}</p>
                <div className="mt-4 flex items-center text-xs text-saffron font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Read Full Account <Info className="ml-2 w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#111] border border-saffron/30 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(244,164,96,0.1)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-48 bg-gradient-to-br from-saffron/20 to-saffron/5 p-12 relative flex flex-col justify-end">
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <span className="text-5xl font-black text-saffron/20 absolute left-6 top-6">{selectedEvent.year}</span>
                  <span className="px-4 py-1 bg-saffron text-black text-xs font-black rounded-full w-fit mb-4">{selectedEvent.category}</span>
                  <h2 className="text-3xl font-black text-white">{selectedEvent.title}</h2>
                </div>
                <div className="p-12">
                  <div className="flex items-center text-gray-500 mb-6 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-saffron" />
                    Year {selectedEvent.year}
                    <span className="mx-3">•</span>
                    <button
                      type="button"
                      onClick={() => openFort(selectedEvent)}
                      className="inline-flex items-center transition-colors hover:text-saffron"
                      title={`Open ${selectedEvent.location} in Forts`}
                    >
                      <MapPin className="w-4 h-4 mr-2 text-saffron" />
                      {selectedEvent.location}
                    </button>
                  </div>
                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                      {selectedEvent.longDesc.split('\n\n').map((para, i) => (
                        <p key={i} className="text-gray-300 font-light leading-relaxed text-lg">
                          {para}
                        </p>
                      ))}
                    </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="mt-10 w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                  >
                    Close Scroll
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
