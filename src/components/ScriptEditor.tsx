import React, { useState } from 'react';
import { Clipboard, Trash2, Clock, FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { MAX_SCRIPT_CHARACTERS, countCharacters, countWords, estimateReadingDurationSec, formatDurationHumanFr } from '../utils/textStats';
import { SCRIPT_PRESETS } from '../constants/presets';
import { ScriptPreset, ToneId } from '../types/tts';

interface ScriptEditorProps {
  text: string;
  onChange: (value: string) => void;
  onSelectPreset?: (preset: ScriptPreset) => void;
  disabled?: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  text,
  onChange,
  onSelectPreset,
  disabled = false
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const charCount = countCharacters(text);
  const wordCount = countWords(text);
  const estSeconds = estimateReadingDurationSec(wordCount);
  const isOverLimit = charCount > MAX_SCRIPT_CHARACTERS;
  const percentage = Math.min(100, Math.round((charCount / MAX_SCRIPT_CHARACTERS) * 100));

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  const handlePaste = async () => {
    if (disabled) return;
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
          onChange(clipboardText);
          setCopyFeedback('Collé avec succès !');
          setTimeout(() => setCopyFeedback(null), 2000);
        }
      } else {
        setCopyFeedback('Presse-papiers inaccessible');
        setTimeout(() => setCopyFeedback(null), 2500);
      }
    } catch (err) {
      setCopyFeedback('Autorisation presse-papiers requise');
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  return (
    <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
      {/* Top action bar: Title & quick actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#C6FF5B]" />
          <h2 className="font-semibold text-base sm:text-lg text-[#F4F4F5]">
            Script à convertir
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {copyFeedback && (
            <span className="text-xs text-[#C6FF5B] animate-fade-in font-medium">
              {copyFeedback}
            </span>
          )}
          <button
            type="button"
            onClick={handlePaste}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#23232C] hover:bg-[#2C2C38] text-[#E4E4E7] border border-[#32323E] transition disabled:opacity-50 cursor-pointer"
            title="Coller le texte du presse-papiers"
          >
            <Clipboard className="w-3.5 h-3.5 text-[#C6FF5B]" />
            <span>Coller</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || !text}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#23232C] hover:bg-[#2C2C38] text-[#9CA3AF] hover:text-rose-400 border border-[#32323E] transition disabled:opacity-40 cursor-pointer"
            title="Effacer le texte"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        </div>
      </div>

      {/* Preset script suggestions */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-[#9CA3AF] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C6FF5B]" /> Exemples :
        </span>
        {SCRIPT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPreset && onSelectPreset(preset)}
            className="px-2.5 py-1 rounded-md bg-[#23232C] hover:bg-[#2D2D3A] text-[#D4D4D8] hover:text-[#C6FF5B] border border-[#2D2D3A] hover:border-[#C6FF5B]/40 transition text-xs font-medium cursor-pointer"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Collez votre texte ici et donnez-lui une voix…"
          rows={7}
          className={`w-full bg-[#14151B] text-[#F4F4F5] placeholder-[#6B7280] rounded-xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed border transition focus:outline-none resize-y min-h-[160px] font-sans ${
            isOverLimit
              ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
              : 'border-[#2A2A36] focus:border-[#C6FF5B] focus:ring-1 focus:ring-[#C6FF5B]/30'
          }`}
        />
        {/* Subtle character limit bar underneath */}
        <div className="w-full h-1 bg-[#23232C] rounded-full overflow-hidden mt-1.5">
          <div
            className={`h-full transition-all duration-300 ${
              isOverLimit ? 'bg-rose-500' : percentage > 85 ? 'bg-amber-400' : 'bg-[#C6FF5B]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Live metrics footer */}
      <div className="flex items-center justify-between text-xs text-[#9CA3AF] flex-wrap gap-2 pt-1 border-t border-[#23232C]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-[#E4E4E7]">
            <FileText className="w-3.5 h-3.5 text-[#C6FF5B]" />
            {wordCount} {wordCount > 1 ? 'mots' : 'mot'}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#E4E4E7]">
            <Clock className="w-3.5 h-3.5 text-[#C6FF5B]" />
            Durée estimée : ~{formatDurationHumanFr(estSeconds)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOverLimit && (
            <span className="text-rose-400 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Limite dépassée
            </span>
          )}
          <span
            className={`font-mono text-xs ${
              isOverLimit ? 'text-rose-400 font-bold' : 'text-[#A1A1AA]'
            }`}
          >
            {charCount.toLocaleString('fr-FR')} / {MAX_SCRIPT_CHARACTERS.toLocaleString('fr-FR')} caractères
          </span>
        </div>
      </div>
    </div>
  );
};
