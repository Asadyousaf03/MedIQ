# MediBot - Multi-Agent Healthcare Assistant

This is a Mastra-based multi-agent system for healthcare triage, document explanation, and doctor recommendation. It features a full-stack architecture with an Express-based backend and a Next.js frontend.

## Prerequisites

1.  **Node.js** (v18+)
2.  **PostgreSQL** (v14+ recommended)
    -   You should have a running Postgres instance.
    -   The `pgvector` extension is used if available (refer to `scripts/seed.ts`).
3.  **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

## Setup & Installation

### 1. Install Dependencies

You need to install dependencies for both the root (backend) and the webapp (frontend).

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd webapp
npm install
cd ..
```

### 2. Environment Variables

Create a `.env` file in the **root** directory (at the same level as `package.json`):

```env
# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Database
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
POSTGRES_CONNECTION_STRING=postgresql://postgres:password@localhost:5432/medibot

# Optional
PORT=3001
```

### 3. Database & Knowledge Base Setup

Ensure your Postgres database (e.g., `medibot`) is created before running these.

```bash
# 1. Create tables and seed mock doctor data
npm run seed

# 2. Ingest clinical knowledge base (requires PDFs in src/lib/knowledge-base/)
npm run ingest-kb
```

## Running the Application

You need to run both the backend and frontend servers simultaneously.

### Start Backend (Port 3001)
From the root directory:
```bash
npm run dev
```

### Start Frontend (Port 3000)
From the `webapp` directory:
```bash
cd webapp
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

-   **Backend**: Node.js/Express, Mastra Framework, PostgreSQL.
-   **Frontend**: Next.js 16, Tailwind CSS.
-   **AI Agents**:
    -   `Triage Agent`: Patient symptom analysis.
    -   `Doc Explainer`: Medical document simplification.
    -   `Doctor Recommender`: Queries Postgres for specialists.

## Potential Issues & Troubleshooting

-   **Database Connection**: Ensure `POSTGRES_CONNECTION_STRING` is correct. If using Docker, use `localhost` or the container name.
-   **`pgvector` Extension**: The `seed` script attempts to create the `vector` extension. This requires the user to have `pgvector` installed on their Postgres server. If it fails, you may need to install it manually.
-   **Missing API Key**: The application will fail to generate responses without a valid `GOOGLE_GENERATIVE_AI_API_KEY`.
-   **Port Conflicts**: By default, the backend uses `3001` and the frontend uses `3000`. Ensure these ports are available.
-   **Knowledge Base Ingestion**: If `npm run ingest-kb` reports 0 files, make sure you have placed medical PDF documents in `src/lib/knowledge-base/`.
-   **File Uploads**: The server is configured for a 10MB limit. Uploading larger files will result in a payload error.
-   **OS Compatibility**: On Windows, ensure you are using a terminal like PowerShell or Git Bash for the setup commands.
-   **Node Modules**: If you see "Module not found" errors, ensure you ran `npm install` in **both** the root and the `webapp` folder.
