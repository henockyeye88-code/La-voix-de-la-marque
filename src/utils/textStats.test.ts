import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countCharacters,
  countWords,
  estimateReadingDurationSec,
  formatDurationMMSS,
  formatDurationHumanFr
} from './textStats';

test('countCharacters correctly handles empty, accents and long text', () => {
  assert.equal(countCharacters(''), 0);
  assert.equal(countCharacters('Bonjour le monde !'), 18);
  assert.equal(countCharacters('Élégance & Précision'), 20);
});

test('countWords accurately tokenizes French text with apostrophes and hyphens', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   '), 0);
  assert.equal(countWords('Un spot publicitaire moderne'), 4);
  assert.equal(countWords("L'avenir appartient à ceux qui innovent."), 6);
  assert.equal(countWords('Notre savoir-faire d’artisanat d’art.'), 4);
});

test('estimateReadingDurationSec calculates French voice-over cadence (140 wpm)', () => {
  assert.equal(estimateReadingDurationSec(0), 0);
  // 140 words = 60s
  assert.equal(estimateReadingDurationSec(140), 60);
  // 70 words = 30s
  assert.equal(estimateReadingDurationSec(70), 30);
  // 35 words = 15s
  assert.equal(estimateReadingDurationSec(35), 15);
});

test('formatDurationMMSS formats mm:ss correctly', () => {
  assert.equal(formatDurationMMSS(0), '00:00');
  assert.equal(formatDurationMMSS(9), '00:09');
  assert.equal(formatDurationMMSS(65), '01:05');
  assert.equal(formatDurationMMSS(120), '02:00');
});

test('formatDurationHumanFr formats human readable French strings', () => {
  assert.equal(formatDurationHumanFr(0), '0 s');
  assert.equal(formatDurationHumanFr(45), '45 s');
  assert.equal(formatDurationHumanFr(60), '1 min');
  assert.equal(formatDurationHumanFr(75), '1 min 15 s');
});
