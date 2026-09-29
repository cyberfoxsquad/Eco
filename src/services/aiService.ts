import { WasteScanResult } from '../types';
import {
  executeGeminiClassification,
  executeGeminiChat,
  resolveFallbackClassification,
  resolveChatFallback,
} from '../lib/geminiClassifierCore';

export interface ClassifyWasteParams {
  imageBase64?: string;
  hint?: string;
}

export interface ChatMessageParams {
  message: string;
  history?: Array<{ role: string; content?: string; text?: string }>;
  model?: string;
  role?: string;
}

/**
 * Classify a waste item through the backend API (/api/classify-waste),
 * with resilient automatic fallback for localhost, Vercel serverless,
 * static deployments, and client-side Gemini fallback.
 */
export async function classifyWasteItem(
  params: ClassifyWasteParams
): Promise<{ result: WasteScanResult; modelUsed?: string; source?: string }> {
  try {
    const res = await fetch('/api/classify-waste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: params.imageBase64,
        sampleLabel: params.hint,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        return {
          result: data.result,
          modelUsed: data.modelUsed,
          source: data.source || 'api-serverless',
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/classify-waste not available, switching to client fallback:', err);
  }

  // Client-side fallback if backend API is not reachable (e.g. static host or missing server)
  const clientApiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) ||
    '';

  if (clientApiKey) {
    try {
      const clientRes = await executeGeminiClassification({
        apiKey: clientApiKey,
        imageBase64: params.imageBase64,
        sampleLabel: params.hint,
      });
      return clientRes;
    } catch (clientErr) {
      console.warn('Client-side Gemini classification error:', clientErr);
    }
  }

  // Guaranteed deterministic municipal knowledge engine response
  const fallbackResult = resolveFallbackClassification(params.hint);
  return {
    result: fallbackResult,
    modelUsed: 'offline-knowledge-engine',
    source: 'knowledge-engine',
  };
}

/**
 * Send a chat message to the EcoBot AI Assistant through the backend API (/api/chat),
 * with resilient automatic fallback for localhost, Vercel serverless,
 * static deployments, and client-side Gemini fallback.
 */
export async function sendChatMessage(params: ChatMessageParams): Promise<{
  reply: string;
  suggestedPrompts?: string[];
  scanResult?: WasteScanResult | null;
  modelUsed?: string;
  roleUsed?: string;
  source?: string;
}> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        history: params.history || [],
        model: params.model,
        role: params.role,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return {
          reply: data.reply,
          suggestedPrompts: data.suggestedPrompts,
          scanResult: data.scanResult,
          modelUsed: data.modelUsed,
          roleUsed: data.roleUsed,
          source: data.source || 'api-serverless',
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/chat not available, switching to client fallback:', err);
  }

  // Client-side fallback if backend API is not reachable
  const clientApiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) ||
    '';

  if (clientApiKey) {
    try {
      const clientRes = await executeGeminiChat({
        apiKey: clientApiKey,
        message: params.message,
        history: params.history,
        model: params.model,
        role: params.role,
      });
      return clientRes;
    } catch (clientErr) {
      console.warn('Client-side Gemini chat error:', clientErr);
    }
  }

  // Guaranteed deterministic municipal knowledge engine response
  const fallbackChat = resolveChatFallback(params.message, false);
  return {
    ...fallbackChat,
    modelUsed: params.model || 'gemini-2.5-flash',
    roleUsed: params.role || 'civic_waste_expert',
    source: 'knowledge-engine',
  };
}
