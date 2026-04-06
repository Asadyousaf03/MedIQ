"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const rag_1 = require("../src/lib/rag");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function main() {
    console.log("🚀 Starting Knowledge Base Ingestion...\n");
    try {
        const kbDirectory = path_1.default.join(__dirname, '../src/lib/knowledge-base');
        const files = fs_1.default.readdirSync(kbDirectory).filter(f => f.endsWith('.pdf'));
        if (files.length === 0) {
            console.log("No PDF files found in src/lib/knowledge-base. Nothing to ingest.");
            return;
        }
        console.log(`📚 Found ${files.length} PDF(s) to ingest...`);
        for (const file of files) {
            const filePath = path_1.default.join(kbDirectory, file);
            await (0, rag_1.ingestPDF)(filePath, file);
        }
        console.log("\n✅ Knowledge base ingestion complete!");
        console.log("\n💡 To add more documents:");
        console.log("   1. Place PDF files in: src/lib/knowledge-base/");
        console.log("   2. Run: npm run ingest-kb");
    }
    catch (error) {
        console.error("❌ Error during knowledge base ingestion:", error);
        process.exit(1);
    }
    process.exit(0);
}
main();
//# sourceMappingURL=ingestKnowledgeBase.js.map