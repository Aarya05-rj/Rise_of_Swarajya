export interface Character {
  id: string;
  name: string;
  title: string;
  role: string;
  description: string;
  history: string;
  achievements: string[];
  image_url: string;
  wars: string[];
  born?: string;
  died?: string;
  quote?: string;
  legacy?: string;
}

export const legendaryCharacters: Character[] = [
  {
    id: 'shivaji',
    name: 'Chhatrapati Shivaji Maharaj',
    title: 'Founder of the Maratha Empire',
    role: 'The Visionary King',
    description: 'The legendary founder of the Maratha Empire who pioneered guerrilla warfare and naval supremacy.',
    history: `Chhatrapati Shivaji Maharaj (1630–1680) was a visionary leader and the founder of the Maratha Empire in western India. Born at Shivneri Fort to Shahaji Bhonsle and Jijabai, his early life was shaped by his mother's teachings and the rugged Sahyadri mountains. 

He is considered one of the greatest strategists in Indian history, pioneering 'Ganimi Kava' (guerrilla tactics) which leveraged the Deccan's unique geography to defeat much larger Mughal and Bijapuri armies. Shivaji Maharaj was not just a warrior; he was a master administrator who established a professional army, a powerful navy (Father of Indian Navy), and a sophisticated council of eight ministers known as the 'Ashtapradhan Mandal'.

His life was a series of legendary feats, from the killing of Afzal Khan at Pratapgad to the daring escape from Agra. He focused on 'Hindavi Swarajya'—self-rule by the people of the land. He promoted Marathi and Sanskrit over Persian in his court and was known for his religious tolerance and strict code of ethics, especially regarding the respect of women and civilians during war.`,
    achievements: [
      'Founded the Maratha Empire',
      'Father of the Indian Navy',
      'Established Ashtapradhan Mandal',
      'Captured over 300 Forts'
    ],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Shivaji_Maharaj.jpg',
    wars: ['Battle of Pratapgad', 'Battle of Kolhapur', 'Battle of Pavan Khind', 'Sack of Surat', 'Battle of Sinhagad']
  },
  {
    id: 'sambhaji',
    name: 'Chhatrapati Sambhaji Maharaj',
    title: 'Second Chhatrapati',
    role: 'The Brave Successor',
    description: 'The valiant second ruler of the Maratha Empire known for his immense bravery and military prowess.',
    history: `Chhatrapati Sambhaji Maharaj (1657–1689) was the eldest son of Shivaji Maharaj and the second ruler of the Maratha state. His reign was characterized by constant warfare against the Mughal Empire, the Siddis, and the Portuguese.

Sambhaji Maharaj was a brilliant scholar and a fierce warrior. During his nine-year reign, he fought over 120 battles and did not lose a single one—a testament to his tactical genius. He successfully defended the Maratha Empire against the full might of the Mughal Emperor Aurangzeb, who spent nearly a decade in the Deccan trying to capture him.

His ultimate sacrifice at the hands of Aurangzeb, where he chose a brutal death over renouncing his religion and kingdom, ignited a fire of resistance among the Marathas that eventually led to the downfall of the Mughal Empire. He remains a symbol of extreme valor and steadfastness.`,
    achievements: [
      'Undefeated in 120+ Battles',
      'Authored Budhbhushanam in Sanskrit',
      'Defended Swarajya for 9 years',
      'Symbol of Ultimate Sacrifice'
    ],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sambhaji_Maharaj_Potrait.jpg',
    wars: ['Battle of Kalyan', 'Siege of Janjira', 'Mughal-Maratha War (1680–1689)', 'Portuguese-Maratha War']
  },
  {
    id: 'jijabai',
    name: 'Rajmata Jijabai',
    title: 'Mother of Swarajya',
    role: 'The Guiding Light',
    description: 'The mother and mentor of Shivaji Maharaj who inspired the vision of Hindavi Swarajya.',
    history: `Jijabai (1598–1674) was the daughter of Lakhuji Jadhav and the wife of Shahaji Bhonsle. She was the primary architect of Shivaji Maharaj's character and mission. While her husband was away in the service of the Deccan Sultanates, she raised Shivaji in Pune, instilling in him the values of justice, courage, and independence.

She taught him the stories of the Ramayana and Mahabharata, shaping his moral compass. Jijabai was an able administrator herself, managing the Pune jagir and resolving local disputes with wisdom. Her vision was the creation of a kingdom where the local people could live with dignity and without fear of foreign oppression.

She lived to see her dream fulfilled, witnessing the grand coronation of her son as Chhatrapati in 1674, passing away just days after the ceremony, her life's mission accomplished.`,
    achievements: [
      'Primary Mentor to Shivaji Maharaj',
      'Administrator of Pune Jagir',
      'Visionary of Hindavi Swarajya',
      'Inspiration for Maratha Valor'
    ],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Statue_of_Shivaji_and_Jijabai_at_Shivneri.jpg',
    wars: ['Administrative Defense of Pune', 'Strategic Guidance of early Swarajya']
  },
  {
    id: 'tanaji',
    name: 'Tanaji Malusare',
    title: 'The Lion of Sinhagad',
    role: 'Supreme Commander',
    description: 'A close friend of Shivaji Maharaj who sacrificed his life to capture the strategic Sinhagad Fort.',
    history: `Tanaji Malusare was a childhood friend and trusted lieutenant of Shivaji Maharaj. He is best known for his heroic role in the Battle of Sinhagad in 1670. When Shivaji Maharaj decided to recapture the Kondhana Fort (later Sinhagad), Tanaji famously put aside his own son's wedding preparations, stating "Aadhi Lagin Kondhanyache, Mag Mazya Rayaba-che" (First the wedding of Kondhana, then my son Rayaba's).

Under the cover of night, Tanaji and a small group of soldiers scaled a sheer 800-foot cliff at the fort using ropes. A fierce battle ensued against the Rajput fort commander Udaybhan Rathod. Tanaji fought with incredible ferocity, even after his shield was broken, using his cloth-wrapped arm to parry blows.

Though Tanaji was martyred in the battle, his soldiers captured the fort. Upon hearing of his death, Shivaji Maharaj famously remarked, "Gad aala pan Sinha gela" (The fort is won, but the Lion is gone).`,
    achievements: [
      'Captured Sinhagad Fort',
      'Hero of the 1670 Campaign',
      'Legendary scaling of Donagiri Cliff',
      'Symbol of Ultimate Loyalty'
    ],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Tanaji_Malusare_Statue.jpg',
    wars: ['Battle of Sinhagad', 'Early Swarajya Campaigns']
  },
  {
    id: 'bajiprabhu',
    name: 'Baji Prabhu Deshpande',
    title: 'Hero of Pavankhind',
    role: 'Rear-guard Commander',
    description: 'The warrior who sacrificed his life holding the Ghodkhind pass to ensure Shivaji Maharaj\'s safety.',
    history: `Baji Prabhu Deshpande was a brilliant military commander who achieved immortality during the Siege of Panhala in 1660. When Shivaji Maharaj was trapped at Panhala Fort by Siddi Jauhar's army, Baji Prabhu led a daring night escape toward Vishalgad.

Realizing they were being pursued by a massive force, Baji Prabhu took a stand at the narrow Ghodkhind pass with 600 Mavalas. He ordered Shivaji Maharaj to continue to the fort while he held the pass against 10,000 enemy soldiers. Baji Prabhu fought for hours, refusing to succumb to his numerous wounds until he heard the cannon fire from Vishalgad, signaling Shivaji's safety.

His heroic stand is one of the most celebrated events in Maratha history. Shivaji renamed the pass 'Pavankhind' (The Sacred Pass) in honor of the blood shed by Baji Prabhu and his brave soldiers.`,
    achievements: [
      'Held Ghodkhind Pass against 10,000 soldiers',
      'Saved Shivaji Maharaj at Panhala',
      'Master of the Dand-Patta',
      'Legendary Rear-guard Action'
    ],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Baji_Prabhu_Deshpande_Statue.jpg',
    wars: ['Battle of Pavankhind', 'Siege of Panhala']
  },
  {
    id: 'bahirji',
    name: 'Bahirji Naik',
    title: 'Chief of Intelligence',
    role: 'The Spymaster',
    description: 'The master of disguise and chief of the Maratha intelligence network who was the eyes and ears of Swarajya.',
    history: `Bahirji Naik was the head of Shivaji Maharaj's intelligence department. A master of disguise, he was said to be able to infiltrate any enemy camp or city undetected. He could speak multiple languages and change his appearance, voice, and mannerisms effortlessly.

Bahirji's intelligence was critical to almost every major Maratha success. He provided the detailed map of the Mughal camp for the attack on Shaista Khan and gathered vital information for the two successful sacks of Surat. He was also instrumental in the planning of the Battle of Pratapgad, providing exact details of Afzal Khan's movements.

His network of spies was so efficient that Shivaji Maharaj was often aware of enemy plans even before they were fully formulated. Bahirji remains one of the most mysterious and crucial figures in the formation of the Maratha Empire.`,
    achievements: [
      'Headed India\'s first professional Intelligence Dept',
      'Master of 100+ Disguises',
      'Planned the Raid on Shaista Khan',
      'Vital Intelligence for Sacks of Surat'
    ],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/User_icon_2.svg/1200px-User_icon_2.svg.png',
    wars: ['Raid on Shaista Khan', 'Sack of Surat', 'Battle of Pratapgad', 'Invasion of Karnataka']
  },
  {
    id: 'kanhoji',
    name: 'Kanhoji Angre',
    title: 'Sarkhel (Admiral)',
    role: 'The Ocean Lord',
    description: 'The legendary admiral of the Maratha Navy who remained undefeated against European colonial powers.',
    history: `Kanhoji Angre (1669–1729) was the greatest naval commander of the Maratha Navy. Known as the 'Sarkhel', he established Maratha naval supremacy on the western coast of India. He operated from the island forts of Khanderi, Kolaba, and Vijaydurg.

Kanhoji successfully challenged the naval might of the British, Portuguese, and Dutch. He refused to pay taxes to the colonial powers and instead levied his own 'Chauth' on foreign ships entering Maratha waters. He was never defeated in battle by any European navy, and his defensive tactics and use of light, maneuverable ships (Gurabs and Galbats) were revolutionary.

He turned the Maratha Navy into a formidable force that protected the Indian coastline from foreign invasion for decades. He is rightfully remembered as one of the pioneers of naval warfare in India.`,
    achievements: [
      'Undefeated against British and Portuguese Navies',
      'Established Naval Bases at Vijaydurg and Khanderi',
      'Controlled the entire Konkan Coast',
      'Pioneer of Coastal Defense'
    ],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Kanhoji_Angre.jpg',
    wars: ['Battle of Khanderi', 'Siege of Vijaydurg', 'Naval Campaigns against Siddis']
  },
  {
    id: 'hambirrao',
    name: 'Hambirrao Mohite',
    title: 'Sarnobat (Commander-in-Chief)',
    role: 'The Charging General',
    description: 'The brave Commander-in-Chief of the Maratha army under both Shivaji and Sambhaji Maharaj.',
    history: `Hambirrao Mohite was the Commander-in-Chief (Sarnobat) of the Maratha army. He was a brilliant cavalry leader known for his lightning-fast raids and strategic retreats. He was the brother-in-law of Shivaji Maharaj and the father of Maharani Tarabai.

Hambirrao played a key role in the Battle of Nesari, where he took over command after the death of Prataprao Gujar and turned a potential defeat into a stunning victory. Under Sambhaji Maharaj, he led several successful campaigns into the heart of the Mughal Empire, including the famous raid on Burhanpur.

He died a hero's death in the Battle of Wai in 1687, fighting against a massive Mughal force led by Sarja Khan. His leadership ensured the survival of the Maratha state during its most turbulent years.`,
    achievements: [
      'Commander-in-Chief of the Maratha Army',
      'Winner of the Battle of Nesari',
      'Successful Raid on Burhanpur',
      'Legendary Cavalry Strategist'
    ],
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/User_icon_2.svg/1200px-User_icon_2.svg.png',
    wars: ['Battle of Nesari', 'Battle of Wai', 'Raid on Burhanpur', 'Karnataka Campaign']
  }
];
