# Rise of Swarajya Admin Panel

Production-ready MERN-style admin panel using React, Node, Express and Supabase PostgreSQL/Storage instead of MongoDB.
The editor uses `react-quill-new`, a maintained React Quill-compatible package, to avoid the legacy `quill@1` security advisory.

## Structure

```txt
client/   React + Vite admin frontend
server/   Express REST API with JWT auth, Multer and Supabase
```

## Setup

1. Create a Supabase project.
2. Run `server/sql/admin_schema.sql` in the Supabase SQL editor.
3. Copy environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Fill `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, and `VITE_API_BASE_URL`.
5. Install and run:

```bash
cd server
npm install
npm run dev

cd ../client
npm install
npm run dev
```

Admin client: `http://localhost:5173`
API: `http://localhost:5000/api`

## Admin Account

The SQL file includes a seed admin:

- Email: `admin@riseofswarajya.com`
- Password: `Admin@12345`

Replace it immediately. To generate a new bcrypt hash:

```bash
cd server
npm run hash:password -- YourStrongPassword
```

Then update `admins.password_hash` in Supabase.

## API Routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `GET /api/dashboard`
- `GET /api/stories`
- `GET /api/stories/:id`
- `POST /api/stories`
- `PUT /api/stories/:id`
- `DELETE /api/stories/:id`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/gallery`
- `POST /api/gallery/upload`
- `DELETE /api/gallery/:id`

## Supabase Storage

The SQL creates a public bucket named `admin-media` and policies for service-role writes. Uploaded story covers, event images and gallery files are stored with paths under `stories/`, `events/`, and `gallery/`.

## Deployment

Backend:
- Deploy `server/` to Render, Railway, Fly.io or a Node host.
- Set production env vars.
- Set `CLIENT_URL` to your deployed frontend URL.

Frontend:
- Deploy `client/` to Vercel, Netlify or static hosting.
- Set `VITE_API_BASE_URL=https://your-api-domain.com/api`.

Security notes:
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the client.
- Rotate the seed admin password.
- Use a long random `JWT_SECRET`.
