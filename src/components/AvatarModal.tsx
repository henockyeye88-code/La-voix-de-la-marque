import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Music,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ShieldCheck,
  Volume2,
  Trash2,
  Play,
  Pause,
  Key
} from 'lucide-react';
import { VoiceAvatar, CreateAvatarPayload } from '../types/avatar';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (avatar: VoiceAvatar) => void;
  avatarToEdit?: VoiceAvatar | null;
  cloningConfigured: boolean;
  currentCount: number;
  maxLimit: number;
}

type StepState = 'idle' | 'verifying' | 'analyzing' | 'cloning' | 'finalizing' | 'success';

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  avatarToEdit,
  cloningConfigured,
  currentCount,
  maxLimit
}) => {
  const isEditing = Boolean(avatarToEdit);

  // Form fields
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Audio fields (for creation)
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Audio preview playback
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Consents
  const [consentAuth, setConsentAuth] = useState(false);
  const [consentProcessing, setConsentProcessing] = useState(false);

  // UI state
  const [stepState, setStepState] = useState<StepState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or reset form on open/edit
  useEffect(() => {
    if (isOpen) {
      if (avatarToEdit) {
        setName(avatarToEdit.name);
        setImageUrl(avatarToEdit.imageUrl || null);
      } else {
        setName('');
        setImageUrl(null);
        setAudioFile(null);
        setAudioBase64(null);
        setAudioDuration(0);
        setAudioUrl(null);
        setConsentAuth(false);
        setConsentProcessing(false);
      }
      setStepState('idle');
      setErrorMessage(null);
      setIsPlayingPreview(false);
    }
  }, [isOpen, avatarToEdit]);

  if (!isOpen) return null;

  // Handle audio selection
  const handleAudioSelect = (file: File) => {
    setErrorMessage(null);

    // Check size (< 25 MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("Le fichier audio dépasse la taille maximale autorisée de 25 Mo.");
      return;
    }

    const url = URL.createObjectURL(file);
    const tempAudio = new Audio(url);

    tempAudio.onloadedmetadata = () => {
      const dur = tempAudio.duration;
      if (dur < 5) {
        setErrorMessage("L'enregistrement est trop court (" + dur.toFixed(1) + "s). Un échantillon d'au moins 5 secondes est requis.");
        URL.revokeObjectURL(url);
        return;
      }
      if (dur > 300) {
        setErrorMessage("L'enregistrement est trop long (" + Math.round(dur) + "s). La durée maximale acceptée est de 5 minutes.");
        URL.revokeObjectURL(url);
        return;
      }

      setAudioDuration(dur);
      setAudioFile(file);
      setAudioUrl(url);

      // Read as base64
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:audio/*;base64, prefix
        const base64 = result.split(',')[1] || result;
        setAudioBase64(base64);
      };
      reader.readAsDataURL(file);
    };

    tempAudio.onerror = () => {
      setErrorMessage("Impossible de lire ce fichier audio. Assurez-vous qu'il s'agit d'un format valide (WAV, MP3, M4A, WebM).");
      URL.revokeObjectURL(url);
    };
  };

  // Handle image selection
  const handleImageSelect = (file: File) => {
    setErrorMessage(null);
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("L'image dépasse la taille maximale de 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleAudioPreview = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((e) => {
        console.error('Audio preview play error:', e);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Veuillez renseigner un nom pour l'avatar.");
      return;
    }

    // Editing mode: PATCH
    if (isEditing && avatarToEdit) {
      try {
        setStepState('verifying');
        const res = await fetch(`/api/avatars/${avatarToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            imageUrl: imageUrl || undefined
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de la modification de l'avatar.");
        }
        onSuccess(data.avatar);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message);
        setStepState('idle');
      }
      return;
    }

    // Creation mode: POST
    if (!audioFile || !audioBase64) {
      setErrorMessage("Veuillez importer un enregistrement audio de référence.");
      return;
    }

    if (!consentAuth || !consentProcessing) {
      setErrorMessage("Vous devez accepter l'autorisation d'utilisation de la voix et le traitement des données.");
      return;
    }

    if (currentCount >= maxLimit) {
      setErrorMessage(`Vous avez atteint la limite de ${maxLimit} avatars. Supprimez un avatar existant pour en créer un nouveau.`);
      return;
    }

    // Step-by-step processing flow
    try {
      setStepState('verifying');
      await new Promise((r) => setTimeout(r, 600));

      setStepState('analyzing');
      await new Promise((r) => setTimeout(r, 800));

      setStepState('cloning');

      const payload: CreateAvatarPayload = {
        name: name.trim(),
        imageUrl: imageUrl || undefined,
        audioBase64,
        audioFilename: audioFile.name,
        audioMimeType: audioFile.type || 'audio/wav',
        audioDurationSec: audioDuration,
        audioSizeBytes: audioFile.size,
        consentVoiceAuthorization: consentAuth,
        consentDataProcessing: consentProcessing
      };

      const res = await fetch('/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue lors de la création de l'avatar.");
      }

      setStepState('finalizing');
      await new Promise((r) => setTimeout(r, 500));

      setStepState('success');
      await new Promise((r) => setTimeout(r, 600));

      onSuccess(data.avatar);
      onClose();
    } catch (err: any) {
      console.error('Avatar creation error:', err);
      setErrorMessage(err.message || "Échec de la création de l'avatar.");
      setStepState('idle');
    }
  };

  const isBusy = stepState !== 'idle';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1B1B21] border border-[#2D2E3B] rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#252532] flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F4F4F5]">
              {isEditing ? "Modifier l'avatar vocal" : 'Créer un avatar vocal personnalisé'}
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {isEditing
                ? "Mettez à jour le nom ou l'image de votre avatar vocal."
                : 'Importez un échantillon audio de voix pour générer un profil vocal dédié.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#F4F4F5] hover:bg-[#252532] transition cursor-pointer"
            aria-label="Fermer la fenêtre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Provider status notice if not configured */}
          {!cloningConfigured && !isEditing && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
              <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-amber-300">Fournisseur de clonage vocal (ElevenLabs)</span>
                <p className="text-amber-200/90 leading-relaxed">
                  Le clonage vocal personnalisé s'appuie sur le moteur spécialisé ElevenLabs (Gemini TTS est dédié aux voix préconstruites). Pour finaliser la création, renseignez votre clé dans <strong className="text-white">Settings &gt; Secrets</strong> avec la variable <code className="bg-[#14151B] px-1 py-0.5 rounded text-amber-300">ELEVENLABS_API_KEY</code>.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Avatar Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#E4E4E7] tracking-wide">
              Nom de l'avatar <span className="text-[#C6FF5B]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBusy}
              placeholder="Ex: Ma voix, Voix officielle de la marque, Narrateur luxe…"
              className="w-full bg-[#14151B] text-[#F4F4F5] placeholder-[#6B7280] rounded-xl px-4 py-3 text-sm border border-[#2D2E3B] focus:border-[#C6FF5B] focus:outline-none transition"
              required
            />
          </div>

          {/* Step 2: Avatar Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#E4E4E7]">
              Image ou photo de l'avatar <span className="text-[#9CA3AF] font-normal">(Facultatif)</span>
            </label>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#3E4050] group shrink-0">
                  <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    disabled={isBusy}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition cursor-pointer"
                    title="Supprimer l'image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#14151B] border border-dashed border-[#3A3B4A] flex flex-col items-center justify-center text-[#71717A] shrink-0">
                  <ImageIcon className="w-5 h-5 text-[#9CA3AF]" />
                  <span className="text-[9px] mt-0.5 text-[#71717A]">Neutre</span>
                </div>
              )}

              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageSelect(f);
                  }}
                />
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#242531] hover:bg-[#2F303E] text-xs font-medium text-[#E4E4E7] border border-[#343544] transition cursor-pointer"
                >
                  {imageUrl ? "Changer l'image" : 'Choisir une photo (JPG, PNG, WEBP)'}
                </button>
                <p className="text-[11px] text-[#71717A]">
                  Taille maximale : 5 Mo. Une illustration neutre sera utilisée par défaut.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Reference Audio Recording (Creation only) */}
          {!isEditing && (
            <div className="space-y-2 pt-2 border-t border-[#252532]">
              <label className="block text-xs font-semibold text-[#E4E4E7]">
                Enregistrement audio de référence <span className="text-[#C6FF5B]">*</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="audio/wav,audio/mp3,audio/mpeg,audio/m4a,audio/webm,audio/ogg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAudioSelect(f);
                }}
              />

              {!audioFile ? (
                <div
                  onClick={() => !isBusy && fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-[#323342] hover:border-[#C6FF5B]/60 bg-[#14151B] rounded-2xl flex flex-col items-center justify-center gap-2 transition cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1F202B] group-hover:bg-[#C6FF5B]/10 flex items-center justify-center text-[#C6FF5B] transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#E4E4E7] group-hover:text-[#C6FF5B] transition">
                      Cliquez pour importer votre fichier audio
                    </span>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      Formats acceptés : WAV, MP3, M4A, WebM • Durée requise : entre 5s et 5 min
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#14151B] border border-[#2B2C38] rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#242531] flex items-center justify-center text-[#C6FF5B] shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F4F4F5] truncate">
                          {audioFile.name}
                        </p>
                        <p className="text-[11px] text-[#9CA3AF]">
                          Durée : {audioDuration.toFixed(1)}s • Taille : {(audioFile.size / 1024).toFixed(0)} Ko
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {audioUrl && (
                        <>
                          <audio
                            ref={previewAudioRef}
                            src={audioUrl}
                            onEnded={() => setIsPlayingPreview(false)}
                          />
                          <button
                            type="button"
                            onClick={toggleAudioPreview}
                            className="p-2 rounded-lg bg-[#232430] hover:bg-[#2F303E] text-[#C6FF5B] transition cursor-pointer"
                            title={isPlayingPreview ? 'Pause' : 'Écouter'}
                          >
                            {isPlayingPreview ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setAudioFile(null);
                          setAudioBase64(null);
                          setAudioDuration(0);
                          setAudioUrl(null);
                          setIsPlayingPreview(false);
                        }}
                        disabled={isBusy}
                        className="p-2 rounded-lg bg-[#232430] hover:bg-rose-500/20 text-[#9CA3AF] hover:text-rose-400 transition cursor-pointer"
                        title="Supprimer le fichier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Mandatory Consents (Creation only) */}
          {!isEditing && (
            <div className="space-y-3 pt-3 border-t border-[#252532] text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#E4E4E7]">
                <ShieldCheck className="w-4 h-4 text-[#C6FF5B]" />
                <span>Autorisations et consentement d'utilisation</span>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer text-[#A1A1AA] hover:text-[#D4D4D8] transition">
                <input
                  type="checkbox"
                  checked={consentAuth}
                  onChange={(e) => setConsentAuth(e.target.checked)}
                  disabled={isBusy}
                  className="mt-0.5 rounded border-[#383949] bg-[#14151B] accent-[#C6FF5B] cursor-pointer"
                  required
                />
                <span className="leading-snug">
                  Je confirme disposer de l'autorisation nécessaire pour utiliser cette voix et créer cet avatar vocal.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-[#A1A1AA] hover:text-[#D4D4D8] transition">
                <input
                  type="checkbox"
                  checked={consentProcessing}
                  onChange={(e) => setConsentProcessing(e.target.checked)}
                  disabled={isBusy}
                  className="mt-0.5 rounded border-[#383949] bg-[#14151B] accent-[#C6FF5B] cursor-pointer"
                  required
                />
                <span className="leading-snug">
                  J'accepte que cet enregistrement soit traité par le fournisseur vocal sélectionné afin de créer l'avatar.
                </span>
              </label>
            </div>
          )}

          {/* Processing Steps feedback */}
          {isBusy && (
            <div className="p-4 rounded-2xl bg-[#14151B] border border-[#2D2E3B] space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C6FF5B]">
                <Loader2 className="w-4 h-4 animate-spin text-[#C6FF5B]" />
                <span>
                  {stepState === 'verifying' && 'Vérification de l’enregistrement…'}
                  {stepState === 'analyzing' && 'Analyse de la qualité audio…'}
                  {stepState === 'cloning' && 'Création de la voix personnalisée…'}
                  {stepState === 'finalizing' && 'Finalisation de l’avatar…'}
                  {stepState === 'success' && 'Avatar créé avec succès !'}
                </span>
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                Traitement sécurisé en cours. Ne fermez pas cette fenêtre.
              </p>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-[#252532] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="px-4 py-2.5 rounded-xl bg-[#232430] hover:bg-[#2C2D3B] text-xs font-semibold text-[#E4E4E7] transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isBusy || (!isEditing && (!consentAuth || !consentProcessing || !audioFile))}
              className="px-5 py-2.5 rounded-xl bg-[#C6FF5B] hover:bg-[#bcf74e] text-[#101114] text-xs font-bold transition shadow-[0_0_20px_rgba(198,255,91,0.25)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#101114]" />}
              <span>{isEditing ? "Enregistrer les modifications" : "Créer mon avatar vocal"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
