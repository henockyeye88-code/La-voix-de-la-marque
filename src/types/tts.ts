export type VoiceGender = 'Féminin' | 'Masculin' | 'Neutre';

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  characteristic: string;
  description: string;
  accentNote?: string;
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
  category: 'Publicité' | 'Vidéo de marque' | 'Narration';
  text: string;
  recommendedVoice: string;
  recommendedTone: ToneId;
}

export interface GenerateTTSRequest {
  text: string;
  voiceName?: string;
  avatarId?: string;
  voiceSource?: 'gemini' | 'avatar';
  toneId: ToneId;
}

export interface GenerateTTSResponse {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  voiceName?: string;
  avatarId?: string;
  avatarName?: string;
  voiceSource?: 'gemini' | 'avatar';
  provider?: string;
  toneId?: ToneId;
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
  voiceName: string;
  toneId: ToneId;
  audioBase64?: string; // Optional stored audio
  durationFormatted?: string;
}
