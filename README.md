# MediBot - Multi-Agent Healthcare Assistant

This is a Mastra-based multi-agent system for healthcare triage, document explanation, and doctor recommendation.

## Prerequisites

1.  **Node.js** (v18+)
2.  **PostgreSQL** (with `pgvector` extension if possible, though this demo uses text search)
3.  **Google Gemini API Key**

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root:
    ```env
    GOOGLE_GENERATIVES_AI_API_KEY=your_key_here
    POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/medibot
    ```

3.  **Database Setup**:
    Ensure your Postgres database is running. Then run the seed script to create the `doctors` table and populate it with mock data.
    ```bash
    npm run seed
    ```

4.  **Run**:
    ```bash
    npm run dev
    ```

## Architecture

-   **Mastra Framework**: Handles agent orchestration.
-   **Agents**:
    -   `Triage Agent`: Junior physician persona for initial diagnosis.
    -   `Doc Explainer`: Simplifies medical reports (PHI aware).
    -   `Doctor Recommender`: Uses tools to query the Postgres database.
-   **Tools**:
    -   `searchDoctors`: Connects to Postgres to find doctors by specialty or condition.
-   **Memory**:
    -   Currently implemented as session-based context passing in the CLI entry point.

## Future Extensions

-   Integrate `@mastra/memory` for persistent long-term storage of patient history.
-   Implement a web interface (Next.js) instead of CLI.
-   Enable `pgvector` for semantic search of doctors based on symptom embeddings.
