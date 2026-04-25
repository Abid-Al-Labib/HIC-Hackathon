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

export type Database = {
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          role?: UserRole
          profile_photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
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
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          type: FacilityType
          created_at?: string
        }
        Update: {
          name?: string
          address?: string | null
          phone?: string | null
          type?: FacilityType
        }
        Relationships: []
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
          id?: string
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
          created_at?: string
          updated_at?: string
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
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "patients_primary_caregiver_id_fkey"; columns: ["primary_caregiver_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "patients_doctor_id_fkey"; columns: ["doctor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "patients_facility_id_fkey"; columns: ["facility_id"]; isOneToOne: false; referencedRelation: "facilities"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          profile_id: string
          role: UserRole
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          role?: UserRole
        }
        Relationships: [
          { foreignKeyName: "patient_collaborators_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] },
          { foreignKeyName: "patient_collaborators_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
          id?: string
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
          created_at?: string
          updated_at?: string
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
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "memories_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] },
          { foreignKeyName: "memories_contributor_id_fkey"; columns: ["contributor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
          id?: string
          memory_id: string
          type: AssetType
          file_url: string
          file_size?: number | null
          duration_seconds?: number | null
          ai_description?: string | null
          created_at?: string
        }
        Update: {
          ai_description?: string | null
        }
        Relationships: [
          { foreignKeyName: "memory_assets_memory_id_fkey"; columns: ["memory_id"]; isOneToOne: false; referencedRelation: "memories"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          name: string
          relationship?: RelationshipType
          photo_url?: string | null
          voice_sample_url?: string | null
          is_alive?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          relationship?: RelationshipType
          photo_url?: string | null
          voice_sample_url?: string | null
          is_alive?: boolean
          notes?: string | null
        }
        Relationships: [
          { foreignKeyName: "person_profiles_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          song_title: string
          artist: string
          significance?: string | null
          life_period?: LifePeriod | null
          streaming_link?: string | null
          added_by?: string | null
          created_at?: string
        }
        Update: {
          song_title?: string
          artist?: string
          significance?: string | null
          life_period?: LifePeriod | null
          streaming_link?: string | null
        }
        Relationships: [
          { foreignKeyName: "music_entries_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          logged_by?: string | null
          mood: MoodType
          notes?: string | null
          logged_at?: string
        }
        Update: {
          notes?: string | null
        }
        Relationships: [
          { foreignKeyName: "mood_logs_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          invited_by: string
          invite_email: string
          role?: UserRole
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          created_at?: string
          expires_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted' | 'expired'
        }
        Relationships: [
          { foreignKeyName: "invites_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] },
          { foreignKeyName: "invites_invited_by_fkey"; columns: ["invited_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          source_memory_ids?: string[]
          type: GeneratedContentType
          content: string
          voice_audio_url?: string | null
          status?: GeneratedContentStatus
          program_week?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          voice_audio_url?: string | null
          status?: GeneratedContentStatus
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "generated_content_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          program_week: number
          session_type: SessionType
          content_ids?: string[]
          scheduled_date?: string | null
          completed?: boolean
          patient_mood_before?: MoodType | null
          patient_mood_after?: MoodType | null
          caregiver_notes?: string | null
          created_at?: string
        }
        Update: {
          completed?: boolean
          patient_mood_before?: MoodType | null
          patient_mood_after?: MoodType | null
          caregiver_notes?: string | null
        }
        Relationships: [
          { foreignKeyName: "therapy_sessions_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          generated_by: string
          version?: number
          content: Json
          pdf_url?: string | null
          shared_with_facility_id?: string | null
          created_at?: string
        }
        Update: {
          content?: Json
          pdf_url?: string | null
          shared_with_facility_id?: string | null
          shared_at?: string | null
        }
        Relationships: [
          { foreignKeyName: "care_transition_summaries_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] },
          { foreignKeyName: "care_transition_summaries_generated_by_fkey"; columns: ["generated_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
          id?: string
          patient_id: string
          author_id: string
          note: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          note?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "clinical_notes_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: false; referencedRelation: "patients"; referencedColumns: ["id"] },
          { foreignKeyName: "clinical_notes_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      memory_type: MemoryType
      life_period: LifePeriod
      emotion_tag: EmotionTag
      memory_status: MemoryStatus
      dementia_stage: DementiaStage
      mood_type: MoodType
      asset_type: AssetType
      relationship_type: RelationshipType
    }
    CompositeTypes: Record<string, never>
  }
}
