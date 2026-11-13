import { ToneOption } from '../types/tts';

export const GEMINI_TONES: Record<string, ToneOption> = {
  calme: {
    id: 'calme',
    label: 'Calme',
    tagline: 'Douce, posée & rassurante',
    description: 'Débit modéré, pauses naturelles et articulation claire.',
    geminiStyleInstruction: 'Voix posée, douce, rassurante, chaleureuse, débit modéré, pauses naturelles et articulation claire.'
  },
  energique: {
    id: 'energique',
    label: 'Énergique',
    tagline: 'Dynamique, vive & enthousiaste',
    description: 'Rythme soutenu, articulation nette et intonation engageante.',
    geminiStyleInstruction: 'Voix dynamique, vivante, expressive, enthousiaste, rythme soutenu, articulation nette et intonation engageante.'
  },
  narrateur: {
    id: 'narrateur',
    label: 'Narrateur',
    tagline: 'Professionnelle & immersive',
    description: 'Diction précise, rythme maîtrisé et intonation de marque.',
    geminiStyleInstruction: 'Voix professionnelle, assurée, immersive, diction précise, rythme maîtrisé et intonation adaptée à une narration de marque.'
  }
};

export const DEFAULT_TONE_ID = 'narrateur';
