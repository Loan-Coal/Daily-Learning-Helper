# Danta Agentic Teaching with MCP Integration

An intelligent learning platform that generates contextual quiz questions from your uploaded documents using AI. Features include PDF document processing, vector search, and AI-powered question generation with graceful fallback to curated questions.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone and setup the project:**
```bash
git clone <your-repo-url>
cd DantaAgenticTeaching
node scripts/setup-mcp.js
```

2. **Configure your API keys:**
   - Copy `.env.template` to `.env` in each service directory
   - Add your Mixtral API key (get it from https://console.mistral.ai/)
   - Add your HuggingFace API key (get it from https://huggingface.co/settings/tokens)

3. **Start all services:**
```bash
# Terminal 1 - Backend Server
cd server && npm run dev

# Terminal 2 - MCP Server (AI Service)
cd mcp-server && npm run dev

# Terminal 3 - Frontend Client
cd client && npm run dev
```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - MCP Server: http://localhost:3002

## 🏗️ Architecture Overview

The system consists of three main services:

### 1. **Client (React + Vite + TypeScript)**
- **Port:** 5173 (dev)
- **Purpose:** User interface for document upload, quiz taking, and library management
- **Key Features:**
  - Document upload with drag-and-drop
  - Tag-based quiz generation
  - Real-time quiz progress with loading states
  - Responsive design with Tailwind CSS

### 2. **Server (Node.js + Express + Prisma)**
- **Port:** 3001
- **Purpose:** Main backend API handling authentication, file storage, and quiz sessions
- **Key Features:**
  - JWT-based authentication
  - File upload and metadata storage
  - Quiz session management
  - Integration with MCP server for AI features

### 3. **MCP Server (AI/Vector Service)**
- **Port:** 3002
- **Purpose:** AI-powered document processing and question generation
- **Key Features:**
  - PDF text extraction and chunking
  - Vector embeddings with Chroma DB
  - Mixtral LLM integration for question generation
  - Semantic search and context retrieval

## 🤖 AI Features

### Question Generation Flow
1. **Document Processing:**
   - Upload PDFs through the web interface
   - Text extraction and intelligent chunking (1500 chars with 200 char overlap)
   - Vector embedding generation using sentence-transformers

2. **Quiz Creation:**
   - Select topic tags and question count
   - AI analyzes uploaded documents for relevant content
   - Mixtral LLM generates contextual multiple-choice questions
   - Automatic fallback to curated questions if AI is unavailable

3. **Smart Features:**
   - Duplicate question detection
   - Semantic content search
   - Context-aware question generation
   - Progressive loading with real-time status

## 📁 Project Structure

```
DantaAgenticTeaching/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── api/              # API client functions
│   │   └── hooks/            # Custom React hooks
├── server/                   # Main backend API
│   ├── src/
│   │   ├── controllers/      # API endpoint handlers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth, validation, etc.
│   │   └── prisma/           # Database schema
├── mcp-server/              # AI/Vector service
│   ├── src/
│   │   ├── services/        # AI processing services
│   │   ├── providers/       # Data providers
│   │   └── routes/          # MCP API endpoints
├── shared/                  # Shared TypeScript types
├── fixtures/               # Mock data and uploads
├── scripts/               # Setup and migration scripts
└── .env.template         # Environment configuration template
```

## 🔧 Configuration

### Environment Variables

Each service requires specific environment configuration:

#### Client (.env)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_MCP_SERVER_URL=http://localhost:3002
```

#### Server (.env)
```env
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=your_secure_secret_here
MCP_SERVER_URL=http://localhost:3002
```

#### MCP Server (.env)
```env
PORT=3002
MIXTRAL_API_KEY=your_mixtral_key_here
HUGGINGFACE_API_KEY=your_hf_key_here
JWT_SECRET=your_secure_secret_here
CHROMA_PERSIST_DIRECTORY=./chroma_data
```

### API Keys Setup

1. **Mixtral API Key:**
   - Visit https://console.mistral.ai/
   - Create account and generate API key
   - Add to `mcp-server/.env`

2. **HuggingFace API Key:**
   - Visit https://huggingface.co/settings/tokens
   - Generate token with "Read" permissions
   - Add to `mcp-server/.env`

## 🎯 Usage Guide

### 1. Upload Documents
- Navigate to `/upload`
- Drag and drop PDF files or click to select
- Add relevant topic tags (e.g., "mathematics", "science")
- Documents are processed and indexed automatically

### 2. Generate AI Quizzes
- Go to `/quiz`
- Select topic tags from your uploaded documents
- Choose number of questions (1-50)
- Click "Start Quiz" to begin AI generation
- Wait for processing (shows progress and fallback notices)

### 3. Take Quizzes
- Answer multiple-choice questions
- Get immediate feedback with explanations
- Navigate between questions
- View final results

### 4. Manage Library
- View all uploaded documents at `/library`
- See processing status and metadata
- Manage tags and document organization

## 🔍 API Endpoints

### Main Server (Port 3001)
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/quiz/start` - Start quiz session
- `POST /api/files/upload` - Upload documents
- `GET /api/files` - List user files

### MCP Server (Port 3002)
- `GET /health` - Service health check
- `POST /api/documents/process` - Process uploaded document
- `POST /api/questions/generate` - Generate questions with AI
- `GET /api/questions/test-mixtral` - Test Mixtral connection

## 🧪 Development

### Running Tests
```bash
# Server tests
cd server && npm test

# Client tests  
cd client && npm test

# MCP server tests
cd mcp-server && npm test
```

### Database Management
```bash
# Reset database
cd server && npx prisma db push --force-reset

# View database
cd server && npx prisma studio

# Generate Prisma client
cd server && npx prisma generate
```

### Building for Production
```bash
# Build all services
cd client && npm run build
cd server && npm run build
cd mcp-server && npm run build
```

## 🚨 Troubleshooting

### Common Issues

**"Failed to connect to MCP server"**
- Ensure MCP server is running on port 3002
- Check `MCP_SERVER_URL` in server/.env

**"Mixtral API calls failing"**
- Verify `MIXTRAL_API_KEY` is valid
- Check you have API credits
- Test connection: `GET /api/questions/test-mixtral`

**"Database connection errors"**
- Run `npx prisma db push` in server directory
- Check `DATABASE_URL` in server/.env

**"Questions falling back to mock data"**
- This is expected when Mixtral is unavailable
- Upload more documents with relevant tags
- Check MCP server logs for errors

### Logs and Debugging

Check service logs:
- Server: `server/logs/`
- MCP Server: `mcp-server/logs/`
- Client: Browser console

Health check endpoints:
- http://localhost:3001/health
- http://localhost:3002/health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Mixtral AI for question generation
- HuggingFace for embedding models
- Chroma for vector database
- React and Node.js communities

---

For more detailed setup instructions, see `.env.template` in the project root.