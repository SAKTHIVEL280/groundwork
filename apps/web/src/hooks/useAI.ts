// ============================================
// Groundwork - AI Assist Hook
// ============================================
// Provides AI generation functionality to section components.
// Uses the Groq API key from user preferences.
// ============================================

import { useState, useCallback } from 'react';
import { chat, AI_PROMPTS } from '@groundwork/logic';
import type { AIMessage } from '@groundwork/types';
import { useAppStore } from '../store';

export function useAI() {
  const preferences = useAppStore((s) => s.preferences);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAvailable = preferences.aiEnabled && !!preferences.groqApiKey;

  const generate = useCallback(
    async (messages: AIMessage[]): Promise<string | null> => {
      if (!isAvailable) {
        setError('AI is not enabled. Add your Groq API key in Settings.');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await chat(messages, {
          apiKey: preferences.groqApiKey!,
          model: 'llama-3.3-70b-versatile',
          enabled: true,
        });

        setLoading(false);

        if (result.error) {
          setError(result.error);
          return null;
        }

        return result.content;
      } catch (e) {
        setLoading(false);
        setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
        return null;
      }
    },
    [isAvailable, preferences.groqApiKey],
  );

  const suggestFeatures = useCallback(
    async (projectDescription: string) => {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content:
            'You are a product strategist. Suggest 5-8 features for the described project. Return ONLY a JSON array of objects with "name" and "description" fields. No markdown, no explanation — just the JSON array.',
        },
        {
          role: 'user',
          content: `Suggest features for: ${projectDescription}`,
        },
      ];
      return generate(messages);
    },
    [generate],
  );

  const suggestPersonas = useCallback(
    async (projectDescription: string) => {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content:
            'You are a UX researcher. Suggest 2-4 user personas for the described project. Return ONLY a JSON array of objects with "name", "role", "painPoints" (array of strings), and "goals" (array of strings). No markdown, no explanation — just the JSON array.',
        },
        {
          role: 'user',
          content: `Suggest user personas for: ${projectDescription}`,
        },
      ];
      return generate(messages);
    },
    [generate],
  );

  const suggestStack = useCallback(
    async (projectDescription: string, features: string[]) => {
      return generate(AI_PROMPTS.suggestStack(projectDescription, features));
    },
    [generate],
  );

  const suggestDataModel = useCallback(
    async (features: string[]) => {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content:
            'You are a database architect. Generate entities with fields for the described features. Return ONLY a JSON array of objects with "name" (string), "fields" (array of {"name": string, "type": string, "required": boolean}), and "relationships" (array of {"targetEntity": string, "type": "one-to-one"|"one-to-many"|"many-to-many"}). No markdown — just the JSON array.',
        },
        {
          role: 'user',
          content: `Generate a data model for these features:\n${features.map((f) => `- ${f}`).join('\n')}`,
        },
      ];
      return generate(messages);
    },
    [generate],
  );

  const suggestMilestones = useCallback(
    async (features: string[]) => {
      return generate(AI_PROMPTS.breakIntoMilestones(features));
    },
    [generate],
  );

  const freeformAsk = useCallback(
    async (prompt: string, systemContext: string) => {
      const messages: AIMessage[] = [
        { role: 'system', content: systemContext },
        { role: 'user', content: prompt },
      ];
      return generate(messages);
    },
    [generate],
  );

  return {
    isAvailable,
    loading,
    error,
    generate,
    suggestFeatures,
    suggestPersonas,
    suggestStack,
    suggestDataModel,
    suggestMilestones,
    freeformAsk,
    clearError: () => setError(null),
  };
}
