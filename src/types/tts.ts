export type VoiceGender = 'Féminin' | 'Masculin' | 'Neutre';

export type VoiceRegion = 'africaine' | 'internationale';

export type VoiceLanguageId =
  | 'fr-standard'
  | 'ln-cd'
  | 'yo-ng'
  | 'sw-ea'
  | 'wo-sn'
  | 'kg-cd'
  | 'fr-af';

export interface VoiceLanguageOption {
  id: VoiceLanguageId;
  label: string;
  shortLabel: string;
  regionLabel: string;
  description: string;
  dictionDetail: string;
  originalDictionInstruction: string;
  auditionSampleText: string;
  supportsToneControl: boolean;
}

export interface VoiceOption {
  id: string;
  geminiVoiceName: string;
  name: string;
  gender: VoiceGender;
  region: VoiceRegion;
  originTag?: string;
  recommendedLanguageId?: VoiceLanguageId;
  characteristic: string;
  description: string;
  dictionPrompt?: string;
  auditionText?: string;
}

export type ToneId = 'calme' | 'energique' | 'narrateur';

export interface ToneOption {
  id: ToneId;
  label: string;
  tagline: string;
  description: string;
  geminiStyleInstruction: string;
}

export interface ScriptPreset {
  id: string;
  title: string;
  category: 'Publicité' | 'Vidéo de marque' | 'Narration' | 'Voix Africaines';
  text: string;
  recommendedVoice: string;
  recommendedTone: ToneId;
  recommendedLanguageId?: VoiceLanguageId;
}

export interface GenerateTTSRequest {
  text: string;
  voiceName?: string;
  avatarId?: string;
  voiceSource?: 'gemini' | 'avatar';
  toneId: ToneId;
  languageId?: VoiceLanguageId;
  originalDiction?: boolean;
}

export interface GenerateTTSResponse {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  voiceName?: string;
  voiceLabel?: string;
  avatarId?: string;
  avatarName?: string;
  voiceSource?: 'gemini' | 'avatar';
  provider?: string;
  model?: string;
  toneId?: ToneId;
  languageId?: VoiceLanguageId;
  languageLabel?: string;
  originalDiction?: boolean;
  characterCount?: number;
  wordCount?: number;
  error?: string;
  errorCode?: string;
}

export interface CreationHistoryItem {
  id: string;
  timestamp: number;
  textSnippet: string;
  fullText: string;
  voiceId?: string;
  voiceName: string;
  voiceLabel?: string;
  toneId: ToneId;
  languageId?: VoiceLanguageId;
  originalDiction?: boolean;
  audioBase64?: string;
  durationFormatted?: string;
}
