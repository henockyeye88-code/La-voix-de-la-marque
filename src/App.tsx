import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ScriptEditor } from './components/ScriptEditor';
import { VoiceSelector } from './components/VoiceSelector';
import { LanguageSelector } from './components/LanguageSelector';
import { ToneSelector } from './components/ToneSelector';
import { AudioStudioPlayer } from './components/AudioStudioPlayer';
import { DownloadPanel } from './components/DownloadPanel';
import { HistorySection } from './components/HistorySection';
import { StatusAlert } from './components/StatusAlert';
import { AvatarLibrary } from './components/AvatarLibrary';
import { AvatarModal } from './components/AvatarModal';
import { DEFAULT_VOICE_ID, GEMINI_VOICES } from './constants/voices';
import { DEFAULT_TONE_ID, GEMINI_TONES } from './constants/tones';
import { DEFAULT_LANGUAGE_ID, VOICE_LANGUAGES_MAP } from './constants/languages';
import {
  ToneId,
  ScriptPreset,
  CreationHistoryItem,
  GenerateTTSResponse,
  VoiceLanguageId,
  VoiceOption
} from './types/tts';
import { VoiceAvatar, AvatarListResponse } from './types/avatar';
import { Play, Sparkles, Loader2, Wand2, Shield, Users, Mic2 } from 'lucide-react';
import { MAX_SCRIPT_CHARACTERS, countWords, estimateReadingDurationSec, formatDurationHumanFr } from './utils/textStats';

const LOCAL_STORAGE_KEY = 'la_voix_de_la_marque_history_v1';
const MAX_AVATARS_LIMIT = 6;

