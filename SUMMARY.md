# MediBot - Multi-Agent Healthcare Assistant

## Overview
MediBot is a Mastra-based multi-agent system designed for:
- Healthcare triage
- Document explanation
- Doctor recommendation

---

## Key Components

### 1. Backend (Node.js + Express)
- **Agents**:
  - `Triage Agent`: Simulates a junior physician for initial diagnosis.
  - `Doc Explainer Agent`: Simplifies medical reports.
  - `Doctor Recommender Agent`: Queries a PostgreSQL database for doctor recommendations.
- **Tools**:
  - `searchDoctors`: Connects to PostgreSQL to find doctors by specialty or condition.
- **Database**:
  - PostgreSQL is used, with mock data seeded into a `doctors` table.
- **File Uploads**:
  - Supports uploading files (PDF, TXT, images) for processing.
- **Scripts**:
  - `seed.ts`: Seeds the database with mock data.
  - `ingestKnowledgeBase.ts`: Processes and ingests knowledge base data.

### 2. Frontend (Next.js)
- A web application for interacting with MediBot.
- Uses **Tailwind CSS** for styling.
- Provides a user interface for healthcare triage, document explanation, and doctor search.

### 3. CLI Interface
- A simple command-line interface for interacting with the agents.
- Allows users to select modes (e.g., triage, document explanation, doctor search) and interact with agents.

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file with:
```
GOOGLE_GENERATIVES_AI_API_KEY=your_key_here
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/medibot
```

### 3. Database Setup
- Ensure PostgreSQL is running.
- Seed the database:
```bash
npm run seed
```

### 4. Run the Application
- Start the development server:
```bash
npm run dev
```

---

## Future Enhancements
- Integrate `@mastra/memory` for persistent long-term storage of patient history.

---

## To-Do

### Backend
- Ensure the database schema is finalized and optimized.
- Test and refine the agents' logic.
- Add error handling for file uploads and agent interactions.

### Frontend
- Build and refine the user interface for all agent functionalities.
- Ensure seamless integration with the backend.

### General
- Add unit and integration tests.
- Document the API endpoints and agent workflows.
- Deploy the application (e.g., using Vercel for the frontend and a cloud provider for the backend).