import "dotenv/config";
import { ingestPDF } from "../src/lib/rag";
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("🚀 Starting Knowledge Base Ingestion...\n");

  try {
    const kbDirectory = path.join(__dirname, '../src/lib/knowledge-base');
    const files = fs.readdirSync(kbDirectory).filter(f => f.endsWith('.pdf'));

    if (files.length === 0) {
      console.log("No PDF files found in src/lib/knowledge-base. Nothing to ingest.");
      return;
    }

    console.log(`📚 Found ${files.length} PDF(s) to ingest...`);

    for (const file of files) {
      const filePath = path.join(kbDirectory, file);
      await ingestPDF(filePath, file);
    }

    console.log("\n✅ Knowledge base ingestion complete!");
    console.log("\n💡 To add more documents:");
    console.log("   1. Place PDF files in: src/lib/knowledge-base/");
    console.log("   2. Run: npm run ingest-kb");
  } catch (error) {
    console.error("❌ Error during knowledge base ingestion:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
