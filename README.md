# Rise of Swarajya ??

A full-stack educational web application about the **Maratha Empire** and the legendary **Chhatrapati Shivaji Maharaj**.

---

##  Project Structure

```
Antigravity/
+-- backend/                 ? Node.js / Express API
¦   +-- config/              ? Supabase DB configuration
¦   +-- controllers/         ? Business logic
¦   +-- middleware/          ? Auth validation middleware
¦   +-- models/              ? Database schema references
¦   +-- routes/              ? API endpoint definitions
¦   +-- server.js            ? Main backend entry point
¦   +-- .env                 ? Secrets (Supabase keys, PORT)
¦   +-- package.json
¦
+-- frontend/                ? React + Vite (TypeScript)
¦   +-- src/
¦   ¦   +-- components/      ? Reusable UI components
¦   ¦   +-- context/         ? React Context (Auth)
¦   ¦   +-- hooks/           ? Custom React hooks
¦   ¦   +-- pages/           ? Application screens
¦   ¦   +-- services/        ? API service layer
¦   ¦   +-- App.tsx
¦   ¦   +-- main.tsx
¦   +-- public/              ? Static assets & images
¦   +-- index.html
¦   +-- package.json
¦
+-- README.md
+-- .gitignore
```

---

##  Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS |
| Backend   | Node.js, Express.js                 |
| Database  | Supabase (PostgreSQL)               |
| Auth      | Supabase Auth                       |
| Animation | Framer Motion                       |
| Icons     | Lucide React                        |

---

##   Getting Started

### Prerequisites
- Node.js v18+
- A Supabase project with the required tables

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Antigravity
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create .env file with:
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_anon_key
# PORT=5000
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will run at **http://localhost:5173** (frontend) and **http://localhost:5000** (backend API).

---

##   API Endpoints

| Method | Endpoint                | Description                  |
|--------|-------------------------|------------------------------|
| GET    | /api/forts              | Fetch all forts              |
| GET    | /api/characters         | Fetch all Maratha legends    |
| GET    | /api/powadas            | Fetch all powadas (ballads)  |
| GET    | /api/profile/:id        | Fetch user profile           |
| POST   | /api/profile/:id        | Update user profile          |
| POST   | /api/update-score       | Update XP score and rank     |
| GET    | /api/activities/:id     | Fetch user activity history  |
| POST   | /api/log-activity       | Log a user activity event    |

---

##  Rank System

| XP Range  | Rank      |
|-----------|-----------|
| 0 – 50    | Beginner  |
| 51 – 100  | Warrior   |
| 101 – 200 | Hero      |
| 200+      | King      |

---

##  Supabase Schema

### Tables Required
- `profiles` - User data, score, rank, progress
- `fort_images` - Fort entries with images
- `character_image` - Historical figures
- `powada` - Audio ballads
- `user_activities` - Event tracking log
- `quiz_results` - Quiz history per user

---

##  Authors

Built with honor and respect for **Maratha History** ??
