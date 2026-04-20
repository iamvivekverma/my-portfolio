# Portfolio Frontend

Personal portfolio website built with React, Vite, and Tailwind CSS.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Project Structure

- `src/app/` - Layout components (Navbar, Footer, RootLayout)
- `src/pages/` - Page components (Home, About, Projects, etc.)
- `src/features/` - Feature-based components (about, experience, projects, skills)
- `src/shared/` - Shared components and utilities
- `src/services/` - API service layer for backend communication
- `src/components/` - Reusable UI components

## Technologies Used

- React 19
- Vite
- Tailwind CSS 4
- React Router DOM
- Framer Motion
- Lucide React

## Deployment

This frontend is designed to be deployed on Vercel.

1. Connect your GitHub repository to Vercel
2. Set environment variable: `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`
3. Vercel will automatically build and deploy

The repo-level `vercel.json` builds `frontend` and serves `frontend/dist`, so the default Vercel settings do not need to be changed manually.
