import { UserRole, MemoryType, Patient, Memory, MoodLog } from './types';

export const MOCK_PATIENT: Patient = {
  id: 'p1',
  firstName: 'Eleanor',
  lastName: 'Johnson',
  preferredName: 'Ellie',
  dateOfBirth: '1942-05-12',
  diagnosisDate: '2022-11-20',
  dementiaType: "Alzheimer's",
  stage: 'moderate',
  programWeek: 4,
};

export const MOCK_MEMORIES: Memory[] = [
  {
    id: 'm1',
    patientId: 'p1',
    contributorId: 'u2',
    title: 'Thanksgiving Apple Pie',
    description: "Eleanor making her legendary apple pie at the 42 Maple Street kitchen. The smell of cinnamon always brought everyone together.",
    type: MemoryType.PHOTO,
    lifePeriod: 'middle_age',
    emotionTags: ['joyful', 'loving'],
    therapeuticScore: 5,
    assetUrl: 'https://images.unsplash.com/photo-1540339832862-47459980783f?auto=format&fit=crop&q=80&w=800',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'm2',
    patientId: 'p1',
    contributorId: 'u2',
    title: 'Wedding Day - 1965',
    description: "Ellie and Robert outside St. Mary's Church. It was a sun-drenched day in June.",
    type: MemoryType.PHOTO,
    lifePeriod: 'young_adult',
    emotionTags: ['joyful', 'peaceful'],
    therapeuticScore: 5,
    assetUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    createdAt: '2024-01-16T14:30:00Z',
  },
  {
    id: 'm3',
    patientId: 'p1',
    contributorId: 'u3',
    title: 'Favorite Song: Moon River',
    description: "Always makes her smile and sway. Reminds her of late night dances in the living room.",
    type: MemoryType.MUSIC,
    lifePeriod: 'recent',
    emotionTags: ['peaceful', 'loving'],
    therapeuticScore: 4,
    createdAt: '2024-01-18T09:15:00Z',
  }
];

export const MOCK_MOOD_LOGS: MoodLog[] = [
  { id: 'l1', patientId: 'p1', mood: 'happy', timestamp: '2024-04-20T09:00:00Z' },
  { id: 'l2', patientId: 'p1', mood: 'calm', timestamp: '2024-04-20T14:00:00Z' },
  { id: 'l3', patientId: 'p1', mood: 'confused', timestamp: '2024-04-21T10:00:00Z' },
  { id: 'l4', patientId: 'p1', mood: 'happy', timestamp: '2024-04-21T16:00:00Z' },
  { id: 'l5', patientId: 'p1', mood: 'calm', timestamp: '2024-04-22T08:30:00Z' },
];
