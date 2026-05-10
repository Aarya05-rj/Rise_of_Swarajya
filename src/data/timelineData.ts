export interface TimelineEvent {
  year: string;
  title: string;
  desc: string;
  longDesc: string;
  location: string;
  category: 'Birth' | 'Battle' | 'Coronation' | 'Expansion';
  gallery: string[];
}

export const timelineEvents: TimelineEvent[] = [
  { 
    year: '1630', 
    title: 'Birth of a Legend', 
    desc: 'Chhatrapati Shivaji Maharaj was born at Shivneri Fort.',
    longDesc: `On February 19, 1630, the hilltop fortress of Shivneri near Junnar became the birthplace of a visionary leader. Born to Shahaji Bhonsle, a prominent Maratha general, and Jijabai, a woman of extraordinary character and devotion, young Shivaji's upbringing was unique. 

His mother, Jijabai, was his first teacher and mentor. She instilled in him the values of justice, self-respect, and the vision of 'Hindavi Swarajya' (self-rule). While his father was away on military campaigns for the Deccan Sultanates, Shivaji spent his early years in the rugged Sahyadris, developing an intimate knowledge of the terrain that would later define his guerrilla warfare tactics.

Shivaji was raised on the epic tales of the Ramayana and Mahabharata, which shaped his moral compass. Under the guidance of his guardian Dadoji Konddeo, he mastered administrative skills and martial arts. The local 'Mavala' youth of the Pune region became his closest friends and the foundation of his first army. This period wasn't just about childhood; it was the forging of a king who would challenge the mightiest empires of India.`,
    location: 'Shivneri Fort',
    category: 'Birth',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shivneri_fort1.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Statue_of_Shivaji_and_Jijabai_at_Shivneri.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Shivneri_Fort_Entrance.jpg"
    ]
  },
  { 
    year: '1645', 
    title: 'The Sacred Oath', 
    desc: 'Oath of Swarajya taken at Raireshwar Temple.',
    longDesc: `At the tender age of 15, Shivaji Maharaj performed an act of immense political and spiritual courage. He gathered his closest companions, the Mavalas, at the ancient Raireshwar Temple in the Bhor region. 

In a solemn ceremony, they cut their thumbs and performed 'Rakt-Abhishek' (blood anointment) on the Shivalinga, swearing to establish an independent kingdom. This was not a mere pact of rebels; it was a sacred vow to end centuries of foreign oppression and establish a land governed by justice and local values.

The oath at Raireshwar unified the scattered local tribes and clans under a single, divine mission. It transformed a group of teenagers into the vanguard of a revolution. This moment is celebrated as the spark that lit the flame of Swarajya, proving that even with limited resources, a powerful vision can change the course of history.`,
    location: 'Raireshwar',
    category: 'Expansion',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Raireshwar_Temple_Entrance.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/b1/Raireshwar_Fort_Plateau.jpg"
    ]
  },
  { 
    year: '1646', 
    title: 'The First Conquest', 
    desc: 'Shivaji Maharaj captured Torna Fort at age 16.',
    longDesc: `In 1646, Shivaji executed his first major military operation by capturing the massive Torna Fort (Prachandagad). Standing at 4,603 feet, it was one of the highest and most strategic forts in the region held by the Bijapur Sultanate.

Using a combination of diplomacy and a surprise night ascent, Shivaji persuaded the Bijapuri garrison to surrender. During the subsequent repairs of the fort's Zunjar Machi, workers discovered several pots of buried gold coins. Shivaji viewed this as a divine blessing for his cause.

Instead of personal gain, he used this treasure to build the formidable Rajgad Fort nearby, which would become the first capital of Swarajya. The capture of Torna was a loud declaration that the young Maratha leader was now a serious contender for power in the Deccan.`,
    location: 'Torna Fort',
    category: 'Expansion',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/4/4b/Kille_torna_zunjar_machi.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/d/de/069torna2.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Zunzar_Machi_at_Torna.jpg"
    ]
  },
  { 
    year: '1659', 
    title: 'Battle of Pratapgad', 
    desc: 'The killing of Afzal Khan and victory over Bijapur.',
    longDesc: `The year 1659 witnessed one of the most famous encounters in Indian history. The Bijapur Sultanate sent the giant general Afzal Khan with a massive army to crush Shivaji. Afzal Khan, known for his physical strength and treachery, attempted to lure Shivaji onto open ground by desecrating temples.

Shivaji remained strategically positioned at Pratapgad. A personal meeting was arranged at the base of the fort. Both leaders were supposedly unarmed, but both carried concealed weapons. During a ceremonial embrace, Afzal Khan attempted to stab Shivaji. Prepared for this, Shivaji used his 'Wagh Nakh' (tiger claws) to disembowel the general and finished him with a 'Bichwa' (dagger).

As the signal was given, Maratha soldiers hidden in the surrounding Jawali forests launched a devastating ambush on the Bijapuri army. The victory was total. It wasn't just a military win; it was a psychological breakthrough that established Shivaji as a hero of the people who could defeat the most feared enemies through wit and courage.`,
    location: 'Pratapgad',
    category: 'Battle',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/3/36/Battle_of_Pratapgad_Maratha_painting.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Pratapgad_The_Fort_of_Valour.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/3/3d/Afzal_Khan_Tomb_at_Pratapgad.jpg"
    ]
  },
  { 
    year: '1660', 
    title: 'Siege of Panhala', 
    desc: 'The heroic escape and sacrifice of Baji Prabhu.',
    longDesc: `Trapped inside Panhala Fort by a massive Bijapuri army led by Siddi Jauhar, Shivaji faced certain defeat. Under the cover of a stormy monsoon night, he executed a daring escape. 

While Shivaji raced toward Vishalgad, his loyal commander Baji Prabhu Deshpande and 600 Mavalas held the narrow Ghodkhind pass against 10,000 pursuing soldiers. Baji Prabhu fought with supernatural courage, refusing to fall despite dozens of wounds until he heard the cannon fire from Vishalgad, signaling Shivaji's safety.

This sacrifice saved the leader of Swarajya. Shivaji renamed the pass 'Pavankhind' (The Sacred Pass) in honor of the blood shed by Baji Prabhu. It remains a pinnacle of loyalty and bravery in the Maratha chronicles.`,
    location: 'Panhala to Pavankhind',
    category: 'Battle',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Teen_Darwaja_Panhala_Fort.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/6/60/Baji_Prabhu_Deshpande_Statue.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/3/3a/Pavankhind_Passage.jpg"
    ]
  },
  { 
    year: '1666', 
    title: 'Escape from Agra', 
    desc: 'The miraculous escape from Mughal confinement.',
    longDesc: `After being humiliated at the Mughal court in Agra by Emperor Aurangzeb, Shivaji and his young son Sambhaji were placed under house arrest. Surrounded by thousands of guards, escape seemed impossible.

Shivaji feigned illness and began sending large baskets of sweets to the poor and holy men as acts of charity. After weeks of the guards checking every basket, they became complacent. On August 17, 1666, Shivaji and Sambhaji hid inside the baskets and were carried out of the palace.

He then traveled 1,500 km across India in various disguises — sometimes as a monk, other times as a merchant — to reach the safety of Rajgad. This escape made him a legend across the subcontinent and humiliated the Mughal Empire on its own soil.`,
    location: 'Agra',
    category: 'Battle',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shivaji_in_Aurangzeb%27s_Court.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Agra_Fort_View.jpg"
    ]
  },
  { 
    year: '1670', 
    title: 'Battle of Sinhagad', 
    desc: 'Tanaji Malusare wins the "Lion Fort".',
    longDesc: `Kondhana Fort was a strategic gateway to Pune, held by a strong Mughal garrison. Shivaji's trusted friend Tanaji Malusare took the mission to recapture it, famously pausing his own son's wedding preparations.

Tanaji and 300 soldiers scaled the sheer 800-foot 'Donagiri' cliff at night using ropes. They surprised the garrison and a fierce battle broke out. Tanaji fought like a lion but was eventually martyred in a duel with the fort commander.

When Shivaji received news of the victory but heard of Tanaji's death, he famously said, "Gad aala pan Sinha gela" (The fort is won, but the Lion is gone). He renamed the fort 'Sinhagad' in Tanaji's memory.`,
    location: 'Sinhagad Fort',
    category: 'Battle',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Sinhagad_Fort_Top_View.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Tanaji_Malusare_Samadhi_at_Sinhagad.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Kalyan_Darwaza%2C_Sinhagad_Fort.jpg"
    ]
  },
  { 
    year: '1674', 
    title: 'Grand Coronation', 
    desc: 'Shivaji Maharaj becomes Chhatrapati.',
    longDesc: `On June 6, 1674, Raigad Fort witnessed the birth of a sovereign state. Shivaji Maharaj was formally crowned as Chhatrapati, a title signifying his status as a sovereign emperor.

The ceremony was conducted by the renowned scholar Gaga Bhatt from Varanasi. It was a symbolic act that challenged the legitimacy of foreign rule in India. Shivaji was weighed against gold, which was distributed to the poor, and took the oath to protect the dharma and the people.

He established the 'Ashtapradhan Mandal' (Council of Eight Ministers) to govern the empire efficiently. This coronation wasn't just a celebration; it was the formalization of Maratha administration, language (Marathi), and a professional military system that would define the empire for generations.`,
    location: 'Raigad Fort',
    category: 'Coronation',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/8/82/Shivaji_Coronation.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Nagarkhana%2C_Raigad_Fort%2C_India.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Raigad_Fort_Maha_Darwaja.jpg"
    ]
  },
  { 
    year: '1680', 
    title: 'Passing of the Lion', 
    desc: 'The death of Chhatrapati Shivaji Maharaj.',
    longDesc: `On April 3, 1680, at the age of 50, Chhatrapati Shivaji Maharaj passed away at Raigad Fort. His life's work was the creation of a powerful independent state from nothing.

He left behind an empire with over 300 forts, a powerful navy (one of India's first), and a professional army of over 100,000 soldiers. But his greatest legacy was the spirit of freedom he instilled in the people. 

Even after his death, the Maratha Empire continued to fight and eventually expanded across most of India. He remains a symbol of resistance against oppression and a visionary who pioneered administrative reforms, religious tolerance, and naval supremacy that were centuries ahead of their time.`,
    location: 'Raigad Fort',
    category: 'Birth',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hirakani_Buruj_Raigad.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Samadhi_of_Shivaji_Maharaj.jpg"
    ]
  },
];
