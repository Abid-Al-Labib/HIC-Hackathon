/**
 * MemoryBridge Types
 */

export enum UserRole {
  PATIENT = 'patient',
  PRIMARY_CAREGIVER = 'primary_caregiver',
  FAMILY_CONTRIBUTOR = 'family_contributor',
  DOCTOR = 'doctor',
  FACILITY_STAFF = 'facility_staff'
}

export enum MemoryType {
  PHOTO = 'photo',
  VIDEO = 'video',
  AUDIO = 'audio',
  STORY = 'story',
  MUSIC = 'music',
  SENSORY = 'sensory',
  LIFE_EVENT = 'life_event'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePhoto?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  diagnosisDate: string;
  dementiaType: string;
  stage: 'early' | 'moderate' | 'advanced';
  programWeek: number;
}

export interface Memory {
  id: string;
  patientId: string;
  contributorId: string;
  title: string;
  description: string;
  type: MemoryType;
  lifePeriod: 'childhood' | 'young_adult' | 'middle_age' | 'recent';
  emotionTags: string[];
  therapeuticScore: number;
  assetUrl?: string;
  createdAt: string;
}

export interface MoodLog {
  id: string;
  patientId: string;
  mood: 'happy' | 'calm' | 'confused' | 'upset';
  timestamp: string;
}
