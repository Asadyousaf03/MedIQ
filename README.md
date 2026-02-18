# MediBot - Multi-Agent Healthcare Assistant

MediBot is a comprehensive, Mastra-based multi-agent healthcare platform designed to provide empathetic triage, medical document explanation (RAG), and healthcare provider recommendations. It features a modern full-stack architecture with a Node.js/Express backend and a Next.js 16 frontend.

---

## 🏛️ Architecture Overview

The platform is designed with a service-oriented architecture:

-   **Backend ([root](.)):** An Express-based server orchestrating Mastra agents, tool executions, and database interactions.
-   **Frontend ([webapp/](webapp/)):** A React 19/Next.js 16 application with a real-time chat interface and file upload support.
-   **Intelligence Layer (Mastra):**
    -   **Agents**: Specialized "modes" (Cardiology, Mental Health, Pediatrics, etc.) governed by a unified system prompt.
    -   **Memory**: Short-term and working memory (Mastra Memory) for context retention.
    -   **Tools**: Custom tools for searching doctor databases and a RAG-based knowledge search.
-   **Vector Database (PgVector)**: Stores embeddings for the clinical knowledge base (e.g., DSM-5-TR guidelines) and doctor bios.

---

## 🛠️ Prerequisites & Setup

### 1. Requirements
-   **Node.js**: v22.13.0+ (Required by Mastra v1.x)
-   **PostgreSQL**: v14+ with the `pgvector` extension installed.
-   **Google Cloud SDK**: Authenticated locally for Vertex AI access.

### 2. Authentication
MediBot uses **Vertex AI**. You must authenticate your local terminal to access Google Cloud:
```bash
gcloud auth application-default login
```

### 3. Installation
Install dependencies in both the root and webapp folders:
```bash
# Root folder
npm install

# Webapp folder
cd webapp
npm install
cd ..
```

---

## ⚙️ Configuration (.env)

Create a `.env` file in the **root** folder with the following variables:

```env
# Google Vertex AI Configuration
GOOGLE_VERTEX_PROJECT="your-google-project-id"
GOOGLE_VERTEX_LOCATION="us-central1"

# Database Configuration
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
POSTGRES_CONNECTION_STRING=postgresql://postgres:admin@localhost:5432/medibot

# Backend Configuration (Optional)
PORT=3001
```

---

## 📊 Data Preparation

MediBot requires two key data ingestion steps to be fully functional:

### 1. Seed Doctor Database
Populates the system with mock healthcare providers, specialties, and bios for the `searchDoctors` tool.
```bash
npm run seed
```

### 2. Ingest Knowledge Base (RAG)
Analyze and index clinical PDFs (like DSM-5-TR) into the vector store.
1.  Place medical PDFs in `src/lib/knowledge-base/`.
2.  Run the ingestion script:
    ```bash
    npm run ingest-kb
    ```
    *Note: This script uses batching (30 chunks/batch) to stay within Vertex AI's token limits and uses `gemini-embedding-001` (768 dimensions).*

---

## 🚀 Running the Application

You must run both the backend and frontend simultaneously:

**Terminal 1: Backend**
```bash
npm run dev
```

**Terminal 2: Frontend**
```bash
cd webapp
npm run dev
```

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
