# MediBot - Unified Healthcare Assistant

## Overview
MediBot is a Mastra-based unified intelligent AI healthcare assistant that seamlessly adapts to patient needs through intelligent mode switching. It handles:
- Healthcare triage (symptom analysis)
- Medical document explanation
- Doctor recommendations
- Mental health support

---

## Architecture

### Single Unified Agent (MediBot)
Instead of multiple agents, MediBot uses a **single intelligent agent** that automatically detects and adapts to patient needs:

- **Triage Mode**: Activated when patient describes symptoms, pain, or illness
- **Document Explanation Mode**: Activated for lab results, medical reports, X-rays
- **Doctor Recommendation Mode**: Activated when patient asks for healthcare providers
- **Mental Health Support Mode**: Activated for anxiety, depression, stress concerns

The agent intelligently switches modes based on the patient's queries through its system prompt.

### Memory System
MediBot implements a comprehensive memory system using `@mastra/memory`:

#### Short-term Memory
- Maintains last 20 messages of conversation context
- Provides immediate conversation continuity

#### Working Memory
- Extracts and maintains patient profile information:
  - Demographics (name, age, location)
  - Medical history (conditions, allergies, medications)
  - Current concerns (symptoms, duration, severity)
  - Preferences (specialty, insurance, communication)
  - Session notes (findings, recommendations, follow-ups)

### Storage
- PostgreSQL-backed storage using `@mastra/pg` (`PostgresStore`)
- Automatically handles memory persistence at the Mastra instance level
- Shared across all agents for consistency

### Tools
- **search-doctors**: Query PostgreSQL database for healthcare providers by specialty or condition
- **knowledge-search**: Access medical knowledge base (DSM-5, clinical guidelines) via RAG

---

## Components

### Backend (Node.js + Express)
- **Unified Agent**: Single `mediBotAgent` handles all interactions
- **Memory**: Agent-level memory configuration with working memory enabled
- **Storage**: Instance-level PostgreSQL storage for persistence
- **File Processing**: Supports PDF, TXT, and image uploads for document analysis
- **RAG**: Vector-based knowledge retrieval using PgVector

### Frontend (Next.js)
- Modern UI built with Tailwind CSS
- Real-time chat interface with file upload support
- Session-based conversation management

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send message to MediBot (with memory via thread/resource) |
| `/chat/upload` | POST | Upload and analyze medical documents |
| `/kb/stats` | GET | Knowledge base statistics |
| `/health` | GET | Health check endpoint |

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file:
```
GOOGLE_GENERATIVES_AI_API_KEY=your_key_here
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/medibot
```

### 3. Database Setup
```bash
npm run seed
```

### 4. Ingest Knowledge Base
```bash
npm run ingest-kb
```

### 5. Run the Application
```bash
npm run dev
```

---

## Recent Changes

### v2.0.0 - Unified Agent Architecture
- **Removed**: CLI Interface (`src/index.ts`)
- **Removed**: Multi-agent architecture (routing agent, separate triage/explainer/recommender agents)
- **Removed**: Old agent files (`triageAgent.ts`, `docExplainerAgent.ts`, `doctorRecommenderAgent.ts`, `routingAgent.ts`)
- **Added**: Single unified `mediBotAgent` with intelligent mode switching
- **Added**: Agent-level memory with working memory for patient profile tracking
- **Added**: Instance-level PostgreSQL storage (`@mastra/pg` with `PostgresStore`)
- **Updated**: Server endpoints for seamless frontend integration with Mastra memory API
- **Added**: Health check endpoint
- **Simplified**: Server code by utilizing Mastra's built-in memory handling

### Key Benefits
1. **Simplified Architecture**: One agent instead of four
2. **Intelligent Context**: Agent maintains patient information across conversations
3. **Seamless Transitions**: No explicit mode selection needed
4. **Persistent Memory**: Conversations and patient data stored in PostgreSQL via Mastra
5. **Better UX**: Natural conversation flow without interruptions
6. **Mastra-Aligned**: Follows Mastra framework patterns and best practices