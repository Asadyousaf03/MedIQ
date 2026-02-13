# MediBot Knowledge Base

This directory contains PDF documents that will be ingested into the RAG (Retrieval-Augmented Generation) system for MediBot.

## Adding Documents

1. **Place PDF files here**
   - Drop your PDF files (like `DSM-5-TR.pdf`) directly into this folder

2. **Run the ingestion script**
   ```bash
   npm run ingest-kb
   ```

3. **Documents will be:**
   - Parsed and extracted
   - Chunked into smaller passages (~1000 chars each)
   - Embedded using Google's text-embedding-004 model
   - Stored in PostgreSQL with pgvector for semantic search

## Recommended Documents

### For Psychiatry Support:
- **DSM-5-TR.pdf** - Diagnostic and Statistical Manual of Mental Disorders
  - Place the PDF here as: `DSM-5-TR.pdf` or `DSM-5.pdf`

### For General Medicine:
- Medical guidelines PDFs
- Clinical reference documents
- Drug interaction references

## How RAG Works

1. **Ingestion Phase** (one-time):
   - PDFs are parsed to extract text
   - Text is split into overlapping chunks
   - Each chunk is converted to a vector embedding
   - Vectors are stored in PostgreSQL with pgvector

2. **Query Phase** (runtime):
   - User asks a question
   - Question is converted to a vector embedding
   - Similar chunks are found via cosine similarity
   - Relevant context is passed to the AI agent
   - Agent generates an informed response

## Database Table

The system creates a `knowledge_embeddings` table:

```sql
CREATE TABLE knowledge_embeddings (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL,          -- filename
    chunk_text TEXT NOT NULL,      -- the actual text
    embedding vector(768),         -- 768-dim vector
    metadata JSONB DEFAULT '{}',   -- extra info
    created_at TIMESTAMP
);
```

## Checking Knowledge Base Status

```bash
# Via API endpoint
curl http://localhost:3001/kb/stats
```

## Notes

- Large PDFs may take several minutes to ingest (embedding generation is rate-limited)
- The system uses ~1000 character chunks with 200 character overlap
- Embeddings are generated using Google's text-embedding-004 model
- Make sure your `.env` has a valid `GOOGLE_GENERATIVE_AI_API_KEY`
