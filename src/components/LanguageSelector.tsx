import React from 'react';
import { Globe, Sparkles, Check } from 'lucide-react';
import { VOICE_LANGUAGES } from '../constants/languages';
import { VoiceLanguageId } from '../types/tts';

interface LanguageSelectorProps {
  selectedLanguageId: VoiceLanguageId;
  onSelectLanguage: (languageId: VoiceLanguageId) => void;
  originalDiction: boolean;
  onToggleOriginalDiction: (enabled: boolean) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguageId,
  onSelectLanguage,
  originalDiction,
  onToggleOriginalDiction,
  disabled = false
}) => {
  const activeLanguage =
    VOICE_LANGUAGES.find((l) => l.id === selectedLanguageId) || VOICE_LANGUAGES[0];

  return (
    <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#C6FF5B]" />
          <h2 className="font-semibold text-base sm:text-lg text-[#F4F4F5]">
            Langue &amp; Diction originale
          </h2>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={originalDiction}
          disabled={disabled}
          onClick={() => onToggleOriginalDiction(!originalDiction)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
            originalDiction
              ? 'bg-[#C6FF5B]/15 border-[#C6FF5B]/40 text-[#C6FF5B]'
              : 'bg-[#14151B] border-[#2C2D3A] text-[#9CA3AF]'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          title="Activer le respect strict de la diction tonale et phonétique originale"
        >
          <Sparkles className="w-3 h-3" />
          <span>Diction purement originale</span>
          <span
            className={`w-2 h-2 rounded-full ${
              originalDiction ? 'bg-[#C6FF5B]' : 'bg-[#525260]'
            }`}
          />
        </button>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
        {VOICE_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguageId === lang.id;
          const isAfrican = lang.id !== 'fr-standard';

          return (
            <button
              key={lang.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectLanguage(lang.id)}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                lang.id === 'fr-af' ? 'col-span-2 sm:col-span-3 lg:col-span-2' : ''
              } ${
                isSelected
                  ? 'bg-[#24252E] border-[#C6FF5B] ring-1 ring-[#C6FF5B]/40 shadow-[0_0_15px_rgba(198,255,91,0.1)]'
                  : 'bg-[#14151B]/80 border-[#262732] hover:border-[#383948] hover:bg-[#181922]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-semibold text-xs text-[#F4F4F5] truncate">
                  {lang.label}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-[#C6FF5B] text-[#101114] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-[10px] font-medium truncate ${
                    isAfrican ? 'text-[#C6FF5B]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {lang.regionLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Diction Explanation */}
      <div className="p-3 rounded-xl bg-[#14151B] border border-[#242530] text-[11px] text-[#A1A1AA] leading-relaxed">
        <span className="font-semibold text-[#E4E4E7]">{activeLanguage.label} : </span>
        {activeLanguage.dictionDetail}
      </div>
    </div>
  );
};
