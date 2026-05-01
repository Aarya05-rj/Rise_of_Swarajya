import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { X, Calendar, Info, MapPin } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  desc: string;
  longDesc: string;
  location: string;
  category: 'Birth' | 'Battle' | 'Coronation' | 'Expansion';
}

export const Timeline: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const events: TimelineEvent[] = [
    { 
      year: '1630', 
      title: 'Birth of a Legend', 
      desc: 'Chhatrapati Shivaji Maharaj was born at Shivneri Fort.',
      longDesc: 'Born to Jijabai and Shahaji Bhonsle, his birth marked the beginning of a new era. His mother Jijabai instilled in him the values of justice, bravery, and the vision of a free kingdom.',
      location: 'Shivneri Fort',
      category: 'Birth'
    },
    { 
      year: '1645', 
      title: 'The Sacred Oath', 
      desc: 'Oath of Swarajya taken at Raireshwar Temple.',
      longDesc: 'At the age of 15, Shivaji Maharaj and his young Mavala friends took a solemn oath before Lord Raireshwar to establish Hindavi Swarajya—a self-ruled kingdom for the people.',
      location: 'Raireshwar',
      category: 'Expansion'
    },
    { 
      year: '1646', 
      title: 'The First Conquest', 
      desc: 'Shivaji Maharaj captured Torna Fort at age 16.',
      longDesc: 'Marking the first military victory, Shivaji Maharaj captured the massive Torna Fort. The discovery of hidden treasure here funded the construction of Rajgad, the first capital.',
      location: 'Torna Fort',
      category: 'Expansion'
    },
    { 
      year: '1656', 
      title: 'Conquest of Jawali', 
      desc: 'Strategic expansion into the Konkan region.',
      longDesc: 'By defeating the More family of Jawali, Shivaji Maharaj gained control over a massive forest region and paved the way for the construction of the mighty Pratapgad fort.',
      location: 'Jawali Valley',
      category: 'Expansion'
    },
    { 
      year: '1659', 
      title: 'Battle of Pratapgad', 
      desc: 'The killing of Afzal Khan and victory over Bijapur.',
      longDesc: 'Afzal Khan, the giant general of Bijapur, came to crush Swarajya. In a legendary one-on-one meeting, Shivaji Maharaj used Tiger Claws (Wagh Nakh) to kill him, routing his massive army.',
      location: 'Pratapgad',
      category: 'Battle'
    },
    { 
      year: '1660', 
      title: 'Siege of Panhala', 
      desc: 'The heroic escape and sacrifice of Baji Prabhu.',
      longDesc: 'Trapped at Panhala by Siddi Jauhar, Shivaji Maharaj made a daring escape at night. Baji Prabhu Deshpande fought a legendary rearguard action at Ghodkhind to ensure Maharaj reached safety.',
      location: 'Panhala to Pavankhind',
      category: 'Battle'
    },
    { 
      year: '1663', 
      title: 'Pune Surgical Strike', 
      desc: 'Midnight raid on Shaista Khan at Lal Mahal.',
      longDesc: 'In one of historys most daring raids, Shivaji Maharaj entered Pune with 400 soldiers disguised as a marriage party and attacked the Mughal Governor Shaista Khan in his own bedroom.',
      location: 'Lal Mahal, Pune',
      category: 'Battle'
    },
    { 
      year: '1664', 
      title: 'Raid on Surat', 
      desc: 'Financial blow to the Mughal Empire.',
      longDesc: 'To fund the Swarajya treasury and avenge the destruction caused by Mughal armies, Shivaji Maharaj raided Surat, the wealthiest Mughal port city on the western coast.',
      location: 'Surat',
      category: 'Expansion'
    },
    { 
      year: '1666', 
      title: 'Escape from Agra', 
      desc: 'The miraculous escape from Mughal confinement.',
      longDesc: 'After being house-arrested by Aurangzeb in Agra, Shivaji Maharaj and his son Sambhaji escaped in large sweet baskets, tricking the Mughal guards and returning safely to Rajgad.',
      location: 'Agra',
      category: 'Battle'
    },
    { 
      year: '1670', 
      title: 'Battle of Sinhagad', 
      desc: 'Tanaji Malusare wins the "Lion Fort".',
      longDesc: 'Tanaji Malusare scaled the vertical cliffs of Kondhana at night. Though he lost his life, the fort was won. Maharaj lamented, "The fort is won, but the Lion is gone."',
      location: 'Sinhagad Fort',
      category: 'Battle'
    },
    { 
      year: '1674', 
      title: 'Grand Coronation', 
      desc: 'Shivaji Maharaj becomes Chhatrapati.',
      longDesc: 'On June 6, 1674, Shivaji Maharaj was formally crowned as the Chhatrapati of the Maratha Empire at Raigad, establishing it as a sovereign Hindu kingdom.',
      location: 'Raigad Fort',
      category: 'Coronation'
    },
    { 
      year: '1677', 
      title: 'Southern Campaign', 
      desc: 'Dakshin Digvijay - Expansion into South India.',
      longDesc: 'Shivaji Maharaj led a massive campaign to the south, capturing Gingee and Vellore, and establishing a Maratha presence as far as Tanjavur, ensuring the empires survival.',
      location: 'South India',
      category: 'Expansion'
    },
    { 
      year: '1680', 
      title: 'Passing of the Lion', 
      desc: 'The death of Chhatrapati Shivaji Maharaj.',
      longDesc: 'The great founder of the Maratha Empire passed away at Raigad Fort. He left behind a legacy of administration, naval power, and the undying spirit of Swarajya.',
      location: 'Raigad Fort',
      category: 'Birth'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">SWARAJYA <span className="text-saffron">CHRONICLES</span></h1>
          <p className="text-gray-500 font-light">Journey through the pivotal moments of the Maratha Empire.</p>
        </header>

        <div className="relative border-l-2 border-saffron/20 ml-4 py-8">
          {events.map((event, i) => (
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
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center">
                    <MapPin className="w-3 h-3 mr-1" /> {event.location}
                  </span>
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
                    <MapPin className="w-4 h-4 mr-2 text-saffron" />
                    {selectedEvent.location}
                  </div>
                  <p className="text-gray-300 font-light leading-relaxed text-lg">
                    {selectedEvent.longDesc}
                  </p>
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
