-- Enhanced Character Schema with Related Tables
-- This provides a more normalized structure as requested.

-- 1. Main Characters Table
create table if not exists public.characters (
  id text primary key,
  name text not null,
  title text,
  role text,
  description text,
  history text,
  image_url text,
  born text,
  died text,
  born_place text,
  quote text,
  legacy text,
  weapon_of_choice text,
  respected_rank text,
  created_at timestamptz not null default now()
);

-- 2. Character Achievements Table
create table if not exists public.character_achievements (
  id bigserial primary key,
  character_id text references public.characters(id) on delete cascade,
  achievement text not null,
  created_at timestamptz not null default now()
);

-- 3. Character Wars Table
create table if not exists public.character_wars (
  id bigserial primary key,
  character_id text references public.characters(id) on delete cascade,
  war_name text not null,
  created_at timestamptz not null default now()
);

-- Seed Main Characters
insert into public.characters (id, name, title, role, description, history, image_url, born, died, born_place, quote, legacy, weapon_of_choice, respected_rank) values
('shivaji', 'Chhatrapati Shivaji Maharaj', 'Founder of the Maratha Empire', 'The Visionary King', 'The legendary founder of the Maratha Empire who pioneered guerrilla warfare and naval supremacy.', 'Chhatrapati Shivaji Maharaj (1630–1680) was a visionary leader and the founder of the Maratha Empire in western India...', 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Shivaji_Maharaj.jpg', '1630', '1680', 'Shivneri Fort', 'Swarajya is the birthright of every soul born on this holy soil.', 'Founded a sovereign state based on justice and religious tolerance.', 'Bhavani Talwar', 'Chhatrapati'),
('sambhaji', 'Chhatrapati Sambhaji Maharaj', 'Second Chhatrapati', 'The Brave Successor', 'The valiant second ruler of the Maratha Empire known for his immense bravery and military prowess.', 'Chhatrapati Sambhaji Maharaj (1657–1689) was the eldest son of Shivaji Maharaj and the second ruler of the Maratha state...', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Sambhaji_Maharaj_Potrait.jpg', '1657', '1689', 'Purandar Fort', 'To serve the Chhatrapati and the Swarajya is the highest honor a warrior can attain.', 'Kept the Maratha resistance alive against overwhelming Mughal forces.', 'Wagh Nakh', 'Chhatrapati'),
('jijabai', 'Rajmata Jijabai', 'Mother of Swarajya', 'The Guiding Light', 'The mother and mentor of Shivaji Maharaj who inspired the vision of Hindavi Swarajya.', 'Jijabai (1598–1674) was the daughter of Lakhuji Jadhav and the wife of Shahaji Bhonsle...', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Statue_of_Shivaji_and_Jijabai_at_Shivneri.jpg', '1598', '1674', 'Sindkhed Raja', 'A true leader is born from the values taught by a mother.', 'The moral and spiritual foundation of Swarajya.', 'Wisdom & Strategy', 'Rajmata'),
('tanaji', 'Tanaji Malusare', 'The Lion of Sinhagad', 'Supreme Commander', 'A close friend of Shivaji Maharaj who sacrificed his life to capture the strategic Sinhagad Fort.', 'Tanaji Malusare was a childhood friend and trusted lieutenant of Shivaji Maharaj...', 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Tanaji_Malusare_Statue.jpg', '1600s', '1670', 'Umrathe', 'First the wedding of Kondhana, then my son Rayaba.', 'Symbol of ultimate sacrifice and friendship.', 'Sword & Shield', 'Subhedar'),
('bajiprabhu', 'Baji Prabhu Deshpande', 'Hero of Pavankhind', 'Rear-guard Commander', 'The warrior who sacrificed his life holding the Ghodkhind pass to ensure Shivaji Maharaj''s safety.', 'Baji Prabhu Deshpande was a brilliant military commander who achieved immortality during the Siege of Panhala...', 'https://upload.wikimedia.org/wikipedia/commons/6/60/Baji_Prabhu_Deshpande_Statue.jpg', '1600s', '1660', 'Shind', 'I will not die until I hear the cannon fire from Vishalgad.', 'A benchmark of bravery and rear-guard tactics.', 'Dand-Patta', 'Sardar'),
('bahirji', 'Bahirji Naik', 'Chief of Intelligence', 'The Spymaster', 'The master of disguise and chief of the Maratha intelligence network who was the eyes and ears of Swarajya.', 'Bahirji Naik was the head of Shivaji Maharaj''s intelligence department...', 'https://i.pinimg.com/736x/88/06/1d/88061d4a8f9485c2921571d43a7589d3.jpg', '1600s', '1600s', 'Unknown', 'Intelligence is the invisible shield of the kingdom.', 'Created one of the most effective spy networks in history.', 'Disguise & Dagger', 'Chief of Intelligence'),
('kanhoji', 'Kanhoji Angre', 'Sarkhel (Admiral)', 'The Ocean Lord', 'The legendary admiral of the Maratha Navy who remained undefeated against European colonial powers.', 'Kanhoji Angre (1669–1729) was the greatest naval commander of the Maratha Navy...', 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Kanhoji_Angre.jpg', '1669', '1729', 'Ratnagiri', 'The sea belongs to those who have the courage to guard it.', 'Established Maratha naval supremacy on the west coast.', 'Naval Cannon & Sword', 'Sarkhel'),
('hambirrao', 'Hambirrao Mohite', 'Sarnobat (Commander-in-Chief)', 'The Charging General', 'The brave Commander-in-Chief of the Maratha army under both Shivaji and Sambhaji Maharaj.', 'Hambirrao Mohite was the Commander-in-Chief (Sarnobat) of the Maratha army...', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-vK1V-v0W-y-o3g-f-X-v0W-y-o3g-f-X-w&s', '1630s', '1687', 'Talbid', 'A general''s duty is to lead from the front, even into the jaws of death.', 'Unified the Maratha army during a critical transition period.', 'Cavalry Sword', 'Sarnobat')
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  role = excluded.role,
  description = excluded.description,
  history = excluded.history,
  image_url = excluded.image_url,
  born = excluded.born,
  died = excluded.died,
  born_place = excluded.born_place,
  quote = excluded.quote,
  legacy = excluded.legacy,
  weapon_of_choice = excluded.weapon_of_choice,
  respected_rank = excluded.respected_rank;

-- Seed Achievements
insert into public.character_achievements (character_id, achievement) values
('shivaji', 'Founded the Maratha Empire'),
('shivaji', 'Father of the Indian Navy'),
('shivaji', 'Established Ashtapradhan Mandal'),
('shivaji', 'Captured over 300 Forts'),
('sambhaji', 'Undefeated in 120+ Battles'),
('sambhaji', 'Authored Budhbhushanam in Sanskrit'),
('sambhaji', 'Defended Swarajya for 9 years'),
('sambhaji', 'Symbol of Ultimate Sacrifice'),
('jijabai', 'Primary Mentor to Shivaji Maharaj'),
('jijabai', 'Administrator of Pune Jagir'),
('jijabai', 'Visionary of Hindavi Swarajya'),
('jijabai', 'Inspiration for Maratha Valor'),
('tanaji', 'Captured Sinhagad Fort'),
('tanaji', 'Hero of the 1670 Campaign'),
('tanaji', 'Legendary scaling of Donagiri Cliff'),
('tanaji', 'Symbol of Ultimate Loyalty'),
('bajiprabhu', 'Held Ghodkhind Pass against 10,000 soldiers'),
('bajiprabhu', 'Saved Shivaji Maharaj at Panhala'),
('bajiprabhu', 'Master of the Dand-Patta'),
('bajiprabhu', 'Legendary Rear-guard Action'),
('bahirji', 'Headed India''s first professional Intelligence Dept'),
('bahirji', 'Master of 100+ Disguises'),
('bahirji', 'Planned the Raid on Shaista Khan'),
('bahirji', 'Vital Intelligence for Sacks of Surat'),
('kanhoji', 'Undefeated against British and Portuguese Navies'),
('kanhoji', 'Established Naval Bases at Vijaydurg and Khanderi'),
('kanhoji', 'Controlled the entire Konkan Coast'),
('kanhoji', 'Pioneer of Coastal Defense'),
('hambirrao', 'Commander-in-Chief of the Maratha Army'),
('hambirrao', 'Winner of the Battle of Nesari'),
('hambirrao', 'Successful Raid on Burhanpur'),
('hambirrao', 'Legendary Cavalry Strategist');

-- Seed Wars
insert into public.character_wars (character_id, war_name) values
('shivaji', 'Battle of Pratapgad'),
('shivaji', 'Battle of Kolhapur'),
('shivaji', 'Battle of Pavan Khind'),
('shivaji', 'Sack of Surat'),
('shivaji', 'Battle of Sinhagad'),
('sambhaji', 'Battle of Kalyan'),
('sambhaji', 'Siege of Janjira'),
('sambhaji', 'Mughal-Maratha War (1680–1689)'),
('sambhaji', 'Portuguese-Maratha War'),
('jijabai', 'Administrative Defense of Pune'),
('jijabai', 'Strategic Guidance of early Swarajya'),
('tanaji', 'Battle of Sinhagad'),
('tanaji', 'Early Swarajya Campaigns'),
('bajiprabhu', 'Battle of Pavankhind'),
('bajiprabhu', 'Siege of Panhala'),
('bahirji', 'Raid on Shaista Khan'),
('bahirji', 'Sack of Surat'),
('bahirji', 'Battle of Pratapgad'),
('bahirji', 'Invasion of Karnataka'),
('kanhoji', 'Battle of Khanderi'),
('kanhoji', 'Siege of Vijaydurg'),
('kanhoji', 'Naval Campaigns against Siddis'),
('hambirrao', 'Battle of Nesari'),
('hambirrao', 'Battle of Wai'),
('hambirrao', 'Raid on Burhanpur'),
('hambirrao', 'Karnataka Campaign');
