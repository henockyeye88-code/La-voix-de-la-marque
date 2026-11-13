import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { VoiceAvatar, CreateAvatarPayload } from '../types/avatar';

export const MAX_AVATARS_LIMIT = 6;
export const CURRENT_CONSENT_VERSION = 'v1.0-fr';

// Allowed audio MIME types for voice cloning
export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp3',
  'audio/mpeg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/webm',
  'audio/ogg'
]);

export const MIN_AUDIO_DURATION_SEC = 5;
export const MAX_AUDIO_DURATION_SEC = 300; // 5 minutes max
export const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const DATA_DIR = path.resolve(process.cwd(), 'data');
const AVATARS_FILE = path.join(DATA_DIR, 'avatars.json');

// Ensure data directory exists
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read all avatars from persistent JSON file
export function readAvatars(): VoiceAvatar[] {
  ensureDataDir();
  if (!fs.existsSync(AVATARS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(AVATARS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[AvatarStore] Error reading avatars file:', err);
    return [];
  }
}

// Save avatars to persistent JSON file atomically
export function saveAvatars(avatars: VoiceAvatar[]): void {
  ensureDataDir();
  const tempFile = `${AVATARS_FILE}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(avatars, null, 2), 'utf-8');
    fs.renameSync(tempFile, AVATARS_FILE);
  } catch (err) {
    console.error('[AvatarStore] Error saving avatars file:', err);
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (_) {}
    }
    throw err;
  }
}

export function canCreateAvatar(): { allowed: boolean; currentCount: number; maxLimit: number; error?: string } {
  const avatars = readAvatars();
  const currentCount = avatars.length;
  if (currentCount >= MAX_AVATARS_LIMIT) {
    return {
      allowed: false,
      currentCount,
      maxLimit: MAX_AVATARS_LIMIT,
      error: `Vous avez atteint la limite de ${MAX_AVATARS_LIMIT} avatars. Supprimez un avatar existant pour en créer un nouveau.`
    };
  }
  return {
    allowed: true,
    currentCount,
    maxLimit: MAX_AVATARS_LIMIT
  };
}

export function validateConsent(
  consentAuth: boolean,
  consentProcessing: boolean
): { isValid: boolean; error?: string } {
  if (!consentAuth) {
    return {
      isValid: false,
      error: "Vous devez confirmer disposer de l'autorisation nécessaire pour utiliser cette voix."
    };
  }
  if (!consentProcessing) {
    return {
      isValid: false,
      error: "Vous devez accepter le traitement de l'enregistrement pour la création de l'avatar."
    };
  }
  return { isValid: true };
}

export function validateAudioSample(
  sizeBytes: number,
  durationSec: number,
  mimeType: string
): { isValid: boolean; error?: string } {
  if (!sizeBytes || sizeBytes <= 0) {
    return { isValid: false, error: "Le fichier audio sélectionné est vide." };
  }
  if (sizeBytes > MAX_AUDIO_SIZE_BYTES) {
    return {
      isValid: false,
      error: `La taille du fichier audio (${(sizeBytes / (1024 * 1024)).toFixed(1)} Mo) dépasse la limite de 25 Mo.`
    };
  }
  if (durationSec > 0 && durationSec < MIN_AUDIO_DURATION_SEC) {
    return {
      isValid: false,
      error: `L'enregistrement est trop court (${durationSec.toFixed(1)}s). Un échantillon d'au moins ${MIN_AUDIO_DURATION_SEC} secondes est requis pour analyser l'empreinte vocale.`
    };
  }
  if (durationSec > MAX_AUDIO_DURATION_SEC) {
    return {
      isValid: false,
      error: `L'enregistrement est trop long (${Math.round(durationSec)}s). La durée maximale acceptée est de 5 minutes (${MAX_AUDIO_DURATION_SEC}s).`
    };
  }
  if (mimeType && !ALLOWED_AUDIO_MIME_TYPES.has(mimeType.toLowerCase())) {
    return {
      isValid: false,
      error: `Format audio non supporté (${mimeType}). Veuillez fournir un fichier WAV, MP3, M4A ou WebM.`
    };
  }
  return { isValid: true };
}

export function addAvatar(
  payload: Omit<VoiceAvatar, 'id' | 'createdAt' | 'updatedAt'>
): VoiceAvatar {
  const check = canCreateAvatar();
  if (!check.allowed) {
    throw new Error(check.error || 'Limite de 6 avatars atteinte.');
  }

  const avatars = readAvatars();
  const now = Date.now();
  const id = `avatar_${crypto.randomBytes(8).toString('hex')}`;

  const newAvatar: VoiceAvatar = {
    ...payload,
    id,
    createdAt: now,
    updatedAt: now
  };

  avatars.push(newAvatar);
  saveAvatars(avatars);
  return newAvatar;
}

export function updateAvatar(
  id: string,
  updates: Partial<Pick<VoiceAvatar, 'name' | 'imageUrl'>>
): VoiceAvatar | null {
  const avatars = readAvatars();
  const index = avatars.findIndex((a) => a.id === id);
  if (index === -1) {
    return null;
  }

  const existing = avatars[index];
  const updated: VoiceAvatar = {
    ...existing,
    name: updates.name ? updates.name.trim() : existing.name,
    imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : existing.imageUrl,
    updatedAt: Date.now()
  };

  avatars[index] = updated;
  saveAvatars(avatars);
  return updated;
}

export function removeAvatar(id: string): VoiceAvatar | null {
  const avatars = readAvatars();
  const index = avatars.findIndex((a) => a.id === id);
  if (index === -1) {
    return null;
  }

  const [removed] = avatars.splice(index, 1);
  saveAvatars(avatars);
  return removed;
}
