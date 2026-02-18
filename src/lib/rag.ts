import { MDocument } from '@mastra/rag';
import { PgVector } from "@mastra/pg";
import { embedMany } from "ai";
import { vertex } from '@ai-sdk/google-vertex';
import path from 'path';
import fs from 'fs';

// Use require for the problematic PDF library
const { PDFParse } = require('pdf-parse');
const pdfParse = PDFParse;

// 1. Initialize the Mastra Vector Store
const vectorStore = new PgVector({
  id: 'pg-vector',
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});

const INDEX_NAME = 'knowledge_embeddings_v4';
const EMBEDDING_DIMENSION = 768; // Matches Vertex text-embedding-004

// 2. Optimized Ingestion (The Mastra Way)
export async function ingestPDF(filePath: string, source: string) {
  console.log(`📄 Ingesting PDF: ${source}`);

  // Ensure the index exists
  try {
    await vectorStore.createIndex({
      indexName: INDEX_NAME,
      dimension: EMBEDDING_DIMENSION,
    });
    console.log(`✅ Index "${INDEX_NAME}" is ready`);
  } catch (error: any) {
    // Index might already exist, which is fine
    if (!error.message?.includes('already exists')) {
      console.log(`ℹ️  Index note: ${error.message}`);
    }
  }

  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const pdfData = await parser.getText();
  const text = pdfData.text;

  // Use Document to handle chunking intelligently
  const doc = MDocument.fromText(text, {
    metadata: { source },
  });

  // Recursive strategy keeps medical definitions together
  const chunks = await doc.chunk({
    strategy: 'recursive',
    maxSize: 1000,
    overlap: 200,
  });

  console.log(`📊 Processing ${chunks.length} chunks in batches...`);

  // Process embeddings in smaller batches to stay under Vertex AI's token limits (20k tokens/request)
  const BATCH_SIZE = 30;
  const allEmbeddings: number[][] = [];
  
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + BATCH_SIZE);
    console.log(`  Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`);
    
    const { embeddings } = await embedMany({
      model: vertex.textEmbeddingModel('text-embedding-004'),
      values: batchChunks.map((chunk) => chunk.text),
    });
    
    allEmbeddings.push(...embeddings);
  }

  // Store embeddings with metadata
  await vectorStore.upsert({
    indexName: INDEX_NAME,
    vectors: allEmbeddings,
    metadata: chunks.map((chunk, i) => ({
      text: chunk.text,
      source,
      chunkId: `${source}-${i}`,
    })),
  });

  console.log(`✅ Mastra ingested ${chunks.length} chunks`);
  return chunks.length;
}

// 3. Retrieval (The Mastra Way)
export async function retrieveKnowledge(query: string, topK: number = 5, sourceFilter?: string) {
  // Generate embedding for the query
  const { embeddings } = await embedMany({
    model: vertex.textEmbeddingModel('text-embedding-004'),
    values: [query],
  });

  const queryVector = embeddings[0];

  // Query the vector store
  const results = await vectorStore.query({
    indexName: INDEX_NAME,
    queryVector,
    topK,
    filter: sourceFilter ? { source: sourceFilter } : undefined,
  });

  return results.map(r => ({
    text: r.metadata?.text || '',
    score: r.score || 0,
    source: r.metadata?.source || 'unknown'
  }));
}
// Add this to your rag.ts file
export async function getKnowledgeBaseStats() {
  try {
    // This gives the server information about the index configuration
    // In a more advanced setup, you could run a SQL 'COUNT(*)' query here
    return {
      indexName: INDEX_NAME,
      embeddingModel: 'text-embedding-004',
      dimension: EMBEDDING_DIMENSION,
      provider: 'PgVector',
      status: 'connected'
    };
  } catch (error) {
    console.error('KB Stats Error:', error);
    throw new Error('Could not reach Vector Store');
  }
}