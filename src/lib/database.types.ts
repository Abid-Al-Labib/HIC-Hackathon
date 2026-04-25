export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type UserRole = 'patient' | 'primary_caregiver' | 'family_contributor' | 'doctor' | 'facility_staff'
export type MemoryType = 'photo' | 'video' | 'audio' | 'story' | 'music' | 'sensory' | 'life_event'
export type LifePeriod = 'childhood' | 'young_adult' | 'middle_age' | 'recent'
export type EmotionTag = 'joyful' | 'peaceful' | 'proud' | 'loving' | 'funny' | 'bittersweet'
export type MemoryStatus = 'draft' | 'submitted' | 'approved' | 'flagged' | 'archived'
export type DementiaStage = 'early' | 'moderate' | 'advanced'
export type MoodType = 'happy' | 'calm' | 'confused' | 'upset'
export type AssetType = 'photo' | 'video' | 'audio' | 'document'
export type RelationshipType = 'spouse' | 'child' | 'grandchild' | 'sibling' | 'friend' | 'other'
export type ProgramStatus = 'not_started' | 'in_progress' | 'completed'
export type GeneratedContentType = 'narrative' | 'voice_script' | 'scene_brief' | 'care_summary'
export type GeneratedContentStatus = 'generated' | 'caregiver_reviewed' | 'approved' | 'archived'
export type SessionType = 'music' | 'photo_slideshow' | 'voice_narrative' | 'multi_sensory'
export type FacilityType = 'nursing_home' | 'assisted_living' | 'memory_care' | 'other'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          profile_photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: UserRole
          profile_photo_url?: string | null
        }
        Update: {
          full_name?: string
          role?: UserRole
          profile_photo_url?: string | null
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          preferred_name: string
          date_of_birth: string
          diagnosis_date: string | null
          dementia_type: string | null
          stage: DementiaStage
          primary_caregiver_id: string
          doctor_id: string | null
          facility_id: string | null
          program_week: number
          program_status: ProgramStatus
          program_started_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string | null
          first_name: string
          last_name: string
          preferred_name: string
          date_of_birth: string
          diagnosis_date?: string | null
          dementia_type?: string | null
          stage?: DementiaStage
          primary_caregiver_id: string
          doctor_id?: string | null
          facility_id?: string | null
          program_week?: number
          program_status?: ProgramStatus
          program_started_at?: string | null
        }
        Update: {
          first_name?: string
          last_name?: string
          preferred_name?: string
          date_of_birth?: string
          diagnosis_date?: string | null
          dementia_type?: string | null
          stage?: DementiaStage
          doctor_id?: string | null
          facility_id?: string | null
          program_week?: number
          program_status?: ProgramStatus
          program_started_at?: string | null
        }
      }
      patient_collaborators: {
        Row: {
          id: string
          patient_id: string
          profile_id: string
          role: UserRole
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          patient_id: string
          profile_id: string
          role: UserRole
          accepted_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          role?: UserRole
        }
      }
      memories: {
        Row: {
          id: string
          patient_id: string
          contributor_id: string
          title: string
          description: string | null
          type: MemoryType
          life_period: LifePeriod | null
          emotion_tags: EmotionTag[]
          people_tagged: string[]
          location_name: string | null
          location_lat: number | null
          location_lng: number | null
          sensory_cues: Json
          therapeutic_score: number | null
          status: MemoryStatus
          ai_conversation_log: Json | null
          program_week: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          patient_id: string
          contributor_id: string
          title: string
          description?: string | null
          type: MemoryType
          life_period?: LifePeriod | null
          emotion_tags?: EmotionTag[]
          people_tagged?: string[]
          location_name?: string | null
          location_lat?: number | null
          location_lng?: number | null
          sensory_cues?: Json
          therapeutic_score?: number | null
          status?: MemoryStatus
          ai_conversation_log?: Json | null
          program_week?: number | null
        }
        Update: {
          title?: string
          description?: string | null
          type?: MemoryType
          life_period?: LifePeriod | null
          emotion_tags?: EmotionTag[]
          people_tagged?: string[]
          location_name?: string | null
          sensory_cues?: Json
          therapeutic_score?: number | null
          status?: MemoryStatus
          ai_conversation_log?: Json | null
        }
      }
      memory_assets: {
        Row: {
          id: string
          memory_id: string
          type: AssetType
          file_url: string
          file_size: number | null
          duration_seconds: number | null
          ai_description: string | null
          created_at: string
        }
        Insert: {
          memory_id: string
          type: AssetType
          file_url: string
          file_size?: number | null
          duration_seconds?: number | null
          ai_description?: string | null
        }
        Update: {
          ai_description?: string | null
        }
      }
      person_profiles: {
        Row: {
          id: string
          patient_id: string
          name: string
          relationship: RelationshipType
          photo_url: string | null
          voice_sample_url: string | null
          is_alive: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          patient_id: string
          name: string
          relationship?: RelationshipType
          photo_url?: string | null
          voice_sample_url?: string | null
          is_alive?: boolean
          notes?: string | null
        }
        Update: {
          name?: string
          relationship?: RelationshipType
          photo_url?: string | null
          voice_sample_url?: string | null
          is_alive?: boolean
          notes?: string | null
        }
      }
      music_entries: {
        Row: {
          id: string
          patient_id: string
          song_title: string
          artist: string
          significance: string | null
          life_period: LifePeriod | null
          streaming_link: string | null
          added_by: string | null
          created_at: string
        }
        Insert: {
          patient_id: string
          song_title: string
          artist: string
          significance?: string | null
          life_period?: LifePeriod | null
          streaming_link?: string | null
          added_by?: string | null
        }
        Update: {
          song_title?: string
          artist?: string
          significance?: string | null
          life_period?: LifePeriod | null
          streaming_link?: string | null
        }
      }
      mood_logs: {
        Row: {
          id: string
          patient_id: string
          logged_by: string | null
          mood: MoodType
          notes: string | null
          logged_at: string
        }
        Insert: {
          patient_id: string
          logged_by?: string | null
          mood: MoodType
          notes?: string | null
          logged_at?: string
        }
        Update: {
          notes?: string | null
        }
      }
      invites: {
        Row: {
          id: string
          patient_id: string
          invited_by: string
          invite_email: string
          role: UserRole
          token: string
          status: 'pending' | 'accepted' | 'expired'
          created_at: string
          expires_at: string
        }
        Insert: {
          patient_id: string
          invited_by: string
          invite_email: string
          role?: UserRole
          expires_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted' | 'expired'
        }
      }
      facilities: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          type: FacilityType
          created_at: string
        }
        Insert: {
          name: string
          address?: string | null
          phone?: string | null
          type: FacilityType
        }
        Update: {
          name?: string
          address?: string | null
          phone?: string | null
          type?: FacilityType
        }
      }
      generated_content: {
        Row: {
          id: string
          patient_id: string
          source_memory_ids: string[]
          type: GeneratedContentType
          content: string
          voice_audio_url: string | null
          status: GeneratedContentStatus
          program_week: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          patient_id: string
          source_memory_ids?: string[]
          type: GeneratedContentType
          content: string
          voice_audio_url?: string | null
          status?: GeneratedContentStatus
          program_week?: number | null
        }
        Update: {
          content?: string
          voice_audio_url?: string | null
          status?: GeneratedContentStatus
        }
      }
      therapy_sessions: {
        Row: {
          id: string
          patient_id: string
          program_week: number
          session_type: SessionType
          content_ids: string[]
          scheduled_date: string | null
          completed: boolean
          patient_mood_before: MoodType | null
          patient_mood_after: MoodType | null
          caregiver_notes: string | null
          created_at: string
        }
        Insert: {
          patient_id: string
          program_week: number
          session_type: SessionType
          content_ids?: string[]
          scheduled_date?: string | null
          completed?: boolean
          patient_mood_before?: MoodType | null
          patient_mood_after?: MoodType | null
          caregiver_notes?: string | null
        }
        Update: {
          completed?: boolean
          patient_mood_before?: MoodType | null
          patient_mood_after?: MoodType | null
          caregiver_notes?: string | null
        }
      }
      care_transition_summaries: {
        Row: {
          id: string
          patient_id: string
          generated_by: string
          version: number
          content: Json
          pdf_url: string | null
          shared_with_facility_id: string | null
          shared_at: string | null
          created_at: string
        }
        Insert: {
          patient_id: string
          generated_by: string
          version?: number
          content: Json
          pdf_url?: string | null
          shared_with_facility_id?: string | null
        }
        Update: {
          content?: Json
          pdf_url?: string | null
          shared_with_facility_id?: string | null
          shared_at?: string | null
        }
      }
      clinical_notes: {
        Row: {
          id: string
          patient_id: string
          author_id: string
          note: string
          created_at: string
          updated_at: string
        }
        Insert: {
          patient_id: string
          author_id: string
          note: string
        }
        Update: {
          note?: string
        }
      }
    }
  }
}
