import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAvatarInitials,
  resolveStudentPhotoUrl,
  validateAvatarFile,
} from './profileHelpers';
import {
  API_ENDPOINTS,
  buildApiUrl,
  createErrorResponse,
  createSuccessResponse,
} from '../services/apiClient';
import { SCHOOL_INFO } from '../config/school';

test('validateAvatarFile accepts valid JPG/PNG/WEBP files and rejects unsupported types or oversized files', () => {
  assert.equal(validateAvatarFile({ type: 'image/jpeg', size: 120_000 }).valid, true);
  assert.equal(validateAvatarFile({ type: 'image/png', size: 512_000 }).valid, true);
  assert.equal(validateAvatarFile({ type: 'image/webp', size: 250_000 }).valid, true);

  const pdfRes = validateAvatarFile({ type: 'application/pdf', size: 100_000 });
  assert.equal(pdfRes.valid, false);
  assert.ok(pdfRes.errorBn);

  const bigRes = validateAvatarFile({ type: 'image/jpeg', size: 7 * 1024 * 1024 });
  assert.equal(bigRes.valid, false);
  assert.ok(bigRes.errorBn);

  const emptyRes = validateAvatarFile({ type: 'image/png', size: 0 });
  assert.equal(emptyRes.valid, false);
});

test('computeAvatarInitials skips titles like Md. or Dr. and produces clean 2-character initials', () => {
  assert.equal(computeAvatarInitials('Md. Shafiqul Islam'), 'SI');
  assert.equal(computeAvatarInitials('Tahmina Yasmin'), 'TY');
  assert.equal(computeAvatarInitials('Dr. Tanvir Ahmed Khan'), 'TA');
  assert.equal(computeAvatarInitials('', 'আশরাফুল আলম'), 'আশ');
});

test('resolveStudentPhotoUrl returns explicit photoUrl or age- and gender-matched mock portrait', () => {
  assert.equal(
    resolveStudentPhotoUrl({ photoUrl: 'data:image/jpeg;base64,abc', gender: 'Male', className: 'Class 10' }),
    'data:image/jpeg;base64,abc'
  );
  assert.equal(
    resolveStudentPhotoUrl({ gender: 'Male', className: 'Class 10' }),
    SCHOOL_INFO.assets.studentBoySenior
  );
  assert.equal(
    resolveStudentPhotoUrl({ gender: 'Female', className: 'Class 9' }),
    SCHOOL_INFO.assets.studentGirlSenior
  );
  assert.equal(
    resolveStudentPhotoUrl({ gender: 'Male', className: 'Class 6' }),
    SCHOOL_INFO.assets.studentBoyJunior
  );
  assert.equal(
    resolveStudentPhotoUrl({ gender: 'Female', className: 'Class 7' }),
    SCHOOL_INFO.assets.studentGirlJunior
  );
});

test('apiClient builds normalized REST URLs and typed response envelopes', () => {
  assert.equal(
    buildApiUrl(API_ENDPOINTS.profile.update, 'https://api.butphs.edu.bd/'),
    'https://api.butphs.edu.bd/api/v1/profile'
  );
  assert.equal(buildApiUrl('api/v1/students', ''), '/api/v1/students');

  const okResp = createSuccessResponse({ count: 9 }, { total: 9 });
  assert.equal(okResp.ok, true);
  assert.equal(okResp.data?.count, 9);
  assert.equal(okResp.meta.total, 9);

  const errResp = createErrorResponse('UNAUTHORIZED', 'Session expired');
  assert.equal(errResp.ok, false);
  assert.equal(errResp.error?.code, 'UNAUTHORIZED');
});
