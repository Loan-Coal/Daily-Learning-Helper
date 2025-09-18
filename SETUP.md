# Development Setup Guide

## Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher)

## Quick Start

1. **Install dependencies for all packages:**
   ```bash
   npm run install:all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev:all
   ```

   This will start both the backend server (port 3001) and frontend development server (port 3000) concurrently.

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## Individual Setup

### Backend Setup

```bash
cd server
npm install
npm run db:push          # Setup database
npm run db:seed          # Seed with sample data
npm run dev              # Start development server
```

### Frontend Setup

```bash
cd client
npm install
npm run dev              # Start development server
```

## Environment Configuration

### Server (.env)
```
PORT=3001
DATABASE_URL="file:./dev.db"
```

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:3001
```

## Available Scripts

### Root Level
- `npm run dev:all` - Start both servers concurrently
- `npm run dev:server` - Start only backend server
- `npm run dev:client` - Start only frontend server
- `npm run build` - Build both projects
- `npm run test` - Run all tests
- `npm run install:all` - Install dependencies for all packages

### Backend (server/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm test` - Run backend tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Frontend (client/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run frontend tests
- `npm run lint` - Run ESLint

## Database

The application uses SQLite for development with Prisma ORM:

- Database file: `server/dev.db`
- Schema: `server/prisma/schema.prisma`
- Migrations: `server/prisma/migrations/`

### Database Operations

```bash
cd server

# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

## File Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks and API calls
│   │   ├── types/          # TypeScript type definitions
│   │   └── __tests__/      # Frontend tests
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── __tests__/      # Backend tests
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema and migrations
│   ├── uploads/            # File storage directory
│   └── package.json
└── package.json            # Root workspace configuration
```

## API Endpoints

### Files
- `POST /api/files` - Upload PDF files with tags
- `GET /api/files` - List files with sorting/filtering

### Quiz
- `POST /api/quiz/start` - Start new quiz session
- `POST /api/quiz/answer` - Submit answer for current question
- `POST /api/quiz/next` - Navigate to next question
- `POST /api/quiz/prev` - Navigate to previous question
- `GET /api/quiz/:sessionId` - Get quiz session state

### Health
- `GET /api/health` - Server health check

## Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### Run All Tests
```bash
npm test
```

## Production Build

1. **Build both projects:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   cd server
   npm start
   ```

3. **Serve frontend build:**
   The built frontend files are in `client/dist/` and can be served by any static file server.

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change ports in `.env` files
   - Kill existing processes: `npx kill-port 3000 3001`

2. **Database issues:**
   - Delete `server/dev.db` and run `npm run db:push` to recreate
   - Check `DATABASE_URL` in `server/.env`

3. **TypeScript errors:**
   - Run `npm run db:generate` to update Prisma client types
   - Check that all dependencies are installed

4. **CORS issues:**
   - Verify `VITE_API_BASE_URL` in `client/.env`
   - Ensure backend CORS is properly configured

### Logs

- Backend logs: Console output from `server/src/index.ts`
- Frontend logs: Browser developer console
- Build logs: Check terminal output during build process

## Contributing

1. Make sure all tests pass: `npm test`
2. Follow existing code style and patterns
3. Add tests for new features
4. Update documentation for significant changes