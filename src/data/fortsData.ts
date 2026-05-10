export interface Fort {
  id: string;
  name: string;
  location: string;
  description: string;
  history: string;
  architecture: string;
  importance: string;
  image_url: string;
  altitude: string;
  built_by: string;
  gallery: string[];
  map_url?: string;
}

export const majorForts: Fort[] = [
  {
    id: 'rajgad',
    name: 'Rajgad Fort',
    location: 'Pune, Maharashtra',
    description: 'The "King of Forts", which served as the capital of the Maratha Empire for 26 years.',
    history: 'Rajgad was the capital of the Maratha Empire under Chhatrapati Shivaji Maharaj for 26 years. It is the place where Shivaji\'s son, Rajaram Maharaj, was born. The fort has witnessed many historic events, including the burial of Afzal Khan\'s head.',
    architecture: 'The fort is massive and features three plateau-like structures called Machis: Padmavati Machi, Sanjeevani Machi, and Suvela Machi. The Bale Killa (highest point) is virtually inaccessible and offers a 360-degree view.',
    importance: 'Considered one of the most impenetrable forts in the world, its strategic design allowed for long-term administration and military defense.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Rajgad_Fort_view.jpg',
    altitude: '1,376 m (4,514 ft)',
    built_by: 'Maratha Empire',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/e/e1/Rajgad_Fort_view.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/f/f0/Bale_Killa_Rajgad.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/bd/Suvela_Machi_Rajgad.jpg"
    ]
  },
  {
    id: 'torna',
    name: 'Torna Fort (Prachandagad)',
    location: 'Pune, Maharashtra',
    description: 'The first fort captured by Shivaji Maharaj at the age of 16.',
    history: 'Captured by Shivaji Maharaj in 1646, making it his first major conquest. During its renovation, gold was discovered buried on the fort, which was used to finance the construction of Rajgad. It was briefly captured by the Mughals in 1704 but later reclaimed by the Marathas.',
    architecture: 'Key features include the \'Zunjar Machi\' and \'Budhla Machi\'. The fort has multiple gates like Bini Darwaza and Kothi Darwaza, and houses the Menghai Devi temple (Tornaji temple).',
    importance: 'As the first conquest, it laid the foundation of Swarajya. Its extreme height provided a strategic vantage point overlooking the entire valley.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Kille_torna_zunjar_machi.jpg',
    altitude: '1,403 m (4,603 ft)',
    built_by: 'Maratha Empire',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/4/4b/Kille_torna_zunjar_machi.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/d/de/069torna2.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Zunzar_Machi_at_Torna.jpg"
    ]
  },
  {
    id: 'raigad',
    name: 'Raigad Fort',
    location: 'Raigad, Maharashtra',
    description: 'The capital of the Maratha Empire and site of Shivaji Maharaj\'s coronation.',
    history: 'Became the capital in 1674. It was the site of Chhatrapati Shivaji Maharaj\'s coronation on June 6, 1674. After the death of Sambhaji Maharaj, the fort was besieged and captured by Zulfikar Khan in 1689.',
    architecture: 'Designed by Hiroji Indulkar. It features the Maha Darwaza, Nagarkhana (throne entrance), and the infamous Takmak Tok cliff. It also contains the Samadhi of Shivaji Maharaj and the Jagdishwar Temple.',
    importance: 'Its location atop a flat-topped hill with steep sides made it virtually impregnable, serving as the nerve center for Maratha administration.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Nagarkhana%2C_Raigad_Fort%2C_India.jpg',
    altitude: '1,356 m (4,400 ft)',
    built_by: 'Hiroji Indulkar',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Nagarkhana%2C_Raigad_Fort%2C_India.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Raigad_Fort_Maha_Darwaja.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/4/4e/Hirakani_Buruj_Raigad.jpg"
    ]
  },
  {
    id: 'pratapgad',
    name: 'Pratapgad Fort',
    location: 'Satara, Maharashtra',
    description: 'Site of the historic encounter between Shivaji Maharaj and Afzal Khan.',
    history: 'Famous for the Battle of Pratapgad in 1659, where Shivaji Maharaj defeated and killed Afzal Khan of the Bijapur Sultanate. This victory was a massive turning point for Maratha independence.',
    architecture: 'The fort is divided into Lower and Upper sections. It features the Afzal Buruj, the Bhavani Temple built by Shivaji, and the Tehlani Buruj watchtower.',
    importance: 'It guarded the Par pass and commanded the Nira and Koyna rivers, serving as a gateway to the Konkan region.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Pratapgad_The_Fort_of_Valour.jpg',
    altitude: '1,080 m (3,540 ft)',
    built_by: 'Moropant Trimbak Pingle',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Pratapgad_The_Fort_of_Valour.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Pratapgad_entrance.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/3/3d/Afzal_Khan_Tomb_at_Pratapgad.jpg"
    ]
  },
  {
    id: 'sinhagad',
    name: 'Sinhagad Fort (Kondhana)',
    location: 'Pune, Maharashtra',
    description: 'The "Lion\'s Fort", immortalized by the bravery of Tanaji Malusare.',
    history: 'Renowned for the Battle of Sinhagad in 1670. Tanaji Malusare climbed the sheer cliffs at night to capture the fort. Shivaji famously said, \'Gad aala pan Sinha gela\' upon Tanaji\'s death.',
    architecture: 'Key structures include the Pune and Kalyan Darwazas. It houses the Samadhi of Tanaji Malusare, a memorial to Rajaram Maharaj, and Kade Lot cliff.',
    importance: 'Located centrally among other forts, it provided essential defense for Pune and control over the surrounding plains.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Sinhagad_Fort_Top_View.jpg',
    altitude: '1,312 m (4,304 ft)',
    built_by: 'Nagarjuna (Traditional)',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Sinhagad_Fort_Top_View.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Kalyan_Darwaza%2C_Sinhagad_Fort.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Tanaji_Malusare_Samadhi_at_Sinhagad.jpg"
    ]
  },
  {
    id: 'shivneri',
    name: 'Shivneri Fort',
    location: 'Junnar, Maharashtra',
    description: 'The sacred birthplace of Chhatrapati Shivaji Maharaj.',
    history: 'Shivaji Maharaj was born here on Feb 19, 1630. He spent his early childhood here, learning warfare and administration from his mother, Jijabai.',
    architecture: 'Features a seven-gate defense system including Maha and Shivai Darwazas. It contains the birth chamber (Shivai Janmasthan) and Ambarkhana granary.',
    importance: 'Extremely secure birth-place with steep slopes on all sides, symbolizing the resilience of the Maratha spirit.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shivneri_fort1.JPG',
    altitude: '1,067 m (3,501 ft)',
    built_by: 'Yadavas of Devagiri',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shivneri_fort1.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Shivneri_Fort_Entrance.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Statue_of_Shivaji_and_Jijabai_at_Shivneri.jpg"
    ]
  },
  {
    id: 'purandar',
    name: 'Purandar Fort',
    location: 'Pune, Maharashtra',
    description: 'The strategic fort where the Treaty of Purandar was signed.',
    history: 'In 1665, the fort was besieged by the Mughal general Jai Singh. The fierce battle led to the Treaty of Purandar, where Shivaji Maharaj had to cede 23 forts to the Mughals.',
    architecture: 'It consists of two distinct levels: Balekilla (upper fort) and Machi (lower fort). It features the Purandeshwar temple and the Kedareshwar temple on the peak.',
    importance: 'Served as a vital military outpost and the birthplace of Sambhaji Maharaj, the second Chhatrapati of the Maratha Empire.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Purandar_fort.jpg',
    altitude: '1,387 m (4,551 ft)',
    built_by: 'Yadavas of Devagiri',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/6/65/Purandar_fort.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/a/aa/Statue_of_Murarbaji_at_Purandar.jpg"
    ]
  },
  {
    id: 'lohagad',
    name: 'Lohagad Fort',
    location: 'Lonavala, Maharashtra',
    description: 'The "Iron Fort" that stood invincible for centuries.',
    history: 'A major fort used by Shivaji Maharaj to store treasury captured from Surat. It has been held by many dynasties including the Satavahanas, Mughals, and Marathas.',
    architecture: 'Famous for its four massive gates: Ganesh Darwaza, Narayan Darwaza, Hanuman Darwaza, and Maha Darwaza. It features the Vinchu Kata (Scorpion\'s tail) point.',
    importance: 'Strategically located overlooking the trade routes between the Deccan and the Konkan coast.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Lohgad.jpg',
    altitude: '1,033 m (3,389 ft)',
    built_by: 'Satavahanas / Maratha Empire',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/1/15/Lohgad.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/f/f9/Lohagad_Fort_Gates.jpg"
    ]
  },
  {
    id: 'vijaydurg',
    name: 'Vijaydurg Fort',
    location: 'Sindhudurg, Maharashtra',
    description: 'The oldest and most powerful naval fort on the Konkan coast.',
    history: 'Extended by Shivaji Maharaj in 1653 to become a primary naval base. It was considered the "Gibraltar of the East" due to its impregnable walls surrounded by the sea.',
    architecture: 'Surrounded by the Waghotan creek on three sides. It features a unique triple-layered fortification wall and secret underwater tunnels.',
    importance: 'The nerve center of the Maratha Navy, used to challenge European colonial powers on the Arabian Sea.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Vijaydurg_Fort_View.jpg',
    altitude: 'Sea Level',
    built_by: 'Bhoja II / Maratha Empire',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/d/de/Vijaydurg_Fort_View.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Vijaydurg_Bastions.jpg"
    ]
  },
  {
    id: 'panhala',
    name: 'Panhala Fort',
    location: 'Kolhapur, Maharashtra',
    description: 'One of the largest and most strategic forts in the Deccan.',
    history: 'Shivaji Maharaj was besieged here in 1660 by Siddi Johar. He escaped in a daring night mission while Baji Prabhu Deshpande fought the heroic Battle of Pavan Khind.',
    architecture: 'Features Teen Darwaza, Andhar Bavadi (hidden well), Amberkhana (granaries), and Sajja Kothi (viewing gallery).',
    importance: 'Largest fort in the Deccan, controlling vital trade routes between the coast and the plateau.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Teen_Darwaja_Panhala_Fort.jpg',
    altitude: '845 m (2,772 ft)',
    built_by: 'Bhoja II (Shilahara Dynasty)',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Teen_Darwaja_Panhala_Fort.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/0b/Andhar_Bavadi_Panhala_Fort.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/ea/Amberkhana_Panhala_Fort.jpg"
    ]
  },
  {
    id: 'raireshwar',
    name: 'Raireshwar Temple (Plateau)',
    location: 'Bhor, Maharashtra',
    description: 'The sacred location where the oath of Swarajya was taken.',
    history: 'In 1645, a young Shivaji Maharaj and his close Mavala friends took a solemn oath at the Raireshwar temple to establish Hindavi Swarajya. They performed a ritual of \'Rakt-Abhishek\' (anointing with blood) on the Shivalinga.',
    architecture: 'A traditional stone temple situated on a high plateau. The plateau itself is vast and offers natural protection, accessible only through a few narrow passes.',
    importance: 'The spiritual birthplace of Swarajya. It represents the unwavering commitment of the Marathas to self-rule and justice.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Raireshwar_Temple_Entrance.jpg',
    altitude: '1,373 m (4,505 ft)',
    built_by: 'Ancient / Pandavas (Traditional)',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Raireshwar_Temple_Entrance.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/b1/Raireshwar_Fort_Plateau.jpg"
    ]
  },
  {
    id: 'agra',
    name: 'Agra (The Escape)',
    location: 'Agra, Uttar Pradesh',
    description: 'The site of Shivaji Maharaj\'s daring escape from Mughal confinement.',
    history: 'In 1666, Shivaji Maharaj and his son Sambhaji were imprisoned by Aurangzeb in Agra. They executed a legendary escape by hiding in large baskets of sweets intended for charity.',
    architecture: 'The events primarily took place around the Agra Fort, a massive sandstone structure that was the main residence of the Mughal Emperors.',
    importance: 'The escape humiliated the Mughal Empire and boosted the morale of the Marathas, proving Shivaji\'s strategic brilliance on a national stage.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Agra_Fort_View.jpg',
    altitude: '170 m (560 ft)',
    built_by: 'Mughal Empire',
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Agra_Fort_View.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/0e/Shivaji_in_Aurangzeb%27s_Court.jpg"
    ]
  }
];
