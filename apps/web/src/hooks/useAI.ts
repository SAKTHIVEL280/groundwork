// ============================================
// Groundwork - AI Assist Hook
// ============================================
// Provides AI generation functionality to section components.
// Uses the Groq API key from user preferences.
// ============================================

import { useState, useCallback } from 'react';
import { chat, AI_PROMPTS, DEFAULT_MODEL } from '@groundwork/logic';
import type { AIMessage } from '@groundwork/types';
import { useAppStore } from '../store';

export function useAI() {
  const aiEnabled = useAppStore((s) => s.preferences.aiEnabled);
  const groqApiKey = useAppStore((s) => s.preferences.groqApiKey);
  const aiModel = useAppStore((s) => s.preferences.aiModel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAvailable = aiEnabled && !!groqApiKey;

  const generate = useCallback(
    async (messages: AIMessage[]): Promise<string | null> => {
      if (!groqApiKey) {
        setError('Please add your Groq API key in Settings → AI Configuration to use AI features.');
        return null;
      }

      if (!aiEnabled) {
        setError('AI is disabled. Enable it in Settings → AI Configuration.');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await chat(messages, {
          apiKey: groqApiKey!,
          model: aiModel || DEFAULT_MODEL,
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
    [aiEnabled, groqApiKey, aiModel],
  );

  const refineIdea = useCallback(
    async (idea: string) => {
      return generate(AI_PROMPTS.refineIdea(idea));
    },
    [generate],
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

  const suggestCompetitors = useCallback(
    async (projectDescription: string) => {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content:
            'You are a market analyst. Suggest 3-5 competitors or alternatives for the described project. Return ONLY a JSON array of objects with "name", "url" (optional), "strengths" (array of strings), and "gaps" (array of strings — weaknesses you can exploit). No markdown, no explanation — just the JSON array.',
        },
        {
          role: 'user',
          content: `Suggest competitors for: ${projectDescription}`,
        },
      ];
      return generate(messages);
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
    refineIdea,
    suggestFeatures,
    suggestPersonas,
    suggestStack,
    suggestDataModel,
    suggestMilestones,
    suggestCompetitors,
    freeformAsk,
    clearError: () => setError(null),
  };
}
