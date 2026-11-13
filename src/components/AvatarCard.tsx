import React, { useState } from 'react';
import { VoiceAvatar } from '../types/avatar';
import { Sparkles, Edit3, Trash2, Play, Check, Calendar, AudioWaveform } from 'lucide-react';

interface AvatarCardProps {
  avatar: VoiceAvatar;
  isSelected?: boolean;
  onSelect: (avatar: VoiceAvatar) => void;
  onEdit: (avatar: VoiceAvatar) => void;
  onDelete: (avatar: VoiceAvatar) => void;
  disabled?: boolean;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({
  avatar,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  disabled = false
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(avatar.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div
      className={`group relative bg-[#1B1B21] border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between gap-4 shadow-xl ${
        isSelected
          ? 'border-[#C6FF5B] ring-1 ring-[#C6FF5B]/40 shadow-[0_0_20px_rgba(198,255,91,0.12)]'
          : 'border-[#2A2A36] hover:border-[#3E4050] hover:bg-[#1E1E26]'
      } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <div>
        {/* Top header: Avatar image, name, badge */}
        <div className="flex items-start gap-3.5">
          {avatar.imageUrl ? (
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="w-14 h-14 rounded-xl object-cover border border-[#32323E] shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#272833] to-[#16171E] border border-[#32323E] flex items-center justify-center text-[#C6FF5B] shrink-0 font-bold text-lg">
              {avatar.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-base text-[#F4F4F5] truncate" title={avatar.name}>
                {avatar.name}
              </h3>
              {isSelected && (
                <span className="w-5 h-5 rounded-full bg-[#C6FF5B] text-[#101114] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#C6FF5B]/10 text-[#C6FF5B] border border-[#C6FF5B]/20">
                <Sparkles className="w-2.5 h-2.5" /> Avatar personnalisé
              </span>
            </div>
          </div>
        </div>

        {/* Metadata info */}
        <div className="mt-4 pt-3 border-t border-[#252530] flex flex-col gap-1.5 text-xs text-[#9CA3AF]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#C6FF5B]" /> Créé le {formattedDate}
            </span>
            <span className="text-[10px] font-mono uppercase bg-[#14151B] px-2 py-0.5 rounded border border-[#252530] text-[#D4D4D8]">
              {avatar.provider === 'elevenlabs' ? 'ElevenLabs Cloned' : avatar.provider}
            </span>
          </div>

          {avatar.audioSampleMeta && (
            <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] pt-1">
              <span className="flex items-center gap-1">
                <AudioWaveform className="w-3 h-3 text-[#C6FF5B]" /> Échantillon : {avatar.audioSampleMeta.durationSec}s
              </span>
              <span>{(avatar.audioSampleMeta.sizeBytes / 1024).toFixed(0)} Ko</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#252530]">
        <button
          type="button"
          onClick={() => onSelect(avatar)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            isSelected
              ? 'bg-[#C6FF5B] text-[#101114] shadow-sm'
              : 'bg-[#252631] hover:bg-[#30313E] text-[#F4F4F5] border border-[#323340] hover:border-[#C6FF5B]/40'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isSelected ? 'Voix active' : 'Utiliser cette voix'}</span>
        </button>

        <button
          type="button"
          onClick={() => onEdit(avatar)}
          className="p-2 rounded-xl bg-[#20212A] hover:bg-[#2B2C38] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#2D2E3A] transition cursor-pointer"
          title="Modifier le nom ou l'image"
          aria-label="Modifier l'avatar"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(avatar)}
          className="p-2 rounded-xl bg-[#20212A] hover:bg-[#2B2C38] text-[#A1A1AA] hover:text-rose-400 border border-[#2D2E3A] transition cursor-pointer"
          title="Supprimer l'avatar"
          aria-label="Supprimer l'avatar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
