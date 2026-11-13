import React, { useState, useRef, useEffect } from 'react';
import { Mic, Check, Play, Square, Loader2, Sparkles, Users, Calendar, Globe } from 'lucide-react';
import { GEMINI_VOICES } from '../constants/voices';
import { VoiceGender, VoiceLanguageId, VoiceOption } from '../types/tts';
import { VoiceAvatar } from '../types/avatar';

type VoiceFilter = 'Toutes' | 'Africaines' | VoiceGender;

interface VoiceSelectorProps {
  voiceSource: 'gemini' | 'avatar';
  onVoiceSourceChange: (source: 'gemini' | 'avatar') => void;
  selectedVoiceId: string;
  onSelectVoice: (voice: VoiceOption) => void;
  selectedLanguageId: VoiceLanguageId;
  selectedAvatarId: string | null;
  onSelectAvatar: (avatar: VoiceAvatar) => void;
  avatars: VoiceAvatar[];
  onOpenCreateAvatar: () => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voiceSource,
  onVoiceSourceChange,
  selectedVoiceId,
  onSelectVoice,
  selectedLanguageId,
  selectedAvatarId,
  onSelectAvatar,
  avatars,
  onOpenCreateAvatar,
  disabled = false
}) => {
  const [activeFilter, setActiveFilter] = useState<VoiceFilter>(() => {
    const initial = GEMINI_VOICES.find((v) => v.id === selectedVoiceId);
    return initial?.region === 'africaine' ? 'Africaines' : 'Toutes';
  });
  const [auditioningVoice, setAuditioningVoice] = useState<string | null>(null);
  const [loadingAudition, setLoadingAudition] = useState<string | null>(null);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const current = GEMINI_VOICES.find((v) => v.id === selectedVoiceId);
    if (!current) return;
    const isVisibleInCurrentFilter =
      activeFilter === 'Toutes' ||
      (activeFilter === 'Africaines' && current.region === 'africaine') ||
      current.gender === activeFilter;
    if (!isVisibleInCurrentFilter) {
      setActiveFilter(current.region === 'africaine' ? 'Africaines' : 'Toutes');
    }
  }, [selectedVoiceId]);

  const africanCount = GEMINI_VOICES.filter((v) => v.region === 'africaine').length;

  const filteredVoices = GEMINI_VOICES.filter((voice) => {
    if (activeFilter === 'Toutes') return true;
    if (activeFilter === 'Africaines') return voice.region === 'africaine';
    return voice.gender === activeFilter;
  });

  const handleAudition = async (e: React.MouseEvent, voice: VoiceOption) => {
    e.stopPropagation();

    if (auditioningVoice === voice.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setAuditioningVoice(null);
      return;
    }

    try {
      setLoadingAudition(voice.id);
      // For international voices, audition in the currently selected language; for African personas, use their native sample unless another African language is explicitly active
      const query =
        voice.region === 'internationale' && selectedLanguageId !== 'fr-standard'
          ? `?lang=${encodeURIComponent(selectedLanguageId)}`
          : '';
      const res = await fetch(`/api/tts/audition/${encodeURIComponent(voice.id)}${query}`);
      const data = await res.json();

      if (data.success && data.audioBase64) {
        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
        }

        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        previewAudioRef.current = audio;

        audio.onended = () => {
          setAuditioningVoice(null);
        };

        await audio.play();
        setAuditioningVoice(voice.id);
      }
    } catch (err) {
      console.error('Audition error:', err);
    } finally {
      setLoadingAudition(null);
    }
  };

  return (
    <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* Top Level Category Tabs: Voix Gemini vs Mes avatars */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#242532] pb-3">
        <div className="flex items-center gap-1 bg-[#14151B] p-1 rounded-xl border border-[#262734]">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onVoiceSourceChange('gemini')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              voiceSource === 'gemini'
                ? 'bg-[#C6FF5B] text-[#101114] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#E4E4E7]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voix Studio</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onVoiceSourceChange('avatar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              voiceSource === 'avatar'
                ? 'bg-[#C6FF5B] text-[#101114] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#E4E4E7]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mes avatars</span>
            {avatars.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  voiceSource === 'avatar' ? 'bg-[#101114] text-[#C6FF5B]' : 'bg-[#232430] text-[#A1A1AA]'
                }`}
              >
                {avatars.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter pills */}
        {voiceSource === 'gemini' && (
          <div className="flex items-center gap-1 bg-[#14151B] p-1 rounded-lg border border-[#262732] text-xs flex-wrap">
            {(['Africaines', 'Toutes', 'Féminin', 'Masculin', 'Neutre'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                disabled={disabled}
                onClick={() => setActiveFilter(filter)}
                className={`px-2 py-0.5 rounded transition font-medium cursor-pointer text-[11px] flex items-center gap-1 ${
                  activeFilter === filter
                    ? 'bg-[#C6FF5B] text-[#101114] font-semibold shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#E4E4E7]'
                }`}
              >
                {filter === 'Africaines' && <Globe className="w-3 h-3" />}
                <span>
                  {filter === 'Africaines'
                    ? `Africaines (${africanCount})`
                    : filter === 'Toutes'
                    ? 'Toutes'
                    : filter === 'Féminin'
                    ? 'Fém.'
                    : filter === 'Masculin'
                    ? 'Masc.'
                    : 'Neutre'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-[#9CA3AF]">
        {voiceSource === 'gemini'
          ? activeFilter === 'Africaines'
            ? 'Voix africaines (Lingala RDC, Yoruba, Swahili, Wolof, Français d’Afrique) avec diction purement originale.'
            : 'Sélectionnez une voix studio ou écoutez un extrait de démonstration.'
          : 'Sélectionnez un de vos avatars vocaux personnalisés pour synthétiser vos textes.'}
      </p>

      {/* Tab Content: GEMINI VOICES & AFRICAN PERSONAS */}
      {voiceSource === 'gemini' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.id;
            const isAuditioning = auditioningVoice === voice.id;
            const isLoadingThis = loadingAudition === voice.id;

            return (
              <div
                key={voice.id}
                onClick={() => !disabled && onSelectVoice(voice)}
                className={`group relative p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#23232D] border-[#C6FF5B] shadow-[0_0_15px_rgba(198,255,91,0.12)] ring-1 ring-[#C6FF5B]/40'
                    : 'bg-[#14151B]/80 border-[#262732] hover:border-[#383948] hover:bg-[#181921]'
                } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-[#F4F4F5] tracking-tight truncate">
                        {voice.name}
                      </span>
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${
                          voice.gender === 'Féminin'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : voice.gender === 'Masculin'
                            ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        }`}
                      >
                        {voice.gender}
                      </span>
                    </div>

                    {voice.originTag && (
                      <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-[#C6FF5B]/10 border border-[#C6FF5B]/25 text-[10px] font-semibold text-[#C6FF5B]">
                        <span>{voice.originTag}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-[#C6FF5B] font-medium mt-1">
                      {voice.characteristic}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleAudition(e, voice)}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isAuditioning
                          ? 'bg-[#C6FF5B] text-[#101114] border-[#C6FF5B]'
                          : 'bg-[#1C1D24] text-[#C6FF5B] border-[#2E2F3A] hover:bg-[#252631]'
                      }`}
                      title={isAuditioning ? "Arrêter l'extrait" : `Écouter un extrait de ${voice.name}`}
                      aria-label={`Écouter un extrait de la voix ${voice.name}`}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6FF5B]" />
                      ) : isAuditioning ? (
                        <Square className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-[#C6FF5B] border-[#C6FF5B] text-[#101114]'
                          : 'border-[#383948] group-hover:border-[#525266]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
                  {voice.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: CUSTOM AVATARS */}
      {voiceSource === 'avatar' && (
        <div className="space-y-3">
          {avatars.length === 0 ? (
            <div className="bg-[#14151B] border border-dashed border-[#2D2E3B] rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#20212C] text-[#C6FF5B] mx-auto flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#F4F4F5]">
                  Aucun avatar personnalisé disponible
                </p>
                <p className="text-[11px] text-[#9CA3AF]">
                  Importez un enregistrement audio autorisé pour créer votre premier profil de voix.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenCreateAvatar}
                className="px-3 py-1.5 rounded-lg bg-[#C6FF5B] text-[#101114] text-xs font-bold transition hover:scale-[1.02] cursor-pointer"
              >
                + Créer mon avatar vocal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {avatars.map((av) => {
                const isSelected = selectedAvatarId === av.id;
                const formattedDate = new Date(av.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short'
                });

                return (
                  <div
                    key={av.id}
                    onClick={() => !disabled && onSelectAvatar(av)}
                    className={`group relative p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#23232D] border-[#C6FF5B] shadow-[0_0_15px_rgba(198,255,91,0.12)] ring-1 ring-[#C6FF5B]/40'
                        : 'bg-[#14151B]/80 border-[#262732] hover:border-[#383948] hover:bg-[#181921]'
                    } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {av.imageUrl ? (
                        <img
                          src={av.imageUrl}
                          alt={av.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#323342] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#272833] to-[#16171E] border border-[#323342] flex items-center justify-center text-[#C6FF5B] shrink-0 font-bold text-xs">
                          {av.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs sm:text-sm text-[#F4F4F5] truncate">
                            {av.name}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-[#C6FF5B] border-[#C6FF5B] text-[#101114]'
                                : 'border-[#383948] group-hover:border-[#525266]'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="text-[10px] text-[#C6FF5B] font-medium mt-0.5">
                          Avatar personnalisé
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] mt-1 flex items-center gap-1 font-mono">
                          <Calendar className="w-2.5 h-2.5" /> {formattedDate}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
