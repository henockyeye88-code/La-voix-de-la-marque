/**
 * Utility functions for text analysis in French voice-over scripts.
 */

export const MAX_SCRIPT_CHARACTERS = 3000;
export const WORDS_PER_MINUTE_FR = 140; // Standard French voice-over speech rate

export function countCharacters(text: string): number {
  return (text || '').length;
}

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  // Match word characters, including French accents and hyphens inside words
  const trimmed = text.trim();
  const words = trimmed.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu);
  return words ? words.length : 0;
}

export function estimateReadingDurationSec(
  wordCount: number,
  wordsPerMinute: number = WORDS_PER_MINUTE_FR
): number {
  if (wordCount <= 0) return 0;
  const minutes = wordCount / wordsPerMinute;
  return Math.max(1, Math.round(minutes * 60));
}

export function formatDurationMMSS(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${paddedMins}:${paddedSecs}`;
}

export function formatDurationHumanFr(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '0 s';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (mins === 0) return `${secs} s`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs < 10 ? '0' : ''}${secs} s`;
}
