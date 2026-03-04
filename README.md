# MediBot - Intelligent Healthcare Assistant

MediBot is a comprehensive AI-powered healthcare platform that provides intelligent medical triage, document explanation, and doctor recommendations. It intelligently adapts to patient needs through a unified AI agent with memory management, retrieval-augmented generation (RAG), and professional healthcare provider search capabilities.

**Status**: Active Development | **Version**: 1.0.0

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Current Scope](#-current-scope)
- [Technical Implementation](#-technical-implementation)
- [Architecture](#-architecture)
- [Setup & Installation](#-setup--installation)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Future Enhancements](#-future-enhancements)
- [Learning Resources](#-learning-resources)

---

## 📌 Project Overview

### What is MediBot?

MediBot is an AI-powered healthcare assistant that bridges the gap between patients and medical care through intelligent conversation. It acts as a preliminary medical guidance tool that:

- **Provides Medical Triage**: Analyzes symptoms through conversational assessments
- **Explains Complex Medical Documents**: Translates medical reports into understandable language using AI
- **Recommends Healthcare Providers**: Searches and suggests appropriate doctors based on patient needs
- **Maintains Patient Context**: Remembers patient information across conversations for continuity

### Who Should Use MediBot?

- **Patients**: Seeking preliminary medical guidance and symptom assessment
- **Healthcare Systems**: Integrating AI-powered triage into existing workflows
- **Researchers**: Studying multi-agent systems and RAG implementations in healthcare

### Key Problem It Solves

1. **Healthcare Accessibility**: Provides 24/7 preliminary guidance without human intervention
2. **Medical Literacy**: Simplifies medical jargon into patient-friendly language
3. **Provider Discovery**: Helps patients find relevant specialists efficiently
4. **Evidence-Based Responses**: Uses authoritative medical sources (DSM-5, clinical guidelines) to ensure accuracy

---

## ✅ Current Scope

### Implemented Features

#### 1. **Unified AI Agent with Mode Switching**
- Single intelligent agent (`mediBotAgent`) that automatically detects patient intent
- **Triage Mode**: Analyzes symptoms and provides preliminary assessments
- **Document Explanation Mode**: Parses and explains medical reports
- **Doctor Recommendation Mode**: Searches provider database
- **Mental Health Support Mode**: Provides appropriate responses for psychological concerns

#### 2. **Memory Management System**
- **Short-term Memory**: Maintains last 20 messages for conversation continuity
- **Working Memory**: Extracts and stores patient profile data:
  - Demographics (age, location)
  - Medical history (conditions, allergies, medications)
  - Current symptoms and concerns
  - Session recommendations and follow-ups

#### 3. **Retrieval-Augmented Generation (RAG)**
- Indexes medical knowledge bases (DSM-5-TR, clinical guidelines) into PostgreSQL vectors
- Semantic search to retrieve relevant medical information
- Context-aware responses using retrieved documents
- Batched embedding generation for efficient processing

#### 4. **Doctor Search Engine**
- Searchable database of healthcare providers
- Filter by specialty and medical conditions
- Provider bio and contact information retrieval
- PostgreSQL-backed storage with vector embeddings

#### 5. **File Upload & Document Analysis**
- Supports PDF, TXT, PNG, JPG file uploads
- Automatic text extraction from documents
- AI-powered explanation of uploaded medical documents
- Up to 10MB file size support

#### 6. **Full-Stack Architecture**
- **Backend**: Express.js with Mastra framework
- **Frontend**: Next.js 16 with modern React (v19)
- **Database**: PostgreSQL with PgVector extension
- **AI Model**: Google Vertex AI (Gemini)

### Supported File Types
- `.pdf` - Medical documents and reports
- `.txt` - Text-based medical records
- `.png`, `.jpg`, `.jpeg` - Medical images and test results

---

## 🔧 Technical Implementation

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI/LLM** | Google Vertex AI (Gemini) | Core language model for understanding and generation |
| **Agent Framework** | Mastra v1.1.0 | Multi-agent orchestration and tool management |
| **Memory** | Mastra Memory + PostgreSQL | Conversation and patient context persistence |
| **Search/RAG** | PgVector + Semantic Search | Medical knowledge retrieval |
| **Backend** | Node.js + Express.js | REST API and request handling |
| **Frontend** | Next.js 16 + React 19 | User interface and real-time chat |
| **Database** | PostgreSQL v14+ | Data persistence and vector storage |
| **File Handling** | Multer + pdf-parse | File upload and text extraction |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│              Chat Interface + File Upload UI                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────────┐
│                   Express.js Backend                         │
├──────────────────────────────────────────────────────────────┤
│  /chat         - Message processing                          │
│  /chat/upload  - Document analysis                           │
│  /kb/stats     - Knowledge base statistics                   │
│  /health       - System health check                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────────┐ ┌──▼──────────┐ ┌─▼──────────────┐
│  MediBot Agent │ │  Memory     │ │  Tools         │
│  (Unified AI)  │ │  System     │ │  - searchDocs  │
│                │ │  (Mastra)   │ │  - knowledgeQ  │
└────────────────┘ └─────────────┘ └────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────────────┐  ┌──────────▼──────────┐
│  PostgreSQL Database │  │  Vertex AI (Gemini) │
│  - Doctors           │  │  - Language Model   │
│  - Vector Embeddings │  │  - Text Embedding   │
│  - Memory Storage    │  │  - Image Analysis   │
└──────────────────────┘  └─────────────────────┘
```

### Key Components

#### MediBot Agent (`src/mastra/agents/mediBotAgent.ts`)
- Single unified agent with intelligent mode switching
- Memory configuration for context retention
- System prompt guiding appropriate healthcare guidance boundaries
- Integrated with `searchDoctors` and `knowledgeSearch` tools

#### Knowledge Search Tool (`src/mastra/tools/knowledgeSearch.ts`)
- Queries PostgreSQL vector database for relevant medical information
- Uses semantic similarity to find related documents
- Supports multi-source knowledge retrieval

#### Doctor Search Tool (`src/mastra/tools/doctorSearch.ts`)
- Queries healthcare provider database
- Filters by specialty and condition
- Returns provider details and contact information

#### RAG Pipeline (`src/lib/rag.ts`)
```
PDF Input → PDF Parse → Text Chunking (1000 chars, 200 overlap) 
  → Embedding Generation (Google) → Vector Storage (pgvector)
```

#### Memory System (`src/mastra/agents/mediBotAgent.ts`)
- **Storage Backend**: PostgreSQL via `@mastra/pg`
- **Retention**: Last 20 messages + working memory
- **Extraction**: Auto-extracts patient demographics, medical history, and session notes

---

## 🏗️ Architecture

### Directory Structure

```
MediBot/
├── src/
│   ├── server.ts              # Express app & API endpoints
│   ├── mastra/
│   │   ├── index.ts           # Mastra instance initialization
│   │   ├── agents/
│   │   │   └── mediBotAgent.ts    # Unified healthcare agent
│   │   └── tools/
│   │       ├── doctorSearch.ts    # Provider search tool
│   │       └── knowledgeSearch.ts # RAG knowledge tool
│   ├── lib/
│   │   ├── db.ts              # Database operations
│   │   ├── rag.ts             # RAG pipeline & embedding logic
│   │   └── knowledge-base/    # Medical PDFs storage
│   └── uploads/               # User-uploaded documents
├── webapp/                    # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Main chat interface
│   │   │   ├── layout.tsx     # App layout
│   │   │   └── globals.css    # Global styles
│   │   └── components/
│   │       ├── Chat.tsx       # Chat logic
│   │       ├── ChatInterface.tsx
│   │       └── ChatNew.tsx
│   └── public/                # Static assets
├── scripts/
│   ├── seed.ts                # Populate doctor database
│   └── ingestKnowledgeBase.ts # Ingest medical PDFs
├── package.json               # Root dependencies
└── tsconfig.json
```

---

## 🛠️ Setup & Installation

### Prerequisites

- **Node.js**: v22.13.0 or higher
- **PostgreSQL**: v14+ with pgvector extension
- **Google Cloud SDK**: For Vertex AI access
- **Git**: For version control

### Step 1: Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd webapp
npm install
cd ..
```

### Step 2: Google Cloud Authentication

Authenticate your terminal for Vertex AI access:

```bash
gcloud auth application-default login
```

### Step 3: Environment Configuration

Create `.env` in the root directory:

```env
# Google Vertex AI
GOOGLE_VERTEX_PROJECT="your-google-project-id"
GOOGLE_VERTEX_LOCATION="us-central1"

# PostgreSQL Database
POSTGRES_CONNECTION_STRING=postgresql://postgres:password@localhost:5432/medibot

# Server (Optional)
PORT=3001
```

### Step 4: Initialize Database

```bash
# Seed doctor database
npm run seed

# Ingest knowledge base (place PDFs in src/lib/knowledge-base/ first)
npm run ingest-kb
```

---

## 🚀 Running the Application

### Start Backend & Frontend

**Terminal 1 - Backend:**
```bash
npm run dev
```
Backend runs on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd webapp
npm run dev
```
Frontend runs on `http://localhost:3000`

### Available Commands

```bash
npm run build      # Compile TypeScript
npm run start      # Run compiled backend
npm run dev        # Development mode with hot reload
npm run seed       # Populate doctor database
npm run ingest-kb  # Process and index medical PDFs
```

---

## 📡 API Endpoints

### Core Chat Endpoints

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/chat` | POST | Send message to MediBot | `{ message: string, threadId?: string }` |
| `/chat/upload` | POST | Upload and analyze medical document | Form-Data: `file` (PDF/TXT/Image) |
| `/kb/stats` | GET | Knowledge base statistics | - |
| `/health` | GET | System health check | - |

### Request Examples

**Chat Message:**
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "I have a headache and fever" }'
```

**Upload Document:**
```bash
curl -X POST http://localhost:3001/chat/upload \
  -F "file=@medical_report.pdf"
```

---

## 🚀 Future Enhancements

### Phase 1: Enhanced Patient Support (3-6 months)
- [ ] **Multi-language Support**: Spanish, Mandarin, Hindi translations
- [ ] **Audio Input/Output**: Voice-to-text and text-to-speech for accessibility
- [ ] **Patient Portal**: User profiles, appointment scheduling, medical history tracking
- [ ] **Medication Interaction Checker**: Warn about drug interactions
- [ ] **Appointment Integration**: Direct scheduling with recommended doctors

### Phase 2: Advanced AI & Intelligence (6-9 months)
- [ ] **Improved Triage Accuracy**: Train specialized triage models
- [ ] **Context-Aware Recommendations**: ML-based doctor matching algorithm
- [ ] **Multi-image Analysis**: Support for X-rays, CT scans, ultrasounds
- [ ] **Clinical Decision Support**: Evidence-based treatment recommendations
- [ ] **Risk Assessment**: Identify high-risk conditions requiring immediate care

### Phase 3: Enterprise Features (9-12 months)
- [ ] **HIPAA Compliance**: Secure patient data handling
- [ ] **EHR Integration**: Connect with existing electronic health records
- [ ] **Analytics Dashboard**: Provider insights and patient outcomes tracking
- [ ] **Insurance Integration**: Coverage and claim processing
- [ ] **Multi-provider Tenancy**: Support multiple healthcare organizations
- [ ] **Audit Logging**: Complete conversation and action history

### Phase 4: Specialized Agents (12+ months)
- [ ] **Dermatology Agent**: Skin condition analysis and visual assessment
- [ ] **Cardiology Agent**: Heart condition specialization
- [ ] **Pediatric Agent**: Age-appropriate guidance for children
- [ ] **Mental Health Agent**: Advanced mental health assessment and resources
- [ ] **Nutrition Agent**: Dietary recommendations and meal planning
- [ ] **Fitness Agent**: Exercise recommendations based on conditions

### Phase 5: Security & Compliance (Ongoing)
- [ ] **End-to-End Encryption**: Secure message transmission
- [ ] **2FA Authentication**: Enhanced user security
- [ ] **Data Anonymization**: GDPR and privacy compliance
- [ ] **Penetration Testing**: Security audits
- [ ] **Backup & Disaster Recovery**: Data protection strategy

### Phase 6: Performance & Scalability
- [ ] **Caching Layer**: Redis for frequently accessed queries
- [ ] **Load Balancing**: Distribute traffic across multiple instances
- [ ] **Database Optimization**: Query optimization and indexing
- [ ] **Real-time Streaming**: WebSocket support for live updates
- [ ] **CDN Integration**: Faster asset delivery globally

### Phase 7: Integration & Ecosystem
- [ ] **Mobile App**: iOS and Android native apps
- [ ] **API Marketplace**: Third-party integrations
- [ ] **Chatbot Analytics**: Conversation metrics and insights
- [ ] **Webhook Support**: Event-driven integrations
- [ ] **Open API**: Public API for developers

### Quick Wins (Can Start Immediately)
1. Add conversation export (PDF/JSON)
2. Implement session history UI
3. Add symptom severity slider
4. Create provider rating system
5. Add follow-up appointment reminders
6. Implement dark mode
7. Add feedback collection mechanism

---

## 📚 Learning Resources

### Key Concepts

**Retrieval-Augmented Generation (RAG)**
- Combines vector search with language models
- Ensures responses grounded in actual medical data
- Reduces AI hallucinations

**Multi-Agent Systems**
- Multiple specialized AI agents working together
- Each agent has specific responsibilities
- Coordinated through a central system

**Vector Embeddings**
- Convert text to numerical representations
- Enable semantic (meaning-based) search
- More powerful than keyword matching

**Memory Management**
- Short-term: Recent conversation context
- Working memory: Extracted facts and patient profile
- Enables context-aware responses over time

### Documentation Files

- **[ABOUT.md](ABOUT.md)**: Deep dive into architecture and AI/ML concepts
- **[SUMMARY.md](SUMMARY.md)**: Quick reference of current implementation
- **[src/lib/knowledge-base/README.md](src/lib/knowledge-base/README.md)**: Knowledge base setup guide

---

## 📞 Support & Contributing

For issues, questions, or feature requests:
1. Check existing documentation in ABOUT.md and SUMMARY.md
2. Review API endpoint documentation above
3. Check environment configuration

---

## 📄 License

ISC License - See package.json for details

---

**Last Updated**: March 2026 | **Status**: Active Development

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧠 Core Features & Specialized Modes

MediBot automatically adapts its behavior based on user input:

-   **🩺 Cardiology Mode**: Detects heart-related symptoms and prioritizes emergency red flags (crushing pain, radiating pain).
-   **🧠 Mental Health Mode**: Provides empathetic support using DSM-5-TR guidelines for anxiety, depression, and stress.
-   **👶 Pediatrics Mode**: Adjusts guidance (fever, CPR, choking) based on the child's age.
-   **📄 Document Analysis**: Upload PDFs (lab reports, prescriptions) for instant simplification and context.
-   **👨‍⚕️ Specialist Search**: Recommends real-world specialists based on symptoms or location.

---

## ⚠️ Potential Issues & Solutions

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **`candidates: undefined`** | Vertex AI Safety Filters | The agent's `safetySettings` are configured to prevent blocking of sensitive medical guidance (False Positives). |
| **`Index dimension error`** | Postgres `ivfflat` limit | We use `knowledge_embeddings_v4` with a 768-dimension model to stay under the 2000-dim limit. |
| **`Token count exceeded`** | Large PDF batch size | `ingestPDF` in [src/lib/rag.ts](src/lib/rag.ts) is limited to 30 chunks per batch to respect the 20k token limit. |
| **`Module not found: pdf-parse`** | Import inconsistency | Use `const { PDFParse } = require('pdf-parse');` to avoid CommonJS/ESM conflicts. |

---

## 🇵🇰 Safety & Localization (Pakistan-Specific)

-   Includes emergency numbers for **Rescue 1122**, **Edhi 115**, and **Chippa 1021**.
-   Directs users to major hospitals (e.g., Aga Khan Research, Indus Hospital) via mock data.
-   **Disclaimer**: MediBot is an educational guidance tool and not a replacement for professional diagnosis or emergency services.
