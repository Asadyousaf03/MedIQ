"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeSearchTool = void 0;
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const rag_1 = require("../../lib/rag");
exports.knowledgeSearchTool = (0, tools_1.createTool)({
    id: "knowledge-search",
    description: `Search the medical knowledge base for relevant information. 
    This includes psychiatric references like DSM-5, medical guidelines, and clinical resources.
    Use this tool when you need authoritative medical information to support your responses.`,
    inputSchema: zod_1.z.object({
        query: zod_1.z.string().describe("The search query to find relevant medical knowledge"),
        topK: zod_1.z.number().optional().default(5).describe("Number of results to return (default: 5)"),
        sourceFilter: zod_1.z.string().optional().describe("Filter by source document name (e.g., 'DSM-5')"),
    }),
    outputSchema: zod_1.z.object({
        results: zod_1.z.array(zod_1.z.object({
            text: zod_1.z.string(),
            source: zod_1.z.string(),
            score: zod_1.z.number(),
        })),
        summary: zod_1.z.string(),
    }),
    execute: async (input) => {
        const { query, topK = 5, sourceFilter } = input;
        try {
            const results = await (0, rag_1.retrieveKnowledge)(query, topK, sourceFilter);
            if (results.length === 0) {
                return {
                    results: [],
                    summary: "No relevant information found in the knowledge base.",
                };
            }
            return {
                results: results.map((r) => ({
                    text: r.text,
                    source: r.source,
                    score: r.score,
                })),
                summary: `Found ${results.length} relevant passages from: ${[...new Set(results.map((r) => r.source))].join(", ")}`,
            };
        }
        catch (error) {
            console.error("Knowledge search error:", error);
            return {
                results: [],
                summary: "Error searching knowledge base.",
            };
        }
    },
});
//# sourceMappingURL=knowledgeSearch.js.map