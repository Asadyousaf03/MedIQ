# MediBot - Comprehensive Project Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Architecture](#core-architecture)
3. [Key Technologies & Concepts](#key-technologies--concepts)
4. [AI/ML Concepts](#aiml-concepts)
5. [Database & Storage Concepts](#database--storage-concepts)
6. [Backend Architecture Patterns](#backend-architecture-patterns)
7. [Learning Path](#learning-path)

---

## Project Overview

MediBot is a **Multi-Agent Healthcare Assistant** that uses AI to help users with:
- **Medical Triage**: Initial diagnosis and symptom assessment
- **Document Explanation**: Simplifying complex medical reports
- **Doctor Recommendations**: Finding appropriate specialists
- **Knowledge-Based Question Answering**: Answering medical questions using a knowledge base (e.g., DSM-5)

### Problem It Solves
1. **Healthcare Accessibility**: Provides 24/7 preliminary medical guidance
2. **Medical Literacy**: Translates complex medical jargon into plain language
3. **Doctor Discovery**: Helps patients find appropriate specialists
4. **Evidence-Based Information**: Uses authoritative medical sources (DSM-5, medical literature)

---

## Core Architecture

### 1. Multi-Agent System (MAS)

**Concept**: Instead of one AI doing everything, multiple specialized AI agents work together, each expert in their domain.

#### Agents in MediBot:

**Routing Agent** (`routingAgent.ts`)
- **Role**: Traffic controller
- **Function**: Analyzes user intent and routes to appropriate specialist agent
- **Analogy**: Hospital receptionist directing patients to correct department
- **Key Concept**: Intent Classification

**Triage Agent** (`triageAgent.ts`)
- **Role**: Junior physician
- **Function**: Performs initial medical assessment
- **Output**: Preliminary diagnosis, urgency level, recommended actions
- **Key Concept**: Structured Medical Reasoning

**Document Explainer Agent** (`docExplainerAgent.ts`)
- **Role**: Medical translator
- **Function**: Simplifies lab results, X-rays, psychiatric evaluations
- **Special Feature**: Uses knowledge base (DSM-5) for psychiatric terms
- **Key Concept**: Context-Aware Translation with RAG

**Doctor Recommender Agent** (`doctorRecommenderAgent.ts`)
- **Role**: Specialist finder
- **Function**: Searches database for appropriate doctors
- **Uses**: Database search tools
- **Key Concept**: Tool-Augmented LLM

### 2. Retrieval-Augmented Generation (RAG)

**What is RAG?**
RAG enhances AI responses by retrieving relevant information from a knowledge base before generating answers.

**Traditional LLM**: Limited to training data (knowledge cutoff)
```
User Question → LLM → Answer (may be outdated/hallucinated)
```

**RAG-Enhanced LLM**: Retrieves current, specific information
```
User Question → Retrieve Relevant Docs → LLM + Context → Accurate Answer
```

#### RAG Pipeline in MediBot (`rag.ts`):

**1. Document Ingestion**
```typescript
PDF Document (DSM-5) 
  → Text Extraction (pdf-parse)
  → Chunking (1000 chars, 200 overlap)
  → Embedding Generation (Google text-embedding-004)
  → Vector Storage (PostgreSQL with pgvector)
```

**2. Query Process**
```typescript
User Question
  → Convert to Embedding
  → Similarity Search in Vector DB
  → Retrieve Top 5 Relevant Chunks
  → Pass to LLM as Context
  → Generate Answer
```

**Key Concepts to Learn:**
- **Embeddings**: Converting text to numerical vectors
- **Semantic Search**: Finding similar content based on meaning, not keywords
- **Vector Databases**: Specialized databases for similarity search
- **Chunking Strategies**: Breaking documents into optimal sizes

### 3. Tool-Using Agents

**Concept**: LLMs can call external functions/APIs to access real-time data or perform actions.

#### Tools in MediBot:

**Knowledge Search Tool** (`knowledgeSearch.ts`)
- Searches the medical knowledge base (DSM-5)
- Used by Document Explainer Agent
- Returns: Relevant passages with sources

**Doctor Search Tool** (`doctorSearch.ts`)
- Queries PostgreSQL database
- Filters by specialty, location, availability
- Returns: List of matching doctors

**How It Works:**
```typescript
User: "Find me a cardiologist in New York"
  ↓
Agent decides to use doctorSearchTool
  ↓
Tool executes SQL query
  ↓
Returns results to Agent
  ↓
Agent formats results into natural response
```

---

## Key Technologies & Concepts

### 1. Mastra Framework

**What is Mastra?**
An open-source framework for building AI agents and workflows.

**Core Components:**

**Agents**
- Autonomous AI entities with specific roles
- Have their own instructions, tools, and models
- Can collaborate with other agents

**Tools**
- Functions agents can call
- Schema-validated (using Zod)
- Can be databases, APIs, calculations, etc.

**Memory** (Future Enhancement)
- Stores conversation history
- Maintains context across sessions
- Enables personalized responses

**Workflows**
- Orchestrates multi-step processes
- Manages agent handoffs
- Handles error recovery

### 2. Large Language Models (LLMs)

**What are LLMs?**
AI models trained on vast text data to understand and generate human-like text.

**Model Used: Google Gemini 2.5 Flash**
- Fast, efficient model
- Good balance of speed and capability
- Cost-effective for production

**Key Concepts:**

**Prompting**
- Engineering instructions to guide AI behavior
- System prompts: Define agent personality/role
- User prompts: Actual user questions

**Context Window**
- Amount of text the model can process at once
- Gemini Flash: ~1M tokens (roughly 750,000 words)

**Temperature**
- Controls randomness (0 = deterministic, 1 = creative)
- Medical use case: Lower temperature for accuracy

**Tokens**
- Units of text (roughly ¾ of a word)
- Used for billing and context limits

### 3. TypeScript & Node.js

**Why TypeScript?**
- Type safety prevents bugs
- Better IDE support (autocomplete, error checking)
- Self-documenting code

**Key TypeScript Concepts in Project:**

**Interfaces & Types**
```typescript
interface Tool {
  id: string;
  description: string;
  inputSchema: ZodSchema;
  execute: (input: any) => Promise<any>;
}
```

**Async/Await**
```typescript
// Modern way to handle asynchronous operations
const result = await agent.generate({ prompt: "..." });
```

**Generics**
```typescript
// Reusable type-safe functions
function createTool<T>(schema: ZodSchema<T>) { ... }
```

### 4. PostgreSQL & pgvector

**PostgreSQL**
- Open-source relational database
- ACID compliant (reliable transactions)
- Extensible with plugins

**pgvector Extension**
- Adds vector similarity search to PostgreSQL
- Stores embeddings as vector columns
- Supports cosine similarity, L2 distance

**Vector Operations:**
```sql
-- Find similar vectors
SELECT * FROM knowledge_embeddings
ORDER BY embedding <=> query_vector
LIMIT 5;
```

**Key Concepts:**
- **Indexing**: HNSW or IVFFlat for fast similarity search
- **Distance Metrics**: Cosine similarity, Euclidean distance
- **Dimensionality**: 768 dimensions for Google embeddings

---

## AI/ML Concepts

### 1. Embeddings

**What are Embeddings?**
Numerical representations of text that capture semantic meaning.

**Example:**
```
"heart attack" → [0.23, -0.15, 0.87, ..., 0.42] (768 numbers)
"cardiac arrest" → [0.21, -0.14, 0.89, ..., 0.45] (similar vector!)
"pizza" → [-0.82, 0.53, -0.12, ..., -0.31] (very different vector)
```

**Why Useful?**
- Computers can compare meanings mathematically
- Enables semantic search (meaning-based, not keyword-based)
- Foundation for RAG systems

**Model Used:** Google `text-embedding-004`
- Output: 768-dimensional vectors
- Optimized for semantic similarity
- Batch processing: Max 100 texts per request

### 2. Similarity Search

**Concept**: Finding items "close" in vector space.

**Distance Metrics:**

**Cosine Similarity**
- Measures angle between vectors
- Range: -1 (opposite) to 1 (identical)
- Best for text embeddings

**Euclidean Distance (L2)**
- Straight-line distance
- Affected by magnitude

**Dot Product**
- Combines similarity and magnitude
- Fast to compute

### 3. Chunking Strategies

**Why Chunk?**
- LLMs have context limits
- Smaller chunks = more precise retrieval
- Larger chunks = more context

**Recursive Chunking** (used in MediBot)
```typescript
{
  strategy: 'recursive',
  maxSize: 1000,      // Characters per chunk
  overlap: 200,        // Overlap between chunks
}
```

**Benefits:**
- Preserves related information together
- Overlap ensures context isn't lost at boundaries
- Adaptive to document structure

### 4. Prompt Engineering

**System Prompt Example (Triage Agent):**
```typescript
instructions: `
  You are Dr. Emily Chen, a compassionate junior physician.
  
  GUIDELINES:
  1. Gather symptoms comprehensively
  2. Assess urgency (1-5 scale)
  3. Provide preliminary diagnosis
  4. Never replace real medical care
`
```

**Key Techniques:**
- **Role Assignment**: "You are a..."
- **Constraints**: "Never...", "Always..."
- **Examples**: Few-shot learning
- **Formatting**: "Output as JSON/bullets"

---

## Database & Storage Concepts

### 1. Relational Database Design

**Doctors Table Schema:**
```sql
CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  specialty VARCHAR(255),
  location VARCHAR(255),
  available BOOLEAN,
  contact VARCHAR(255)
);
```

**Key Concepts:**
- **Primary Key**: Unique identifier
- **Indexing**: Speeds up searches
- **Normalization**: Organizing data efficiently

### 2. Vector Store Design

**Knowledge Embeddings Table:**
```sql
CREATE TABLE knowledge_embeddings (
  id SERIAL PRIMARY KEY,
  text TEXT,
  embedding VECTOR(768),
  metadata JSONB,
  source VARCHAR(255)
);

CREATE INDEX ON knowledge_embeddings 
USING hnsw (embedding vector_cosine_ops);
```

**HNSW Index:**
- Hierarchical Navigable Small World
- Fast approximate nearest neighbor search
- Trade-off: Speed vs. accuracy

### 3. Connection Pooling

**Concept**: Reusing database connections instead of creating new ones.

**Benefits:**
- Faster queries (no connection overhead)
- Limited resource usage
- Better scalability

```typescript
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  max: 20, // Maximum connections
});
```

---

## Backend Architecture Patterns

### 1. MVC-Style Organization

```
src/
├── mastra/           # AI Layer (Controllers + Logic)
│   ├── agents/       # AI Agents
│   ├── tools/        # Agent Tools
│   └── index.ts      # Mastra Instance
├── lib/              # Data Layer (Models)
│   ├── db.ts         # Database
│   └── rag.ts        # Vector Store
├── server.ts         # API Layer (Routes)
└── index.ts          # Entry Point
```

### 2. Tool Pattern

**Schema Definition** (Zod):
```typescript
inputSchema: z.object({
  specialty: z.string(),
  location: z.string().optional(),
})
```

**Execution Logic**:
```typescript
execute: async (input) => {
  const results = await pool.query(sql, [input.specialty]);
  return results.rows;
}
```

**Benefits:**
- Type-safe inputs/outputs
- Validated automatically
- Self-documenting

### 3. Error Handling

**Try-Catch Patterns:**
```typescript
try {
  await vectorStore.createIndex(...);
} catch (error) {
  if (!error.message?.includes('already exists')) {
    console.error(error);
  }
}
```

**Graceful Degradation:**
- Continue operation if non-critical error
- Provide fallback responses
- Log errors for debugging

---

## Learning Path

### Phase 1: Foundations (2-3 weeks)

**JavaScript/TypeScript Fundamentals**
- Async/await and Promises
- Arrow functions and destructuring
- Modules (import/export)
- Type annotations and interfaces

**Resources:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [JavaScript.info](https://javascript.info/)

**Node.js Basics**
- npm package management
- Environment variables (.env)
- File system operations
- HTTP servers with Express

**Resources:**
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Phase 2: Database & SQL (1-2 weeks)

**PostgreSQL**
- CRUD operations (Create, Read, Update, Delete)
- JOINs and relationships
- Indexes and query optimization
- Transactions

**SQL Practice:**
```sql
-- Practice queries
SELECT * FROM doctors WHERE specialty = 'Cardiology';
SELECT COUNT(*) FROM doctors GROUP BY specialty;
```

**Resources:**
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQL Zoo](https://sqlzoo.net/)

### Phase 3: AI/ML Concepts (2-3 weeks)

**LLM Fundamentals**
- How transformers work (high-level)
- Tokens and tokenization
- Context windows
- Fine-tuning vs. prompting

**Embeddings & Vector Search**
- Word2Vec, GloVe (historical context)
- Modern embedding models
- Similarity metrics
- Vector databases

**RAG Architecture**
- Document processing
- Chunking strategies
- Retrieval methods
- Evaluation metrics

**Resources:**
- [Andrej Karpathy's YouTube](https://www.youtube.com/c/AndrejKarpathy)
- [Fast.ai Course](https://www.fast.ai/)
- [Pinecone Learning Center](https://www.pinecone.io/learn/)

### Phase 4: Mastra Framework (1 week)

**Official Documentation**
- [Mastra Docs](https://mastra.ai/docs)
- Agent creation
- Tool development
- Workflow orchestration

**Practice Projects:**
1. Simple Q&A agent
2. Agent with database tool
3. Multi-agent conversation

### Phase 5: Advanced Concepts (Ongoing)

**Prompt Engineering**
- Zero-shot vs. few-shot
- Chain of thought
- ReAct pattern (Reasoning + Acting)

**Agent Design Patterns**
- Reflection agents
- Planning agents
- Multi-agent collaboration

**Production Considerations**
- Rate limiting
- Caching strategies
- Monitoring and logging
- Cost optimization

**Resources:**
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [LangChain Documentation](https://python.langchain.com/) (concepts apply to Mastra)

---

## Key Concepts Explained in Depth

### Multi-Agent Orchestration

**Why Multiple Agents?**

**Modularity**
- Each agent has clear responsibility
- Easier to debug and improve
- Can swap out individual agents

**Specialization**
- Agents can use different models
- Specialized prompts for specific tasks
- Better performance per task

**Scalability**
- Agents can run in parallel
- Distribute load across services
- Independent scaling

**Communication Flow:**
```
User Input
  ↓
Routing Agent (analyzes intent)
  ↓
Selects Specialist Agent
  ↓
Specialist may use Tools
  ↓
Returns Response
```

### RAG Deep Dive

**Document Processing Pipeline:**

**1. Extraction**
```typescript
const pdfData = await parser.getText();
// Extracts: "Major Depressive Disorder (MDD) is characterized by..."
```

**2. Chunking**
```typescript
// Break into overlapping chunks
Chunk 1: "Major Depressive Disorder (MDD) is characterized by..."
Chunk 2: "...characterized by persistent sadness and loss of interest..."
```

**3. Embedding**
```typescript
// Convert to vectors
Chunk 1 → [0.23, -0.15, 0.87, ..., 0.42]
Chunk 2 → [0.21, -0.14, 0.89, ..., 0.45]
```

**4. Storage**
```sql
INSERT INTO knowledge_embeddings 
(text, embedding, source) VALUES 
('Major Depressive Disorder...', '[0.23, -0.15, ...]', 'DSM-5');
```

**Query Process:**

**1. User Question**
```
"What are the symptoms of depression?"
```

**2. Query Embedding**
```typescript
queryVector = [0.22, -0.14, 0.88, ..., 0.43]
```

**3. Similarity Search**
```sql
SELECT text, (embedding <=> query_vector) as distance
FROM knowledge_embeddings
ORDER BY distance
LIMIT 5;
```

**4. Context Assembly**
```typescript
context = relevantChunks.map(c => c.text).join('\n\n');
```

**5. LLM Generation**
```typescript
prompt = `Context: ${context}\n\nQuestion: ${question}`;
response = await llm.generate(prompt);
```

### Tool-Using Agents Explained

**Function Calling Process:**

**1. Agent Receives Request**
```
User: "Find cardiologists in New York"
```

**2. Agent Decides to Use Tool**
```typescript
// LLM internally decides: "I should use doctorSearchTool"
{
  tool: "doctorSearchTool",
  parameters: {
    specialty: "Cardiology",
    location: "New York"
  }
}
```

**3. Tool Execution**
```typescript
const results = await searchDoctors({
  specialty: "Cardiology",
  location: "New York"
});
// Returns: [{name: "Dr. Smith", ...}, ...]
```

**4. Agent Formats Response**
```typescript
// LLM generates natural language response
"I found 3 cardiologists in New York:
1. Dr. Smith at NYC Heart Center
2. Dr. Jones at Manhattan Cardiology
..."
```

---

## Best Practices Demonstrated

### 1. Environment Configuration
```env
# Separate secrets from code
GOOGLE_GENERATIVE_AI_API_KEY=...
POSTGRES_CONNECTION_STRING=...
```

### 2. Error Handling
```typescript
// Always handle errors gracefully
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  return fallbackResponse();
}
```

### 3. Type Safety
```typescript
// Use TypeScript to catch errors early
interface DoctorSearchInput {
  specialty: string;
  location?: string;
}
```

### 4. Modular Code
```typescript
// Separate concerns
import { searchDoctors } from './tools/doctorSearch';
import { triageAgent } from './agents/triageAgent';
```

### 5. Documentation
```typescript
/**
 * Searches for doctors in the database
 * @param specialty - Medical specialty to search for
 * @param location - Optional location filter
 * @returns Array of matching doctors
 */
```

---

## Next Steps & Enhancements

### Short Term
1. **Web Interface**: Build Next.js frontend
2. **User Authentication**: Secure patient data
3. **Session Memory**: Remember conversation context

### Medium Term
1. **Medical Image Analysis**: Process X-rays, MRIs
2. **Appointment Booking**: Integrate with calendar
3. **Medication Tracking**: Track prescriptions

### Long Term
1. **Clinical Decision Support**: Advanced diagnostic aids
2. **Research Integration**: Pull latest medical studies
3. **Multi-lingual Support**: Serve global users

---

## Debugging Tips

### Common Issues

**1. Database Connection Errors**
```typescript
// Check connection string format
postgresql://user:password@host:port/database
```

**2. Embedding Batch Size**
```typescript
// Google API limit: 100 per batch
const BATCH_SIZE = 100;
```

**3. API Rate Limits**
```typescript
// Add delays between requests
await new Promise(resolve => setTimeout(resolve, 1000));
```

**4. Type Errors**
```typescript
// Always type async function returns
async function myFunc(): Promise<string> { ... }
```

---

## Conclusion

MediBot demonstrates modern AI application development:
- **Multi-agent architecture** for complex workflows
- **RAG** for knowledge-grounded responses
- **Tool-using agents** for real-world integrations
- **Production-ready patterns** for scalability

By understanding these concepts, you can build sophisticated AI applications that go beyond simple chatbots to create real value.

### Key Takeaways

1. **LLMs are powerful but need grounding** → RAG provides facts
2. **Specialization is better than generalization** → Multi-agent approach
3. **Type safety prevents bugs** → TypeScript is your friend
4. **Tools extend AI capabilities** → Database access, APIs, calculations
5. **Good architecture scales** → Modular, documented, testable code

Happy learning! 🚀
