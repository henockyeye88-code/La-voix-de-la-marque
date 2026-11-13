import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  readAvatars,
  addAvatar,
  updateAvatar,
  removeAvatar,
  canCreateAvatar,
  validateConsent,
  validateAudioSample,
  MAX_AVATARS_LIMIT,
  CURRENT_CONSENT_VERSION
} from './src/server/avatarStore';
import { ElevenLabsVoiceProvider } from './src/server/voiceProvider';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '50mb' }));

// Known Gemini voices and tone instructions
const ALLOWED_VOICES = new Set([
  'Kore',
  'Puck',
  'Charon',
  'Fenrir',
  'Aoede',
  'Leda',
  'Orus',
  'Zephyr',
  'Sulafat',
  'Achird'
]);

const TONE_INSTRUCTIONS: Record<string, string> = {
  calme: 'Voix posée, douce, rassurante, chaleureuse, débit modéré, pauses naturelles et articulation claire.',
  energique: 'Voix dynamique, vivante, expressive, enthousiaste, rythme soutenu, articulation nette et intonation engageante.',
  narrateur: 'Voix professionnelle, assurée, immersive, diction précise, rythme maîtrisé et intonation adaptée à une narration de marque.'
};

const DEFAULT_MODEL = 'gemini-3.8-flash-lite-tts';

// Voice cloning provider (ElevenLabs)
const cloningProvider = new ElevenLabsVoiceProvider();

// Initialize Gemini client if API key is set
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Health and Status API
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    hasApiKey: hasKey,
    model: DEFAULT_MODEL,
    supportedVoices: Array.from(ALLOWED_VOICES),
    cloningConfigured: cloningProvider.isConfigured(),
    cloningProvider: cloningProvider.name,
    maxAvatarsLimit: MAX_AVATARS_LIMIT
  });
});

// ==========================================
// AVATAR MANAGEMENT API
// ==========================================

// GET /api/avatars - List user avatars
app.get('/api/avatars', (req, res) => {
  try {
    const avatars = readAvatars();
    res.json({
      success: true,
      avatars,
      total: avatars.length,
      maxLimit: MAX_AVATARS_LIMIT,
      cloningConfigured: cloningProvider.isConfigured(),
      cloningProvider: cloningProvider.name
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la lecture des avatars.'
    });
  }
});

// POST /api/avatars - Create new custom voice avatar
app.post('/api/avatars', async (req, res) => {
  try {
    const {
      name,
      imageUrl,
      audioBase64,
      audioFilename = 'sample.wav',
      audioMimeType = 'audio/wav',
      audioDurationSec = 0,
      audioSizeBytes = 0,
      consentVoiceAuthorization,
      consentDataProcessing
    } = req.body;

    // 1. Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Veuillez renseigner un nom pour l'avatar vocal."
      });
    }

    // 2. Validate strictly maximum 6 avatars limit
    const limitCheck = canCreateAvatar();
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false,
        errorCode: 'MAX_AVATARS_REACHED',
        error: limitCheck.error
      });
    }

    // 3. Validate mandatory consents
    const consentCheck = validateConsent(consentVoiceAuthorization, consentDataProcessing);
    if (!consentCheck.isValid) {
      return res.status(400).json({
        success: false,
        errorCode: 'CONSENT_REQUIRED',
        error: consentCheck.error
      });
    }

    // 4. Validate audio sample
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Aucun enregistrement audio de référence fourni.'
      });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const actualSize = audioSizeBytes || audioBuffer.length;

    const audioCheck = validateAudioSample(actualSize, audioDurationSec, audioMimeType);
    if (!audioCheck.isValid) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_AUDIO_SAMPLE',
        error: audioCheck.error
      });
    }

    // 5. Check if Voice Cloning Provider (ElevenLabs) is configured
    if (!cloningProvider.isConfigured()) {
      return res.status(503).json({
        success: false,
        errorCode: 'CLONING_PROVIDER_NOT_CONFIGURED',
        error:
          "Le fournisseur de clonage vocal (ElevenLabs) n'est pas encore configuré. Renseignez la variable d'environnement ELEVENLABS_API_KEY dans vos paramètres.",
        requiredEnvVar: 'ELEVENLABS_API_KEY',
        provider: 'elevenlabs'
      });
    }

    // 6. Call cloning API to create remote voice profile
    const { providerVoiceId } = await cloningProvider.createVoiceProfile(
      name.trim(),
      audioBuffer,
      audioFilename,
      audioMimeType
    );

    // 7. Store avatar in database
    const newAvatar = addAvatar({
      name: name.trim(),
      imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl : undefined,
      provider: 'elevenlabs',
      providerVoiceId,
      status: 'ready',
      consentConfirmedAt: Date.now(),
      consentVersion: CURRENT_CONSENT_VERSION,
      audioSampleMeta: {
        filename: audioFilename,
        durationSec: Math.round(audioDurationSec * 10) / 10,
        sizeBytes: actualSize,
        mimeType: audioMimeType
      }
    });

    return res.status(201).json({
      success: true,
      avatar: newAvatar,
      message: 'Avatar créé avec succès.'
    });
  } catch (err: any) {
    console.error('[CreateAvatar Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || "Une erreur est survenue lors de la création de l'avatar."
    });
  }
});

// PATCH /api/avatars/:id - Update avatar name or image
app.patch('/api/avatars/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl } = req.body;

    const updated = updateAvatar(id, { name, imageUrl });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Avatar non trouvé.'
      });
    }

    return res.json({
      success: true,
      avatar: updated
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur lors de la modification de l'avatar."
    });
  }
});

