"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestPDF = ingestPDF;
exports.retrieveKnowledge = retrieveKnowledge;
exports.getKnowledgeBaseStats = getKnowledgeBaseStats;
const rag_1 = require("@mastra/rag");
const pg_1 = require("@mastra/pg");
const ai_1 = require("ai");
const google_vertex_1 = require("@ai-sdk/google-vertex");
const fs_1 = __importDefault(require("fs"));
const { PDFParse } = require('pdf-parse');
const pdfParse = PDFParse;
const vectorStore = new pg_1.PgVector({
    id: 'pg-vector',
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
});
const INDEX_NAME = 'knowledge_embeddings_v4';
const EMBEDDING_DIMENSION = 768;
async function ingestPDF(filePath, source) {
    var _a;
    console.log(`📄 Ingesting PDF: ${source}`);
    try {
        await vectorStore.createIndex({
            indexName: INDEX_NAME,
            dimension: EMBEDDING_DIMENSION,
        });
        console.log(`✅ Index "${INDEX_NAME}" is ready`);
    }
    catch (error) {
        if (!((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('already exists'))) {
            console.log(`ℹ️  Index note: ${error.message}`);
        }
    }
    const dataBuffer = fs_1.default.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const pdfData = await parser.getText();
    const text = pdfData.text;
    const doc = rag_1.MDocument.fromText(text, {
        metadata: { source },
    });
    const chunks = await doc.chunk({
        strategy: 'recursive',
        maxSize: 1000,
        overlap: 200,
    });
    console.log(`📊 Processing ${chunks.length} chunks in batches...`);
    const BATCH_SIZE = 30;
    const allEmbeddings = [];
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + BATCH_SIZE);
        console.log(`  Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`);
        const { embeddings } = await (0, ai_1.embedMany)({
            model: google_vertex_1.vertex.textEmbeddingModel('text-embedding-004'),
            values: batchChunks.map((chunk) => chunk.text),
        });
        allEmbeddings.push(...embeddings);
    }
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
async function retrieveKnowledge(query, topK = 5, sourceFilter) {
    const { embeddings } = await (0, ai_1.embedMany)({
        model: google_vertex_1.vertex.textEmbeddingModel('text-embedding-004'),
        values: [query],
    });
    const queryVector = embeddings[0];
    const results = await vectorStore.query({
        indexName: INDEX_NAME,
        queryVector,
        topK,
        filter: sourceFilter ? { source: sourceFilter } : undefined,
    });
    return results.map(r => {
        var _a, _b;
        return ({
            text: ((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.text) || '',
            score: r.score || 0,
            source: ((_b = r.metadata) === null || _b === void 0 ? void 0 : _b.source) || 'unknown'
        });
    });
}
async function getKnowledgeBaseStats() {
    try {
        return {
            indexName: INDEX_NAME,
            embeddingModel: 'text-embedding-004',
            dimension: EMBEDDING_DIMENSION,
            provider: 'PgVector',
            status: 'connected'
        };
    }
    catch (error) {
        console.error('KB Stats Error:', error);
        throw new Error('Could not reach Vector Store');
    }
}
//# sourceMappingURL=rag.js.map