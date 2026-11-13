export interface VoiceAvatar {
  id: string;
  name: string;
  imageUrl?: string;
  provider: 'elevenlabs' | 'gemini_custom' | 'external';
  providerVoiceId: string;
  status: 'ready' | 'processing' | 'error';
  createdAt: number;
  updatedAt: number;
  consentConfirmedAt: number;
  consentVersion: string;
  audioSampleMeta?: {
    filename: string;
    durationSec: number;
    sizeBytes: number;
    mimeType: string;
  };
  sampleAudioBase64?: string;
  notes?: string;
}

export interface CreateAvatarPayload {
  name: string;
  imageUrl?: string;
  audioBase64: string;
  audioFilename: string;
  audioMimeType: string;
  audioDurationSec: number;
  audioSizeBytes: number;
  consentVoiceAuthorization: boolean;
  consentDataProcessing: boolean;
}

export interface UpdateAvatarPayload {
  name?: string;
  imageUrl?: string;
}

export interface AvatarListResponse {
  success: boolean;
  avatars: VoiceAvatar[];
  total: number;
  maxLimit: number;
  cloningConfigured: boolean;
  cloningProvider: string;
}
