import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { retrieveKnowledge } from "../../lib/rag";

export const knowledgeSearchTool = createTool({
  id: "knowledge-search",
  description: `Search the medical knowledge base for relevant information. 
    This includes psychiatric references like DSM-5, medical guidelines, and clinical resources.
    Use this tool when you need authoritative medical information to support your responses.`,
  inputSchema: z.object({
    query: z.string().describe("The search query to find relevant medical knowledge"),
    topK: z.number().optional().default(5).describe("Number of results to return (default: 5)"),
    sourceFilter: z.string().optional().describe("Filter by source document name (e.g., 'DSM-5')"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        text: z.string(),
        source: z.string(),
        score: z.number(),
      })
    ),
    summary: z.string(),
  }),
  execute: async (input) => {
    const { query, topK = 5, sourceFilter } = input;

    try {
      const results = await retrieveKnowledge(query, topK, sourceFilter);

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
    } catch (error) {
      console.error("Knowledge search error:", error);
      return {
        results: [],
        summary: "Error searching knowledge base.",
      };
    }
  },
});
