import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveVoiceOption,
  resolveLanguageOption,
  resolveToneId,
  buildGeminiTTSConfig,
  STANDARD_TTS_MODEL,
  VOICE_DESIGN_TTS_MODEL
} from './voiceStyleBuilder';

test('resolveVoiceOption resolves African voice profiles and classic Gemini voices', () => {
  const kinshasa = resolveVoiceOption('af-kinshasa');
  assert.equal(kinshasa.id, 'af-kinshasa');
  assert.equal(kinshasa.geminiVoiceName, 'Charon');
  assert.equal(kinshasa.region, 'africaine');
  assert.equal(kinshasa.recommendedLanguageId, 'ln-cd');

  const yoruba = resolveVoiceOption('af-ade');
  assert.equal(yoruba.geminiVoiceName, 'Orus');
  assert.equal(yoruba.recommendedLanguageId, 'yo-ng');

  const swahili = resolveVoiceOption('af-zuri');
  assert.equal(swahili.geminiVoiceName, 'Aoede');
  assert.equal(swahili.recommendedLanguageId, 'sw-ea');

  const classic = resolveVoiceOption('Kore');
  assert.equal(classic.id, 'Kore');
  assert.equal(classic.geminiVoiceName, 'Kore');

  const fallback = resolveVoiceOption('nonexistent-voice');
  assert.equal(fallback.id, 'Kore');
});

test('resolveLanguageOption resolves Lingala, Yoruba, Swahili, and falls back to fr-standard', () => {
  assert.equal(resolveLanguageOption('ln-cd').shortLabel, 'Lingala (RDC)');
  assert.equal(resolveLanguageOption('yo-ng').shortLabel, 'Yoruba');
  assert.equal(resolveLanguageOption('sw-ea').shortLabel, 'Swahili');
  assert.equal(resolveLanguageOption('unknown').id, 'fr-standard');
});

test('buildGeminiTTSConfig builds authentic Lingala RDC diction and selects Voice Design model', () => {
  const config = buildGeminiTTSConfig({
    voiceId: 'af-kinshasa',
    languageId: 'ln-cd',
    toneId: 'narrateur',
    originalDiction: true
  });

  assert.equal(config.geminiVoiceName, 'Charon');
  assert.equal(config.languageOption.id, 'ln-cd');
  assert.equal(config.model, VOICE_DESIGN_TTS_MODEL);
  assert.ok(config.styleInstruction.includes('Kinshasa'));
  assert.ok(config.styleInstruction.includes('Lingala'));
  assert.ok(config.styleInstruction.includes('purely original native pronunciation'));
});

test('buildGeminiTTSConfig builds Yoruba tonal diction even when paired with any Gemini voice', () => {
  const config = buildGeminiTTSConfig({
    voiceId: 'Kore',
    languageId: 'yo-ng',
    toneId: 'calme',
    originalDiction: true
  });

  assert.equal(config.geminiVoiceName, 'Kore');
  assert.equal(config.languageOption.id, 'yo-ng');
  assert.equal(config.model, VOICE_DESIGN_TTS_MODEL);
  assert.ok(config.styleInstruction.includes('three lexical tones'));
  assert.ok(config.styleInstruction.includes('Voix posée'));
});

test('buildGeminiTTSConfig keeps standard lightweight model for standard French voice', () => {
  const config = buildGeminiTTSConfig({
    voiceId: 'Kore',
    languageId: 'fr-standard',
    toneId: 'calme'
  });

  assert.equal(config.geminiVoiceName, 'Kore');
  assert.equal(config.model, STANDARD_TTS_MODEL);
  assert.equal(resolveToneId('invalid'), 'narrateur');
});
