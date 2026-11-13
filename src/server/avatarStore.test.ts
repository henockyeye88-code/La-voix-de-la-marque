import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateConsent,
  validateAudioSample,
  canCreateAvatar,
  MAX_AVATARS_LIMIT,
  saveAvatars,
  readAvatars,
  addAvatar,
  removeAvatar,
  CURRENT_CONSENT_VERSION
} from './avatarStore';

test('validateConsent requires both authorization and processing consent', () => {
  const check1 = validateConsent(false, false);
  assert.equal(check1.isValid, false);
  assert.ok(check1.error?.includes('autorisation'));

  const check2 = validateConsent(true, false);
  assert.equal(check2.isValid, false);
  assert.ok(check2.error?.includes('traitement'));

  const check3 = validateConsent(true, true);
  assert.equal(check3.isValid, true);
  assert.equal(check3.error, undefined);
});

test('validateAudioSample enforces size, duration and MIME constraints', () => {
  // Empty audio
  const emptyCheck = validateAudioSample(0, 10, 'audio/wav');
  assert.equal(emptyCheck.isValid, false);

  // File too big (> 25MB)
  const bigCheck = validateAudioSample(26 * 1024 * 1024, 15, 'audio/wav');
  assert.equal(bigCheck.isValid, false);
  assert.ok(bigCheck.error?.includes('25 Mo'));

  // Duration too short (< 5s)
  const shortCheck = validateAudioSample(50000, 3.2, 'audio/wav');
  assert.equal(shortCheck.isValid, false);
  assert.ok(shortCheck.error?.includes('trop court'));

  // Duration too long (> 300s)
  const longCheck = validateAudioSample(50000, 310, 'audio/wav');
  assert.equal(longCheck.isValid, false);
  assert.ok(longCheck.error?.includes('trop long'));

  // Unsupported MIME type
  const badMime = validateAudioSample(50000, 12, 'application/pdf');
  assert.equal(badMime.isValid, false);
  assert.ok(badMime.error?.includes('Format audio non supporté'));

  // Valid WAV
  const validWav = validateAudioSample(200000, 15.5, 'audio/wav');
  assert.equal(validWav.isValid, true);

  // Valid MP3
  const validMp3 = validateAudioSample(150000, 20.0, 'audio/mp3');
  assert.equal(validMp3.isValid, true);
});

test('Avatar store strictly enforces maximum of 6 avatars', () => {
  const original = readAvatars();

  try {
    // Set 6 dummy avatars
    const dummyList = Array.from({ length: 6 }, (_, i) => ({
      id: `test_avatar_${i}`,
      name: `Voix Test ${i + 1}`,
      provider: 'elevenlabs' as const,
      providerVoiceId: `voice_${i}`,
      status: 'ready' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      consentConfirmedAt: Date.now(),
      consentVersion: CURRENT_CONSENT_VERSION
    }));

    saveAvatars(dummyList);

    const checkFull = canCreateAvatar();
    assert.equal(checkFull.allowed, false);
    assert.equal(checkFull.currentCount, 6);
    assert.equal(checkFull.maxLimit, 6);
    assert.ok(checkFull.error?.includes('limite de 6 avatars'));

    // Attempting to addAvatar should throw
    assert.throws(
      () => {
        addAvatar({
          name: 'Avatar 7 interdit',
          provider: 'elevenlabs',
          providerVoiceId: 'voice_7',
          status: 'ready',
          consentConfirmedAt: Date.now(),
          consentVersion: CURRENT_CONSENT_VERSION
        });
      },
      /limite de 6 avatars/
    );

    // Remove one avatar and verify allowed
    removeAvatar('test_avatar_0');
    const checkAfterRemove = canCreateAvatar();
    assert.equal(checkAfterRemove.allowed, true);
    assert.equal(checkAfterRemove.currentCount, 5);
  } finally {
    // Restore original state
    saveAvatars(original);
  }
});
