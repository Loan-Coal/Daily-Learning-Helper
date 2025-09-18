# Danta Agentic Teaching MVP

A full-stack web application for uploading course materials and generating personalized quizzes.

## Features

- Upload PDF course materials with tagging
- Material library with sorting and filtering
- Quiz generation from uploaded content
- Session-based quiz taking with progress persistence

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Prisma ORM + SQLite
- **File Processing**: pdf-parse for text extraction

## Development

```bash
# Install all dependencies
npm run install:all

# Start both client and server in development mode
npm run dev:all

# Or start individually
npm run dev:server
npm run dev:client
```

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── server/uploads/  # File storage
└── package.json     # Root workspace config
```

## Environment Variables

Create `.env` files in both client and server directories with the required configuration.