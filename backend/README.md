# Portfolio Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
- Copy `.env.example` to `.env`
- Update the variables in `.env`:

```bash
cp .env.example .env
```

### 3. Environment Variables
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
DB_NAME=vivek_data

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URLS=http://localhost:5173,https://your-vercel-domain.vercel.app

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Chatbot Protection
CHATBOT_RATE_WINDOW_MS=60000
CHATBOT_MAX_REQUESTS_PER_WINDOW=8
CHATBOT_DAILY_LIMIT=80

# Admin
ADMIN_SECRET=choose-a-strong-secret
PROJECT_ACCESS_SECRET=choose-a-separate-strong-secret
```

`PROJECT_ACCESS_SECRET` is used to sign temporary access tokens for locked project pages. For production, keep it different from `ADMIN_SECRET`.

### 4. Start the Server
```bash
npm start   # runs src/server.js
```

## API Endpoints

- `GET/POST /projects` - Projects management
- `GET/POST /about` - About section
- `POST /feedback` - Submit feedback
- `GET/POST /skills` - Skills (coming soon)
- `GET/POST /experience` - Experience (coming soon)

## Database

Uses MongoDB with Mongoose ODM. Make sure MongoDB is running locally or update `MONGODB_URI` for cloud database.

## Render + Vercel Notes

When the frontend is deployed to Vercel, add the Vercel domain to `FRONTEND_URLS` on Render. Keep `VITE_API_BASE_URL` on Vercel pointed at the Render API URL, including `/api`.

## Folder Structure (backend)

- `src/server.js` — bootstraps env, connects DB, starts HTTP server
- `src/app.js` — Express app, middleware, route mounting
- `src/routes/` — route definitions and router aggregator
- `src/controllers/` — request handlers
- `src/models/` — Mongoose schemas and models
- `src/middlewares/` — cross-cutting middleware (rate limiting etc.)
- `src/config/` — environment loading and database connection
- `src/constants/` — shared constant values (messages)