// DELETE /api/avatars/:id - Delete avatar locally and remotely
app.delete('/api/avatars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const avatars = readAvatars();
    const avatar = avatars.find((a) => a.id === id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        error: 'Avatar introuvable.'
      });
    }

    // Try remote deletion if provider is configured
    if (avatar.provider === 'elevenlabs' && cloningProvider.isConfigured()) {
      try {
        await cloningProvider.deleteVoiceProfile(avatar.providerVoiceId);
      } catch (e) {
        console.warn('[Avatar Deletion] Remote voice deletion failed:', e);
      }
    }

    const removed = removeAvatar(id);
    return res.json({
      success: true,
      message: 'Avatar supprimé avec succès.',
      removed
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Erreur lors de la suppression de l'avatar."
    });
  }
});

// ==========================================
// TTS GENERATION API
// ==========================================

app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', avatarId, voiceSource = 'gemini', toneId = 'narrateur' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Le texte est vide. Veuillez saisir ou coller un script avant de générer la voix.'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Le texte dépasse la limite autorisée de 5 000 caractères.'
      });
    }

    // Route A: Custom Avatar Voice Synthesis
    if (voiceSource === 'avatar' || avatarId) {
      const avatars = readAvatars();
      const targetAvatar = avatars.find((a) => a.id === avatarId);

      if (!targetAvatar) {
        return res.status(404).json({
          success: false,
          error: "L'avatar personnalisé sélectionné n'a pas été trouvé."
        });
      }

      if (!cloningProvider.isConfigured()) {
        return res.status(503).json({
          success: false,
          errorCode: 'CLONING_PROVIDER_NOT_CONFIGURED',
          error:
            "Le moteur de clonage vocal (ElevenLabs) n'est pas encore configuré avec sa clé API. Renseignez la variable d'environnement ELEVENLABS_API_KEY dans vos paramètres.",
          requiredEnvVar: 'ELEVENLABS_API_KEY'
        });
      }

      const styleInstruction = TONE_INSTRUCTIONS[toneId] || TONE_INSTRUCTIONS.narrateur;
      const { audioBuffer, mimeType } = await cloningProvider.synthesizeSpeech(
        text.trim(),
        targetAvatar.providerVoiceId,
        toneId,
        styleInstruction
      );

      return res.json({
        success: true,
        audioBase64: audioBuffer.toString('base64'),
        mimeType,
        voiceSource: 'avatar',
        avatarId: targetAvatar.id,
        avatarName: targetAvatar.name,
        toneId,
        provider: 'elevenlabs'
      });
    }

    // Route B: Gemini TTS (Prebuilt Voices)
    const selectedVoice = ALLOWED_VOICES.has(voiceName) ? voiceName : 'Kore';
    const styleInstruction = TONE_INSTRUCTIONS[toneId] || TONE_INSTRUCTIONS.narrateur;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        errorCode: 'MISSING_API_KEY',
        error: "Clé API Gemini non configurée. Veuillez renseigner la variable d'environnement GEMINI_API_KEY dans vos paramètres."
      });
    }

    // Call Gemini Text-to-Speech API
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: styleInstruction
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice }
          }
        }
      }
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(
      (part: any) => part.inlineData && part.inlineData.data
    );

    if (!audioPart || !audioPart.inlineData?.data) {
      return res.status(502).json({
        success: false,
        errorCode: 'EMPTY_AUDIO',
        error: 'Le modèle Gemini TTS a répondu sans données audio. Veuillez réessayer.'
      });
    }

    const base64Audio = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType,
      voiceSource: 'gemini',
      voiceName: selectedVoice,
      toneId,
      model: DEFAULT_MODEL
    });
  } catch (err: any) {
    console.error('TTS Generation error:', err);
    const message = err?.message || '';

    let userMessage = 'Une erreur est survenue lors de la synthèse vocale.';
    let statusCode = 500;

    if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
      userMessage = 'Quota API dépassé ou limite de requêtes atteinte. Merci de patienter quelques secondes.';
      statusCode = 429;
    } else if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
      userMessage = 'La clé API configurée est invalide.';
      statusCode = 401;
    } else if (message.includes('not found') || message.includes('404')) {
      userMessage = `Le modèle vocal est temporairement indisponible.`;
      statusCode = 502;
    } else if (message.includes('SAFETY') || message.includes('blocked')) {
      userMessage = 'Le texte fourni a été restreint par les filtres de sécurité de l’API.';
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      error: userMessage,
      details: isProduction ? undefined : message
    });
  }
});

// Cache for quick audition clips so they load instantly
const auditionCache = new Map<string, string>();

app.get('/api/tts/audition/:voiceName', async (req, res) => {
  try {
    const { voiceName } = req.params;
    const selectedVoice = ALLOWED_VOICES.has(voiceName) ? voiceName : 'Kore';

    if (auditionCache.has(selectedVoice)) {
      return res.json({
        success: true,
        audioBase64: auditionCache.get(selectedVoice),
        mimeType: 'audio/wav',
        voiceName: selectedVoice
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'Clé API non configurée'
      });
    }

    const samplePrompt = `Bonjour, je suis la voix ${selectedVoice}, conçue pour donner vie à votre marque.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: samplePrompt,
              speechMetadata: {
                style: 'Voix claire, élégante et chaleureuse.'
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice }
          }
        }
      }
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(
      (part: any) => part.inlineData && part.inlineData.data
    );

    if (audioPart?.inlineData?.data) {
      auditionCache.set(selectedVoice, audioPart.inlineData.data);
      return res.json({
        success: true,
        audioBase64: audioPart.inlineData.data,
        mimeType: 'audio/wav',
        voiceName: selectedVoice
      });
    }

    return res.status(502).json({ success: false, error: 'Données audio manquantes' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[La voix de la marque] Serveur actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
