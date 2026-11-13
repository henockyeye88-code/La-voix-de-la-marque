/**
 * Modular VoiceProvider architecture
 * Separates standard speech synthesis (Gemini TTS) from voice cloning (ElevenLabs / external).
 */

export interface VoiceProvider {
  name: string;
  isConfigured: () => boolean;
  createVoiceProfile?: (
    name: string,
    audioBuffer: Buffer,
    filename: string,
    mimeType: string
  ) => Promise<{ providerVoiceId: string }>;
  synthesizeSpeech: (
    text: string,
    voiceId: string,
    toneId?: string,
    styleInstruction?: string
  ) => Promise<{ audioBuffer: Buffer; mimeType: string }>;
  deleteVoiceProfile?: (providerVoiceId: string) => Promise<boolean>;
}

/**
 * ElevenLabs implementation for custom voice cloning & avatar synthesis
 */
export class ElevenLabsVoiceProvider implements VoiceProvider {
  name = 'elevenlabs';

  private getApiKey(): string | null {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key || key.trim() === '' || key === 'MY_ELEVENLABS_API_KEY') {
      return null;
    }
    return key.trim();
  }

  isConfigured(): boolean {
    return Boolean(this.getApiKey());
  }

  async createVoiceProfile(
    name: string,
    audioBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ providerVoiceId: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        "Le moteur de clonage vocal (ElevenLabs) n'est pas configuré. Veuillez définir la variable d'environnement ELEVENLABS_API_KEY dans les paramètres."
      );
    }

    // Call official ElevenLabs Instant Voice Cloning API: POST /v1/voices/add
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', 'Avatar créé depuis La voix de la marque');

    // Create a Blob from the Buffer for multipart upload
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append('files', audioBlob, filename || 'reference-audio.wav');

    const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey
      },
      body: formData
    });

    if (!res.ok) {
      let errText = '';
      try {
        const errJson = await res.json();
        errText = errJson?.detail?.message || JSON.stringify(errJson);
      } catch (_) {
        errText = await res.text();
      }
      throw new Error(
        `Échec du clonage auprès du fournisseur vocal (${res.status}) : ${errText}`
      );
    }

    const data = await res.json();
    if (!data.voice_id) {
      throw new Error("L'identifiant vocal n'a pas été retourné par le fournisseur.");
    }

    return { providerVoiceId: data.voice_id };
  }

  async synthesizeSpeech(
    text: string,
    voiceId: string,
    toneId: string = 'narrateur',
    styleInstruction?: string
  ): Promise<{ audioBuffer: Buffer; mimeType: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        "Le moteur de clonage vocal n'est pas configuré. Veuillez définir la variable d'environnement ELEVENLABS_API_KEY."
      );
    }

    // Adapt stability & similarity boost based on tone
    let stability = 0.5;
    let similarityBoost = 0.8;
    if (toneId === 'calme') {
      stability = 0.75;
      similarityBoost = 0.85;
    } else if (toneId === 'energique') {
      stability = 0.35;
      similarityBoost = 0.75;
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          use_speaker_boost: true
        }
      })
    });

    if (!res.ok) {
      let errText = '';
      try {
        const errJson = await res.json();
        errText = errJson?.detail?.message || JSON.stringify(errJson);
      } catch (_) {
        errText = await res.text();
      }
      throw new Error(
        `Erreur de synthèse vocale personnalisée (${res.status}) : ${errText}`
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    return {
      audioBuffer: Buffer.from(arrayBuffer),
      mimeType: 'audio/mpeg'
    };
  }

  async deleteVoiceProfile(providerVoiceId: string): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return true; // If key missing, can only remove locally
    }

    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/voices/${providerVoiceId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': apiKey
        }
      });
      return res.ok;
    } catch (err) {
      console.warn('[VoiceProvider] Remote deletion failed:', err);
      return false;
    }
  }
}
