import { executeGeminiChat } from '../src/lib/geminiClassifierCore';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      message = '',
      history = [],
      model = 'gemini-2.5-flash',
      role = 'civic_waste_expert',
      customSystemInstruction,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

    const response = await executeGeminiChat({
      apiKey,
      message,
      history,
      model,
      role,
      customSystemInstruction,
    });

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('Error in Vercel /api/chat:', err);
    const fallbackResponse = await executeGeminiChat({
      apiKey: '',
      message: req.body?.message || '',
    });
    return res.status(200).json(fallbackResponse);
  }
}
