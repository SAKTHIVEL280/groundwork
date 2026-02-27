// ============================================
// Groundwork - AI Client (Groq)
// ============================================
// Handles communication with the Groq API.
// Users bring their own API key.
// ============================================

import type { AIConfig, AIMessage, AIResponse } from '@groundwork/types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export class GroqAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public rateLimited: boolean = false,
  ) {
    super(message);
    this.name = 'GroqAPIError';
  }
}

/**
 * Validate a Groq API key by making a lightweight request.
 * Returns true if valid, throws GroqAPIError if not.
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      }),
    });

    if (response.status === 401) {
      throw new GroqAPIError('Invalid API key. Please check your Groq API key.', 401);
    }

    if (response.status === 429) {
      // Rate limited but key is valid
      return true;
    }

    if (!response.ok) {
      throw new GroqAPIError(
        `API error: ${response.statusText}`,
        response.status,
      );
    }

    return true;
  } catch (error) {
    if (error instanceof GroqAPIError) throw error;
    throw new GroqAPIError('Failed to connect to Groq API. Check your internet connection.', 0);
  }
}

/**
 * Send a chat completion request to the Groq API.
 */
export async function chat(
  messages: AIMessage[],
  config: AIConfig,
): Promise<AIResponse> {
  if (!config.enabled) {
    return { content: '', error: 'AI is disabled. Enable it in settings.' };
  }

  if (!config.apiKey) {
    return { content: '', error: 'No API key provided. Add your Groq API key in settings.' };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || DEFAULT_MODEL,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (response.status === 401) {
      return {
        content: '',
        error: 'Invalid API key. Please check your Groq API key in settings.',
      };
    }

    if (response.status === 429) {
      return {
        content: '',
        error: 'Rate limit reached. Please wait a moment and try again.',
        rateLimited: true,
      };
    }

    if (!response.ok) {
      return {
        content: '',
        error: `API error (${response.status}): ${response.statusText}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    return { content };
  } catch (error) {
    return {
      content: '',
      error: 'Failed to connect to Groq API. Check your internet connection.',
    };
  }
}

/**
 * Pre-built prompts for Groundwork's AI features.
 */
export const AI_PROMPTS = {
  refineIdea: (idea: string): AIMessage[] => [
    {
      role: 'system',
      content:
        'You are a product strategist helping a developer refine their project idea. Ask clarifying questions to help them define the problem, target users, and scope. Be concise and actionable.',
    },
    {
      role: 'user',
      content: `Help me refine this project idea:\n\n${idea}`,
    },
  ],

  suggestStack: (projectDescription: string, features: string[]): AIMessage[] => [
    {
      role: 'system',
      content:
        'You are a senior software architect. Suggest a practical tech stack for the described project. Prefer battle-tested, well-documented technologies. Format as a clear list with brief reasoning.',
    },
    {
      role: 'user',
      content: `Suggest a tech stack for:\n\n${projectDescription}\n\nKey features: ${features.join(', ')}`,
    },
  ],

  generateDataModel: (features: string[]): AIMessage[] => [
    {
      role: 'system',
      content:
        'You are a database architect. Generate a data model with entities, fields (name, type, required), and relationships based on the described features. Format clearly.',
    },
    {
      role: 'user',
      content: `Generate a data model for an app with these features:\n\n${features.map((f) => `- ${f}`).join('\n')}`,
    },
  ],

  breakIntoMilestones: (features: string[]): AIMessage[] => [
    {
      role: 'system',
      content:
        'You are a project manager. Break the given features into 3-5 milestones, each with specific tasks. Milestone 1 should be a deployable MVP. Be realistic about effort.',
    },
    {
      role: 'user',
      content: `Break these features into milestones:\n\n${features.map((f) => `- ${f}`).join('\n')}`,
    },
  ],
};
