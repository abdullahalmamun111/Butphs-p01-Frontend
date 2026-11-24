import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INSTITUTION_STARS,
  filterInstitutionStars,
} from './institutionStars.ts';

test('INSTITUTION_STARS contains at least 8 notable alumni with 4 featured on homepage', () => {
  assert.ok(INSTITUTION_STARS.length >= 8);
  const featured = INSTITUTION_STARS.filter((s) => s.featured);
  assert.equal(featured.length, 4);
  for (const star of INSTITUTION_STARS) {
    assert.ok(star.nameBn.length > 0);
    assert.ok(star.sscBatch.length === 4);
    assert.ok(star.currentPositionBn.length > 0);
    assert.ok(star.organizationBn.length > 0);
    assert.ok(star.photoUrl.startsWith('/src/assets/images/'));
  }
});

test('filterInstitutionStars filters accurately by category and search query', () => {
  const medical = filterInstitutionStars(INSTITUTION_STARS, 'চিকিৎসা ও গবেষণা', '');
  assert.equal(medical.length, 2);
  assert.ok(medical.every((s) => s.fieldCategory === 'চিকিৎসা ও গবেষণা'));

  const byBatch = filterInstitutionStars(INSTITUTION_STARS, 'ALL', '2014');
  assert.equal(byBatch.length, 1);
  assert.equal(byBatch[0].nameEn, 'Engr. Farzana Yasmin Mim');

  const byOrg = filterInstitutionStars(INSTITUTION_STARS, 'ALL', 'ঢাকা বিশ্ববিদ্যালয়');
  assert.equal(byOrg.length, 2);

  const empty = filterInstitutionStars(INSTITUTION_STARS, 'প্রশাসন ও ব্যাংকিং', 'nonexistent-xyz');
  assert.equal(empty.length, 0);
});
