import React, { useState } from 'react';
import { VoiceAvatar } from '../types/avatar';
import { AvatarCard } from './AvatarCard';
import { Plus, Users, AlertTriangle, Key, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

interface AvatarLibraryProps {
  avatars: VoiceAvatar[];
  selectedAvatarId?: string;
  onSelectAvatar: (avatar: VoiceAvatar) => void;
  onOpenCreateModal: () => void;
  onEditAvatar: (avatar: VoiceAvatar) => void;
  onDeleteAvatar: (avatar: VoiceAvatar) => void;
  cloningConfigured: boolean;
  maxLimit: number;
}

export const AvatarLibrary: React.FC<AvatarLibraryProps> = ({
  avatars,
  selectedAvatarId,
  onSelectAvatar,
  onOpenCreateModal,
  onEditAvatar,
  onDeleteAvatar,
  cloningConfigured,
  maxLimit = 6
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<VoiceAvatar | null>(null);
  const isLimitReached = avatars.length >= maxLimit;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#23232C] border border-[#32323E] flex items-center justify-center text-[#C6FF5B]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F4F5]">
                Mes avatars vocaux
              </h1>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-0.5">
                Créez votre bibliothèque de voix personnalisées pour vos contenus de marque.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {/* Dynamic counter: X/6 avatars utilisés */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14151B] border border-[#2B2B38] text-xs">
              <span className="font-semibold text-[#F4F4F5]">
                {avatars.length}/{maxLimit} avatars utilisés
              </span>
              <div className="w-16 h-1.5 bg-[#252532] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isLimitReached ? 'bg-rose-500' : 'bg-[#C6FF5B]'
                  }`}
                  style={{ width: `${(avatars.length / maxLimit) * 100}%` }}
                />
              </div>
            </div>

            {/* Provider status badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14151B] border border-[#2B2B38] text-xs text-[#9CA3AF]">
              <span
                className={`w-2 h-2 rounded-full ${
                  cloningConfigured ? 'bg-[#C6FF5B]' : 'bg-amber-400'
                }`}
              />
              <span className="font-medium text-[#E4E4E7]">
                Moteur de clonage : {cloningConfigured ? 'ElevenLabs connecté' : 'En attente de clé'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Creation Button */}
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateModal}
            disabled={isLimitReached}
            className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
              isLimitReached
                ? 'bg-[#23232C] text-[#71717A] border border-[#2F303D] opacity-60 cursor-not-allowed'
                : 'bg-[#C6FF5B] hover:bg-[#bbf74f] text-[#101114] shadow-[0_0_25px_rgba(198,255,91,0.25)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Créer un avatar vocal</span>
          </button>

          {isLimitReached && (
            <p className="text-xs text-rose-400 font-medium max-w-xs text-left md:text-right leading-tight">
              Vous avez atteint la limite de 6 avatars. Supprimez un avatar existant pour en créer un nouveau.
            </p>
          )}
        </div>
      </div>

      {/* Provider Info Banner if key is missing */}
      {!cloningConfigured && (
        <div className="p-5 rounded-2xl bg-[#1D1B17] border border-amber-500/30 flex items-start gap-3.5 text-xs text-amber-200">
          <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-300 text-sm">
              Configuration du moteur de clonage vocal (ElevenLabs)
            </h3>
            <p className="text-amber-200/90 leading-relaxed">
              Pour cloner vos propres voix à partir d'échantillons audio, configurez la clé d'API officielle de votre fournisseur de clonage dans les secrets de l'environnement : <code className="bg-[#14151B] px-1.5 py-0.5 rounded text-amber-300 font-mono">ELEVENLABS_API_KEY</code>.
              Les voix préconstruites Gemini TTS du Studio restent quant à elles 100% opérationnelles sans clé supplémentaire.
            </p>
          </div>
        </div>
      )}

      {/* Avatar Cards Grid */}
      {avatars.length === 0 ? (
        /* Empty State */
        <div className="bg-[#1B1B21] border border-[#2A2A36] rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#23232D] border border-[#323340] flex items-center justify-center text-[#C6FF5B]">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-bold text-[#F4F4F5]">
              Aucun avatar vocal pour le moment
            </h3>
            <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
              Importez un enregistrement audio autorisé de quelques secondes pour créer votre premier profil vocal de marque.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="mt-2 px-5 py-3 rounded-xl bg-[#C6FF5B] hover:bg-[#bcf74e] text-[#101114] font-bold text-xs transition shadow-[0_0_20px_rgba(198,255,91,0.2)] hover:scale-[1.02] cursor-pointer"
          >
            + Créer mon premier avatar vocal
          </button>
        </div>
      ) : (
        /* 3 columns desktop, 2 tablet, 1 mobile */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {avatars.map((avatar) => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              isSelected={selectedAvatarId === avatar.id}
              onSelect={onSelectAvatar}
              onEdit={onEditAvatar}
              onDelete={(av) => setDeleteConfirmation(av)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1B1B21] border border-[#2D2E3B] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#F4F4F5]">
                  Supprimer l'avatar « {deleteConfirmation.name} » ?
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Cette action est irréversible. Le profil vocal sera également supprimé chez le fournisseur vocal distant et libérera un emplacement dans votre quota.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-xl bg-[#232430] hover:bg-[#2C2D3B] text-xs font-semibold text-[#E4E4E7] transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const toDelete = deleteConfirmation;
                  setDeleteConfirmation(null);
                  onDeleteAvatar(toDelete);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-lg cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
