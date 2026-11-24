import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePasswordStrength,
  filterCommitteeTable,
  validateStudentWizardStep,
  type StudentWizardFormState,
} from './adminFormHelpers';
import type { CommitteeMember } from '../types';

const BASE_WIZARD: StudentWizardFormState = {
  nameBn: 'রাফিউল ইসলাম',
  name: 'Rafiul Islam',
  dateOfBirth: '2013-04-10',
  gender: 'Male',
  birthCertificateNo: '20138614500012345',
  boardRegistrationNo: '2026113585',
  address: 'উপসী, নড়িয়া, শরীয়তপুর',
  permanentAddress: 'উপসী, নড়িয়া, শরীয়তপুর',
  guardianName: 'Md. Jahirul Islam',
  guardianNameBn: 'মোঃ জহিরুল ইসলাম',
  guardianPhone: '01711998877',
  guardianOccupation: 'ব্যবসা',
  previousSchool: 'উপসী সরকারি প্রাথমিক বিদ্যালয়',
  previousGpa: '4.5',
  className: 'Class 6',
  section: 'A (পদ্মা)',
  roll: '15',
  group: 'General',
  bloodGroup: 'O+',
  rfidCardId: '',
};

test('validateStudentWizardStep validates required fields across all 5 input steps', () => {
  const existing = [{ className: 'Class 6', section: 'A (পদ্মা)', roll: 1 }];

  assert.equal(validateStudentWizardStep(1, BASE_WIZARD, existing), null);
  assert.ok(validateStudentWizardStep(1, { ...BASE_WIZARD, nameBn: '' }, existing));

  assert.equal(validateStudentWizardStep(2, BASE_WIZARD, existing), null);
  assert.ok(validateStudentWizardStep(2, { ...BASE_WIZARD, birthCertificateNo: '12345' }, existing));

  assert.equal(validateStudentWizardStep(3, BASE_WIZARD, existing), null);
  assert.ok(validateStudentWizardStep(3, { ...BASE_WIZARD, guardianPhone: '1234' }, existing));

  assert.equal(validateStudentWizardStep(4, BASE_WIZARD, existing), null);
  assert.ok(validateStudentWizardStep(4, { ...BASE_WIZARD, previousGpa: '5.5' }, existing));

  assert.equal(validateStudentWizardStep(5, BASE_WIZARD, existing), null);
  assert.ok(validateStudentWizardStep(5, { ...BASE_WIZARD, roll: '1' }, existing));
});

test('evaluatePasswordStrength scores short, basic, medium, and strong passwords accurately', () => {
  assert.equal(evaluatePasswordStrength('12345').valid, false);
  assert.equal(evaluatePasswordStrength('abcdef').score, 1);
  assert.equal(evaluatePasswordStrength('Admin123').score, 2);
  assert.equal(evaluatePasswordStrength('Admin123!').score, 3);
});

test('filterCommitteeTable filters by category & query and sorts by priority or name', () => {
  const sample: CommitteeMember[] = [
    {
      id: 'c2',
      name: 'B Member',
      nameBn: 'মোঃ কামাল',
      role: 'Guardian Rep',
      roleBn: 'অভিভাবক প্রতিনিধি',
      category: 'অভিভাবক প্রতিনিধি',
      tenure: '২০২৫–২০২৭',
      professionBn: 'ব্যবসায়ী',
      educationBn: 'স্নাতক',
      phone: '01711111111',
      photoUrl: '',
      bioBn: '',
      responsibilities: [],
      priorityOrder: 2,
    },
    {
      id: 'c1',
      name: 'A Chairman',
      nameBn: 'আলহাজ্ব আবুল কালাম',
      role: 'Chairman',
      roleBn: 'সভাপতি',
      category: 'সভাপতি ও নেতৃত্ব',
      tenure: '২০২৫–২০২৭',
      professionBn: 'শিক্ষানুরাগী',
      educationBn: 'এম.এ',
      phone: '01722222222',
      photoUrl: '',
      bioBn: '',
      responsibilities: [],
      priorityOrder: 1,
    },
  ];

  const byPriority = filterCommitteeTable(sample, { query: '', category: 'all', sortBy: 'priority' });
  assert.equal(byPriority[0].id, 'c1');

  const onlyGuardian = filterCommitteeTable(sample, {
    query: 'কামাল',
    category: 'অভিভাবক প্রতিনিধি',
    sortBy: 'priority',
  });
  assert.equal(onlyGuardian.length, 1);
  assert.equal(onlyGuardian[0].id, 'c2');
});
