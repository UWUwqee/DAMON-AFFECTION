import express, { Request, Response } from 'express';
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
  creatorId?: string;
  theme: string;
  recipientName: string;
  senderName: string;
  date: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  pages?: LetterPage[];
  musicEnabled: boolean;
  soundtrackMood?: string;
  envelopeSeal: string;
  createdAt: string;
  viewCount: number;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  status: 'unread' | 'opened' | 'approved' | 'declined';
  recipientResponse?: RecipientResponse;
  hasPassword?: boolean;
  password?: string;
  passwordHint?: string;
}

// In-memory cache for serverless invocation
const letters: Record<string, LetterData> = {
  'love-sweetheart': {
    id: 'love-sweetheart',
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
  }
};

const app = express();
app.use(express.json());

const router = express.Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'vercel' });
});

// Get Letter by ID
router.get('/letters/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const letter = letters[id];
  if (!letter) {
    return res.status(404).json({ error: 'Letter not found' });
  }
  res.json(letter);
});

// Create new Letter
router.post('/letters', (req: Request, res: Response) => {
  const body = req.body;
  const uniqueSuffix = Math.random().toString(36).substring(2, 8);
  const id = body.id || `love-${uniqueSuffix}`;
  const creatorToken = body.creatorToken || `creator-${Math.random().toString(36).substring(2, 10)}`;

  const newLetter: LetterData = {
    id,
    creatorToken,
    creatorId: body.creatorId || undefined,
    theme: body.theme || 'blooming-heart',
    recipientName: body.recipientName?.trim() || 'My Sweetheart',
    senderName: body.senderName?.trim() || 'With all my love',
    date: body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    title: body.title?.trim() || 'A Letter for You',
    content: body.content?.trim() || '',
    imageUrl: body.imageUrl || undefined,
    imageCaption: body.imageCaption || undefined,
    pages: Array.isArray(body.pages) && body.pages.length > 0 ? body.pages : undefined,
    musicEnabled: body.musicEnabled !== false,
    soundtrackMood: body.soundtrackMood,
    envelopeSeal: body.envelopeSeal || 'wax-heart',
    hasPassword: Boolean(body.hasPassword && body.password?.trim()),
    password: body.hasPassword && body.password?.trim() ? body.password.trim() : undefined,
    passwordHint: body.passwordHint?.trim() || undefined,
    createdAt: body.createdAt || new Date().toISOString(),
    viewCount: body.viewCount || 0,
    status: body.status || 'unread'
  };

  letters[id] = newLetter;
  res.status(201).json(newLetter);
});

// Update existing Letter
router.put('/letters/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;
  if (!letters[id]) {
    return res.status(404).json({ error: 'Letter not found' });
  }

  letters[id] = {
    ...letters[id],
    ...body,
    id
  };
  res.json(letters[id]);
});

// Mark Letter as Opened
router.post('/letters/:id/open', (req: Request, res: Response) => {
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

  res.json(letter);
});

// Recipient Responds / Approves Letter
router.post('/letters/:id/respond', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reactionEmoji, message, approved = true } = req.body;
  const letter = letters[id];
  if (!letter) {
    return res.status(404).json({ error: 'Letter not found' });
  }

  letter.status = approved ? 'approved' : 'declined';
  letter.recipientResponse = {
    approved: Boolean(approved),
    reactionEmoji: reactionEmoji || '❤️',
    message: message ? message.trim() : approved
      ? 'I accept with all my heart!'
      : 'I am sorry, but my heart is not ready to accept this letter.',
    respondedAt: new Date().toISOString()
  };

  res.json(letter);
});

// Get Creator's Letters for Dashboard
router.get('/letters/creator/:creatorToken', (req: Request, res: Response) => {
  const { creatorToken } = req.params;
  const creatorLetters = Object.values(letters)
    .filter((l) => l.creatorToken === creatorToken || l.creatorId === creatorToken)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(creatorLetters);
});

// Delete Letter
router.delete('/letters/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (letters[id]) {
    delete letters[id];
  }
  res.json({ success: true });
});

// AI Romantic Spark generator (server-side Gemini API)
router.post('/ai/romantic-spark', async (req: Request, res: Response) => {
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

// Mount router on both '/api' and '/' to guarantee matching on Vercel rewrites
app.use('/api', router);
app.use('/', router);

export default app;
