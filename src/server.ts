import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { mastra } from './mastra';
import { Agent } from '@mastra/core/agent';
import { getKnowledgeBaseStats } from './lib/rag';

// Use dynamic import for pdf-parse
const pdfParse = require('pdf-parse');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, TXT, PNG, JPG, JPEG'));
    }
  }
});

// Get the unified MediBot agent
const getMediBotAgent = () => mastra.getAgent('mediBotAgent') as Agent<any, any>;

// Chat endpoint with memory integration
app.post('/chat', async (req: any, res: any) => {
    const { message, sessionId, resourceId } = req.body;

    if (!message || !sessionId) {
        return res.status(400).json({ error: 'message and sessionId are required' });
    }

    const agent = getMediBotAgent();

    if (!agent) {
        return res.status(500).json({ error: 'MediBot agent not available' });
    }

    try {
        // Use memory with thread and resource for conversation continuity
        const response = await agent.generate(message, {
            memory: {
                thread: sessionId,
                resource: resourceId || sessionId, // Fall back to sessionId if no resourceId
            },
        });

        const responseText = response?.text || "I'm having trouble processing your request right now.";

        res.json({ 
            response: responseText,
            threadId: sessionId,
        });
    } catch (error) {
        console.error(`Error processing request:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// File upload endpoint for lab reports and documents
app.post('/chat/upload', upload.single('file'), async (req: any, res: any) => {
    const { sessionId, message, resourceId } = req.body;
    const file = req.file;

    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        let extractedText = '';
        const ext = path.extname(file.originalname).toLowerCase();

        // Extract text from the file
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(file.path);
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        } else if (ext === '.txt') {
            extractedText = fs.readFileSync(file.path, 'utf-8');
        } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            // For images, we'll describe it and let the agent know
            extractedText = `[Image uploaded: ${file.originalname}. This appears to be a medical image/scan that requires visual analysis.]`;
        }

        // Create context with file content
        const userMessage = message 
            ? `${message}\n\nUploaded document (${file.originalname}):\n${extractedText.slice(0, 5000)}` 
            : `Please analyze this uploaded document (${file.originalname}):\n${extractedText.slice(0, 5000)}`;

        // Use the unified MediBot agent with memory
        const agent = getMediBotAgent();

        if (!agent) {
            return res.status(500).json({ error: 'MediBot agent not available' });
        }

        // Generate response with memory context
        const response = await agent.generate(userMessage, {
            memory: {
                thread: sessionId,
                resource: resourceId || sessionId,
            },
        });
        
        const responseText = response?.text || "I'm having trouble analyzing this document.";

        // Clean up uploaded file after processing
        fs.unlinkSync(file.path);

        res.json({ 
            response: responseText,
            threadId: sessionId,
            fileProcessed: {
                name: file.originalname,
                type: ext,
                textLength: extractedText.length
            }
        });
    } catch (error) {
        console.error('Error processing file upload:', error);
        // Clean up file on error
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        res.status(500).json({ error: 'Error processing uploaded file' });
    }
});

// Knowledge base stats endpoint
app.get('/kb/stats', async (req: any, res: any) => {
    try {
        const stats = await getKnowledgeBaseStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting KB stats:', error);
        res.status(500).json({ error: 'Error retrieving knowledge base statistics' });
    }
});

// Health check endpoint
app.get('/health', (req: any, res: any) => {
    res.json({ 
        status: 'healthy',
        service: 'MediBot',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
    });
});

app.listen(port, () => {
    console.log(`🏥 MediBot Healthcare Assistant server listening on port ${port}`);
    console.log(`   - Chat endpoint: POST /chat`);
    console.log(`   - File upload: POST /chat/upload`);
    console.log(`   - Health check: GET /health`);
});
