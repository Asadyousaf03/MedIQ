"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mastra_1 = require("./mastra");
const rag_1 = require("./lib/rag");
const pdfParse = require('pdf-parse');
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const uploadsDir = path_1.default.join(__dirname, '..', 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.txt', '.png', '.jpg', '.jpeg'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Allowed: PDF, TXT, PNG, JPG, JPEG'));
        }
    }
});
const getMediBotAgent = () => mastra_1.mastra.getAgent('mediBotAgent');
app.post('/chat', async (req, res) => {
    const { message, sessionId, resourceId } = req.body;
    if (!message || !sessionId) {
        return res.status(400).json({ error: 'message and sessionId are required' });
    }
    const agent = getMediBotAgent();
    if (!agent) {
        return res.status(500).json({ error: 'MediBot agent not available' });
    }
    try {
        const response = await agent.generate(message, {
            memory: {
                thread: sessionId,
                resource: resourceId || sessionId,
            },
        });
        const responseText = (response === null || response === void 0 ? void 0 : response.text) || "I'm having trouble processing your request right now.";
        res.json({
            response: responseText,
            threadId: sessionId,
        });
    }
    catch (error) {
        console.error(`Error processing request:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/chat/upload', upload.single('file'), async (req, res) => {
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
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (ext === '.pdf') {
            const dataBuffer = fs_1.default.readFileSync(file.path);
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        }
        else if (ext === '.txt') {
            extractedText = fs_1.default.readFileSync(file.path, 'utf-8');
        }
        else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            extractedText = `[Image uploaded: ${file.originalname}. This appears to be a medical image/scan that requires visual analysis.]`;
        }
        const userMessage = message
            ? `${message}\n\nUploaded document (${file.originalname}):\n${extractedText.slice(0, 5000)}`
            : `Please analyze this uploaded document (${file.originalname}):\n${extractedText.slice(0, 5000)}`;
        const agent = getMediBotAgent();
        if (!agent) {
            return res.status(500).json({ error: 'MediBot agent not available' });
        }
        const response = await agent.generate(userMessage, {
            memory: {
                thread: sessionId,
                resource: resourceId || sessionId,
            },
        });
        const responseText = (response === null || response === void 0 ? void 0 : response.text) || "I'm having trouble analyzing this document.";
        fs_1.default.unlinkSync(file.path);
        res.json({
            response: responseText,
            threadId: sessionId,
            fileProcessed: {
                name: file.originalname,
                type: ext,
                textLength: extractedText.length
            }
        });
    }
    catch (error) {
        console.error('Error processing file upload:', error);
        if (file && fs_1.default.existsSync(file.path)) {
            fs_1.default.unlinkSync(file.path);
        }
        res.status(500).json({ error: 'Error processing uploaded file' });
    }
});
app.get('/kb/stats', async (req, res) => {
    try {
        const stats = await (0, rag_1.getKnowledgeBaseStats)();
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting KB stats:', error);
        res.status(500).json({ error: 'Error retrieving knowledge base statistics' });
    }
});
app.get('/health', (req, res) => {
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
//# sourceMappingURL=server.js.map