import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

interface RecipientResponse {
  approved: boolean;
  reactionEmoji: string;
  message: string;
  respondedAt: string;
}

interface LetterPage {
  id: string;
  pageNumber: number;
  title?: string;
  content: string;
}

interface LetterData {
  id: string;
  creatorToken: string;
  theme: string;
  recipientName: string;
  senderName: string;
  date: string;
  title: string;
  content: string;
  pages?: LetterPage[];
  musicEnabled: boolean;
  soundtrackMood?: string;
  envelopeSeal: string;
  createdAt: string;
  viewCount: number;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  status: 'unread' | 'opened' | 'approved';
  recipientResponse?: RecipientResponse;
  hasPassword?: boolean;
  password?: string;
  passwordHint?: string;
}

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'letters.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache backed by file
let letters: Record<string, LetterData> = {};

const loadLetters = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      letters = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load letters from disk:', err);
    letters = {};
  }
};

const saveLetters = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(letters, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save letters to disk:', err);
  }
};

loadLetters();

// Seed initial sample letter if empty so preview always has something rich
if (Object.keys(letters).length === 0) {
  const sampleId = 'love-sweetheart';
  letters[sampleId] = {
    id: sampleId,
    creatorToken: 'sample-creator-token',
    theme: 'blooming-heart',
    recipientName: 'My Beloved',
    senderName: 'Yours Forever',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    title: 'Every Beat Belongs To You',
    content: 'From the moment our eyes first met, the world became softer, warmer, and endlessly full of wonder. You are my home, my calm, and my favorite reason to smile. I built this affectionate space just to remind you how deeply and truly you are loved.',
    musicEnabled: true,
    envelopeSeal: 'wax-heart',
    createdAt: new Date().toISOString(),
    viewCount: 1,
    status: 'opened',
    recipientResponse: {
      approved: true,
      reactionEmoji: '💖',
      message: 'You made me cry happy tears! I love you so much.',
      respondedAt: new Date(Date.now() - 3600000).toISOString()
    }
  };
  saveLetters();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get Letter by ID
  app.get('/api/letters/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const letter = letters[id];
    if (!letter) {
      return res.status(404).json({ error: 'Letter not found' });
    }
    res.json(letter);
  });

  // Create new Letter
  app.post('/api/letters', (req: Request, res: Response) => {
    const body = req.body;
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const id = body.id || `love-${uniqueSuffix}`;
    const creatorToken = body.creatorToken || `creator-${Math.random().toString(36).substring(2, 10)}`;

    const newLetter: LetterData = {
      id,
      creatorToken,
      theme: body.theme || 'blooming-heart',
      recipientName: body.recipientName?.trim() || 'My Sweetheart',
      senderName: body.senderName?.trim() || 'With all my love',
      date: body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      title: body.title?.trim() || 'A Letter for You',
      content: body.content?.trim() || '',
      pages: Array.isArray(body.pages) && body.pages.length > 0 ? body.pages : undefined,
      musicEnabled: body.musicEnabled !== false,
      soundtrackMood: body.soundtrackMood,
      envelopeSeal: body.envelopeSeal || 'wax-heart',
      hasPassword: Boolean(body.hasPassword && body.password?.trim()),
      password: body.hasPassword && body.password?.trim() ? body.password.trim() : undefined,
      passwordHint: body.passwordHint?.trim() || undefined,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      status: 'unread'
    };

    letters[id] = newLetter;
    saveLetters();

    res.status(201).json(newLetter);
  });

  // Mark Letter as Opened (view count and status)
  app.post('/api/letters/:id/open', (req: Request, res: Response) => {
    const { id } = req.params;
    const letter = letters[id];
    if (!letter) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    letter.viewCount = (letter.viewCount || 0) + 1;
    const now = new Date().toISOString();
    if (!letter.firstOpenedAt) {
      letter.firstOpenedAt = now;
    }
    letter.lastOpenedAt = now;

    if (letter.status === 'unread') {
      letter.status = 'opened';
    }

    saveLetters();
    res.json(letter);
  });

  // Recipient Responds / Approves Letter
  app.post('/api/letters/:id/respond', (req: Request, res: Response) => {
    const { id } = req.params;
    const { reactionEmoji, message } = req.body;
    const letter = letters[id];
    if (!letter) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    letter.status = 'approved';
    letter.recipientResponse = {
      approved: true,
      reactionEmoji: reactionEmoji || '❤️',
      message: message ? message.trim() : 'I accept with all my heart!',
      respondedAt: new Date().toISOString()
    };

    saveLetters();
    res.json(letter);
  });

  // Get Creator's Letters for Dashboard
  app.get('/api/letters/creator/:creatorToken', (req: Request, res: Response) => {
    const { creatorToken } = req.params;
    const creatorLetters = Object.values(letters)
      .filter((l) => l.creatorToken === creatorToken)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(creatorLetters);
  });

  // Delete Letter
  app.delete('/api/letters/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (letters[id]) {
      delete letters[id];
      saveLetters();
    }
    res.json({ success: true });
  });

  // AI Romantic Spark generator (server-side Gemini API)
  app.post('/api/ai/romantic-spark', async (req: Request, res: Response) => {
    try {
      const { mood, prompt, recipientName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          text: `In your gentle embrace, I find the rhythm of my soul. Every moment with you is a silent prayer answered.`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are a deeply poetic, romantic, and emotional love letter writer for Damon's Affection. Write a tender, genuine, heartfelt paragraph of love (3 to 5 sentences) without cheesy clichés. Make it feel authentic, intimate, and deeply touching.`;

      const userPrompt = `Write a romantic love note for ${recipientName || 'my love'}. Mood: ${mood || 'romantic'}. Detail or memory to weave in: ${prompt || 'how much they mean to me and how our love grows every day'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.85
        }
      });

      const text = response.text || '';
      res.json({ text });
    } catch (err) {
      console.error('Gemini romantic-spark error:', err);
      res.status(200).json({
        text: `You have brought a warmth into my life that nothing else could ever replace. With every breath, I love you more.`
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Damon’s Affection server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