export default function App() {
  // Navigation tabs: 'studio' | 'avatars'
  const [activeTab, setActiveTab] = useState<'studio' | 'avatars'>('studio');

  // Studio State
  const [text, setText] = useState<string>('');
  const [voiceSource, setVoiceSource] = useState<'gemini' | 'avatar'>('gemini');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(DEFAULT_VOICE_ID);
  const [selectedLanguageId, setSelectedLanguageId] = useState<VoiceLanguageId>(DEFAULT_LANGUAGE_ID);
  const [originalDiction, setOriginalDiction] = useState<boolean>(true);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [selectedToneId, setSelectedToneId] = useState<ToneId>(DEFAULT_TONE_ID);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('Votre voix prend vie…');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Result
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wavBuffer, setWavBuffer] = useState<Uint8Array | null>(null);
  const [lastGeneratedVoice, setLastGeneratedVoice] = useState<string>(DEFAULT_VOICE_ID);
  const [lastGeneratedTone, setLastGeneratedTone] = useState<ToneId>(DEFAULT_TONE_ID);
  const [lastGeneratedLanguageLabel, setLastGeneratedLanguageLabel] = useState<string>('Français');
  const [lastGeneratedOriginalDiction, setLastGeneratedOriginalDiction] = useState<boolean>(true);

  // API Status & Avatars
  const [apiConfigured, setApiConfigured] = useState<boolean>(false);
  const [cloningConfigured, setCloningConfigured] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('gemini-3.8-flash-lite-tts');
  const [avatars, setAvatars] = useState<VoiceAvatar[]>([]);

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [avatarToEdit, setAvatarToEdit] = useState<VoiceAvatar | null>(null);

  // History
  const [historyItems, setHistoryItems] = useState<CreationHistoryItem[]>([]);

  // Ref for auto-scroll to player
  const playerRef = useRef<HTMLDivElement | null>(null);

  // Load API status and avatars on mount
  const refreshAvatars = () => {
    fetch('/api/avatars')
      .then((res) => res.json())
      .then((data: AvatarListResponse) => {
        if (data.success && Array.isArray(data.avatars)) {
          setAvatars(data.avatars);
          setCloningConfigured(data.cloningConfigured);
        }
      })
      .catch((err) => {
        console.warn('Avatars loading error:', err);
      });
  };

  useEffect(() => {
    // Check status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasApiKey !== undefined) {
          setApiConfigured(data.hasApiKey);
        }
        if (data.model) {
          setModelName(data.model);
        }
        if (data.cloningConfigured !== undefined) {
          setCloningConfigured(data.cloningConfigured);
        }
      })
      .catch((err) => {
        console.warn('API status check error:', err);
      });

    // Load avatars from server
    refreshAvatars();

    // Load history from localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage', e);
    }
  }, []);

  // Preset selection handler
  const handleSelectPreset = (preset: ScriptPreset) => {
    setText(preset.text);
    setVoiceSource('gemini');
    if (preset.recommendedVoice) {
      setSelectedVoiceId(preset.recommendedVoice);
    }
    if (preset.recommendedTone) {
      setSelectedToneId(preset.recommendedTone);
    }
    if (preset.recommendedLanguageId) {
      setSelectedLanguageId(preset.recommendedLanguageId);
    }
    setErrorMessage(null);
  };

  // Voice selection handler (syncs recommended African language when choosing an African voice persona)
  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoiceId(voice.id);
    if (voice.recommendedLanguageId) {
      setSelectedLanguageId(voice.recommendedLanguageId);
      setOriginalDiction(true);
    }
  };

  // Avatar actions
  const handleSelectAvatarInStudio = (avatar: VoiceAvatar) => {
    setVoiceSource('avatar');
    setSelectedAvatarId(avatar.id);
    setActiveTab('studio');
    setErrorMessage(null);
  };

  const handleOpenCreateModal = () => {
    setAvatarToEdit(null);
    setIsAvatarModalOpen(true);
  };

  const handleOpenEditModal = (avatar: VoiceAvatar) => {
    setAvatarToEdit(avatar);
    setIsAvatarModalOpen(true);
  };

  const handleDeleteAvatar = async (avatar: VoiceAvatar) => {
    try {
      const res = await fetch(`/api/avatars/${avatar.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la suppression de l'avatar.");
      }

      setAvatars((prev) => prev.filter((a) => a.id !== avatar.id));
      if (selectedAvatarId === avatar.id) {
        setSelectedAvatarId(null);
        setVoiceSource('gemini');
      }
    } catch (err: any) {
      console.error('Delete avatar error:', err);
      setErrorMessage(err.message);
    }
  };

  const handleAvatarModalSuccess = (savedAvatar: VoiceAvatar) => {
    refreshAvatars();
    // Auto-select the newly created or edited avatar
    setVoiceSource('avatar');
    setSelectedAvatarId(savedAvatar.id);
  };

  // Generate TTS
  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMessage('Veuillez saisir ou coller un texte avant de générer la voix.');
      return;
    }

    if (text.length > MAX_SCRIPT_CHARACTERS) {
      setErrorMessage(
        `Le texte dépasse la limite de ${MAX_SCRIPT_CHARACTERS.toLocaleString('fr-FR')} caractères.`
      );
      return;
    }

    if (voiceSource === 'avatar' && !selectedAvatarId) {
      setErrorMessage('Veuillez sélectionner un avatar vocal dans la liste.');
      return;
    }

    setIsLoading(true);
    setLoadingStepText('Votre voix prend vie…');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceSource,
          voiceName: voiceSource === 'gemini' ? selectedVoiceId : undefined,
          avatarId: voiceSource === 'avatar' ? selectedAvatarId : undefined,
          toneId: selectedToneId,
          languageId: selectedLanguageId,
          originalDiction
        })
      });

      const data: GenerateTTSResponse = await response.json();

      if (!response.ok || !data.success || !data.audioBase64) {
        throw new Error(data.error || 'Erreur inattendue lors de la génération audio.');
      }

      // Decode base64 to binary ArrayBuffer / Uint8Array
      const binaryString = atob(data.audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Cleanup old URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const newUrl = URL.createObjectURL(blob);

      const effectiveVoiceName =
        data.voiceSource === 'avatar'
          ? data.avatarName || 'Avatar personnalisé'
          : data.voiceLabel || data.voiceName || selectedVoiceId;

      setWavBuffer(bytes);
      setAudioBlob(blob);
      setAudioUrl(newUrl);
      setLastGeneratedVoice(effectiveVoiceName);
      setLastGeneratedTone(data.toneId || selectedToneId);
      setLastGeneratedLanguageLabel(
        data.languageLabel || VOICE_LANGUAGES_MAP[selectedLanguageId]?.shortLabel || 'Français'
      );
      setLastGeneratedOriginalDiction(data.originalDiction ?? originalDiction);

      // Save to history
      const words = countWords(text);
      const estSec = estimateReadingDurationSec(words);
      const newItem: CreationHistoryItem = {
        id: 'hist-' + Date.now(),
        timestamp: Date.now(),
        textSnippet: text.trim().slice(0, 110) + (text.length > 110 ? '…' : ''),
        fullText: text.trim(),
        voiceId: voiceSource === 'gemini' ? selectedVoiceId : undefined,
        voiceName: effectiveVoiceName,
        toneId: data.toneId || selectedToneId,
        languageId: data.languageId || selectedLanguageId,
        originalDiction: data.originalDiction ?? originalDiction,
        durationFormatted: formatDurationHumanFr(estSec)
      };

      const updatedHistory = [newItem, ...historyItems.slice(0, 9)];
      setHistoryItems(updatedHistory);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn('Failed to save history in localStorage', e);
      }

      // Smooth scroll to player
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Generation failure:', err);
      setErrorMessage(
        err.message || 'Impossible de contacter le service de génération. Veuillez vérifier votre configuration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadScript = (
    fullText: string,
    voiceIdOrName: string,
    toneId: ToneId,
    languageId?: VoiceLanguageId,
    savedOriginalDiction?: boolean
  ) => {
    setText(fullText);
    setVoiceSource('gemini');
    const matchedVoice = GEMINI_VOICES.find(
      (v) => v.id === voiceIdOrName || v.name === voiceIdOrName
    );
    if (matchedVoice) {
      setSelectedVoiceId(matchedVoice.id);
    }
    setSelectedToneId(toneId);
    if (languageId && VOICE_LANGUAGES_MAP[languageId]) {
      setSelectedLanguageId(languageId);
    }
    if (typeof savedOriginalDiction === 'boolean') {
      setOriginalDiction(savedOriginalDiction);
    }
    setErrorMessage(null);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear history in localStorage', e);
    }
  };

  const currentVoiceObj = GEMINI_VOICES.find((v) => v.id === selectedVoiceId) || GEMINI_VOICES[0];
  const currentAvatarObj = avatars.find((a) => a.id === selectedAvatarId);
  const currentToneObj = GEMINI_TONES[selectedToneId];
  const currentLanguageObj = VOICE_LANGUAGES_MAP[selectedLanguageId] || VOICE_LANGUAGES_MAP['fr-standard'];

  return (
    <div className="min-h-screen bg-[#101114] text-[#F4F4F5] flex flex-col">
      {/* Header with Tab Navigation */}
      <Header
        apiConfigured={apiConfigured}
        modelName={modelName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        avatarCount={avatars.length}
        maxAvatars={MAX_AVATARS_LIMIT}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6">
            <StatusAlert
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
              type="error"
            />
          </div>
        )}

        {/* TAB 1: STUDIO VOIX OFF */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* LEFT COLUMN: Editor, Main Action CTA, Player, Downloads, History */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Script Editor */}
              <ScriptEditor
                text={text}
                onChange={setText}
                onSelectPreset={handleSelectPreset}
                disabled={isLoading}
              />

              {/* Main Action Button */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading || !text.trim()}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-xl ${
                    isLoading
                      ? 'bg-[#23232C] text-[#C6FF5B] border border-[#C6FF5B]/40 cursor-wait'
                      : !text.trim()
                      ? 'bg-[#1F2026] text-[#71717A] border border-[#2B2B36] opacity-60 cursor-not-allowed'
                      : 'bg-[#C6FF5B] hover:bg-[#bcf54f] text-[#101114] hover:shadow-[0_0_30px_rgba(198,255,91,0.35)] hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="flex items-center gap-1.5 mr-1">
                        <span className="w-1.5 h-4 bg-[#C6FF5B] rounded-full animate-wave-1" />
                        <span className="w-1.5 h-6 bg-[#C6FF5B] rounded-full animate-wave-2" />
                        <span className="w-1.5 h-5 bg-[#C6FF5B] rounded-full animate-wave-3" />
                        <span className="w-1.5 h-3 bg-[#C6FF5B] rounded-full animate-wave-4" />
                      </div>
                      <span>{loadingStepText}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Générer ma voix off</span>
                    </>
                  )}
                </button>

                {!text.trim() && (
                  <p className="text-center text-xs text-[#71717A]">
                    Saisissez un texte ou choisissez un exemple ci-dessus pour lancer la synthèse vocale.
                  </p>
                )}
              </div>

              {/* Result Audio Player */}
              {audioUrl && (
                <div ref={playerRef} className="flex flex-col gap-6 animate-fade-in">
                  <AudioStudioPlayer
                    audioBlob={audioBlob}
                    audioUrl={audioUrl}
                    voiceName={lastGeneratedVoice}
                    toneId={lastGeneratedTone}
                    languageLabel={lastGeneratedLanguageLabel}
                    originalDiction={lastGeneratedOriginalDiction}
                    scriptText={text}
                  />

                  <DownloadPanel
                    wavBuffer={wavBuffer}
                    voiceName={lastGeneratedVoice}
                  />
                </div>
              )}

              {/* Local History Section */}
              <HistorySection
                items={historyItems}
                onLoadScript={handleLoadScript}
                onClearHistory={handleClearHistory}
                disabled={isLoading}
              />
            </div>

            {/* RIGHT COLUMN: Language & Original Diction, Voice catalog, Tone selector, Summary */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky lg:top-28">
              {/* Language & Original Diction Selector */}
              <LanguageSelector
                selectedLanguageId={selectedLanguageId}
                onSelectLanguage={setSelectedLanguageId}
                originalDiction={originalDiction}
                onToggleOriginalDiction={setOriginalDiction}
                disabled={isLoading}
              />

              {/* Voice Selector with Gemini / African & Custom Avatars tabs */}
              <VoiceSelector
                voiceSource={voiceSource}
                onVoiceSourceChange={setVoiceSource}
                selectedVoiceId={selectedVoiceId}
                onSelectVoice={handleSelectVoice}
                selectedLanguageId={selectedLanguageId}
                selectedAvatarId={selectedAvatarId}
                onSelectAvatar={(av) => setSelectedAvatarId(av.id)}
                avatars={avatars}
                onOpenCreateAvatar={handleOpenCreateModal}
                disabled={isLoading}
              />

              {/* Tone Selector */}
              <ToneSelector
                selectedToneId={selectedToneId}
                onSelectTone={setSelectedToneId}
                disabled={isLoading}
              />

              {/* Vocal Configuration Summary Card */}
              <div className="bg-[#14151B] border border-[#23232C] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between text-[#9CA3AF] border-b border-[#23232C] pb-2">
                  <span className="font-semibold text-[#F4F4F5] flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-[#C6FF5B]" /> Configuration active
                  </span>
                  <span className="font-mono text-[11px] text-[#C6FF5B]">
                    {voiceSource === 'gemini'
                      ? currentVoiceObj.region === 'africaine'
                        ? 'Voix Africaine • Gemini'
                        : 'Gemini TTS'
                      : 'Avatar Personnel'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-[#D4D4D8]">
                  <div>
                    <div className="text-[11px] text-[#9CA3AF]">Voix</div>
                    <div className="font-semibold text-xs sm:text-sm text-[#F4F4F5] mt-0.5 truncate">
                      {voiceSource === 'gemini'
                        ? currentVoiceObj.name
                        : currentAvatarObj?.name || 'Aucun avatar'}
                    </div>
                    <div className="text-[10px] text-[#C6FF5B] truncate">
                      {voiceSource === 'gemini'
                        ? currentVoiceObj.originTag || currentVoiceObj.characteristic
                        : 'Voix personnalisée'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#9CA3AF]">Diction</div>
                    <div className="font-semibold text-xs sm:text-sm text-[#F4F4F5] mt-0.5 truncate">
                      {currentLanguageObj.shortLabel}
                    </div>
                    <div className="text-[10px] text-[#C6FF5B] truncate">
                      {originalDiction ? 'Purement originale' : 'Standard'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#9CA3AF]">Intention</div>
                    <div className="font-semibold text-xs sm:text-sm text-[#F4F4F5] mt-0.5 truncate">
                      {currentToneObj.label}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] truncate">
                      {currentToneObj.tagline}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#23232C] flex items-center gap-2 text-[#9CA3AF] text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-[#C6FF5B] shrink-0" />
                  <span>Le texte saisi sera fidèlement respecté sans coupure ni altération.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MES AVATARS VOCAUX */}
        {activeTab === 'avatars' && (
          <AvatarLibrary
            avatars={avatars}
            selectedAvatarId={selectedAvatarId || undefined}
            onSelectAvatar={handleSelectAvatarInStudio}
            onOpenCreateModal={handleOpenCreateModal}
            onEditAvatar={handleOpenEditModal}
            onDeleteAvatar={handleDeleteAvatar}
            cloningConfigured={cloningConfigured}
            maxLimit={MAX_AVATARS_LIMIT}
          />
        )}
      </main>

      {/* Avatar Modal (Create / Edit) */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSuccess={handleAvatarModalSuccess}
        avatarToEdit={avatarToEdit}
        cloningConfigured={cloningConfigured}
        currentCount={avatars.length}
        maxLimit={MAX_AVATARS_LIMIT}
      />

      {/* Footer */}
      <footer className="border-t border-[#23232C] bg-[#14151B] py-6 text-center text-xs text-[#71717A] mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>La voix de la marque • Studio de synthèse vocale et avatars de marque</span>
          <span className="flex items-center gap-1">
            Propulsé par Google Gemini &amp; ElevenLabs
          </span>
        </div>
      </footer>
    </div>
  );
}
