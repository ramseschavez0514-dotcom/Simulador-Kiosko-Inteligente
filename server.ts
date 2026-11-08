import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { UNIFIED_SYSTEM_PROMPT_TEXT } from './src/data/unifiedSystemPrompt.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    kiosk_system: 'RET-FIG-001',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Endpoint del Clúster de Agentes IA Unificado (Paso 10)
app.post('/api/cluster/inspect', async (req, res) => {
  const { kioskId, options, payload } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Si no hay API key configurada, retornar 204 para que el frontend use el motor determinista
    return res.status(204).end();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Usamos gemini-3.8-flash según especificación de skills
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Evalúa la siguiente solicitud de devolución en el kiosco ${kioskId}:\n` +
                JSON.stringify(payload, null, 2)
            }
          ]
        }
      ],
      config: {
        systemInstruction: UNIFIED_SYSTEM_PROMPT_TEXT,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const textOutput = response.text || '';
    const parsedJson = JSON.parse(textOutput);

    return res.json({
      execution_mode: 'gemini_live',
      model_used: 'gemini-3.8-flash',
      kiosk_id: kioskId || 'KIOSK-04',
      timestamp: new Date().toISOString(),
      ...parsedJson
    });
  } catch (error: any) {
    console.warn('[Gemini Cluster Error, falling back to deterministic simulation]:', error?.message);
    return res.status(204).end();
  }
});

// Vite Middleware integration for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kiosk Multi-Agent Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
