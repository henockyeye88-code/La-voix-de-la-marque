import { GEMINI_VOICES, DEFAULT_VOICE_ID } from '../constants/voices';
import { VOICE_LANGUAGES_MAP, DEFAULT_LANGUAGE_ID } from '../constants/languages';
import { GEMINI_TONES, DEFAULT_TONE_ID } from '../constants/tones';
import { ToneId, VoiceLanguageId, VoiceLanguageOption, VoiceOption } from '../types/tts';

export const STANDARD_TTS_MODEL = 'gemini-3.8-flash-lite-tts';
export const VOICE_DESIGN_TTS_MODEL = 'gemini-3.8-flash-tts';

export interface ResolvedTTSConfig {
  voiceOption: VoiceOption;
  geminiVoiceName: string;
  languageOption: VoiceLanguageOption;
  toneId: ToneId;
  originalDiction: boolean;
  styleInstruction: string;
  model: string;
}

export function resolveVoiceOption(voiceId?: string): VoiceOption {
  if (!voiceId) {
    return GEMINI_VOICES.find((v) => v.id === DEFAULT_VOICE_ID) || GEMINI_VOICES[0];
  }
  const exactMatch = GEMINI_VOICES.find((v) => v.id === voiceId);
  if (exactMatch) {
    return exactMatch;
  }
  const fallbackByGeminiName = GEMINI_VOICES.find(
    (v) => v.region === 'internationale' && v.geminiVoiceName.toLowerCase() === voiceId.toLowerCase()
  );
  return (
    fallbackByGeminiName ||
    GEMINI_VOICES.find((v) => v.id === DEFAULT_VOICE_ID) ||
    GEMINI_VOICES[0]
  );
}

export function resolveLanguageOption(languageId?: string): VoiceLanguageOption {
  if (languageId && languageId in VOICE_LANGUAGES_MAP) {
    return VOICE_LANGUAGES_MAP[languageId as VoiceLanguageId];
  }
  return VOICE_LANGUAGES_MAP[DEFAULT_LANGUAGE_ID];
}

export function resolveToneId(toneId?: string): ToneId {
  if (toneId && toneId in GEMINI_TONES) {
    return toneId as ToneId;
  }
  return DEFAULT_TONE_ID as ToneId;
}

/**
 * Builds the exact Gemini TTS style metadata & voice selection
 * without ever modifying or truncating the user's spoken script.
 */
export function buildGeminiTTSConfig(params: {
  voiceId?: string;
  languageId?: string;
  toneId?: string;
  originalDiction?: boolean;
}): ResolvedTTSConfig {
  const voiceOption = resolveVoiceOption(params.voiceId);
  const effectiveLanguageId =
    params.languageId || voiceOption.recommendedLanguageId || DEFAULT_LANGUAGE_ID;
  const languageOption = resolveLanguageOption(effectiveLanguageId);
  const toneId = resolveToneId(params.toneId);
  const toneOption = GEMINI_TONES[toneId];
  const originalDiction = params.originalDiction !== false;

  const isAfricanProfile =
    voiceOption.region === 'africaine' || languageOption.id !== 'fr-standard';

  const styleParts: string[] = [];

  if (voiceOption.dictionPrompt) {
    styleParts.push(voiceOption.dictionPrompt);
  }

  styleParts.push(languageOption.originalDictionInstruction);

  if (originalDiction && isAfricanProfile) {
    styleParts.push(
      'Strictly preserve purely original native pronunciation, tonal melody, authentic vowel articulation, and natural regional cadence; read the exact provided text verbatim without translating or altering any word.'
    );
  }

  styleParts.push(toneOption.geminiStyleInstruction);

  // Use Flagship Voice Design model for African personas & tonal languages for maximum diction fidelity
  const model = isAfricanProfile ? VOICE_DESIGN_TTS_MODEL : STANDARD_TTS_MODEL;

  return {
    voiceOption,
    geminiVoiceName: voiceOption.geminiVoiceName,
    languageOption,
    toneId,
    originalDiction,
    styleInstruction: styleParts.join(' '),
    model
  };
}
