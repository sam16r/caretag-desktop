export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_sessions: {
        Row: {
          created_at: string
          doctor_id: string
          ended_at: string | null
          id: string
          notes: string | null
          patient_id: string
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_waitlist: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          notified_at: string | null
          patient_id: string
          preferred_date: string | null
          preferred_time_slot: string | null
          priority: number
          reason: string | null
          status: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          notified_at?: string | null
          patient_id: string
          preferred_date?: string | null
          preferred_time_slot?: string | null
          priority?: number
          reason?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          notified_at?: string | null
          patient_id?: string
          preferred_date?: string | null
          preferred_time_slot?: string | null
          priority?: number
          reason?: string | null
          status?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string
          doctor_id: string
          duration_minutes: number
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clinics: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          settings: Json | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      diagnostic_reports: {
        Row: {
          branch_id: string | null
          conclusion: string | null
          created_at: string
          delivered_at: string | null
          description: string | null
          file_type: string | null
          file_url: string | null
          finalized_at: string | null
          finalized_by: string | null
          findings: string | null
          id: string
          organization_id: string
          patient_id: string
          referring_doctor_id: string | null
          report_category: string | null
          report_type: string
          result_values: Json | null
          status: string
          template_data: Json | null
          template_id: string | null
          test_date: string | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          branch_id?: string | null
          conclusion?: string | null
          created_at?: string
          delivered_at?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          findings?: string | null
          id?: string
          organization_id: string
          patient_id: string
          referring_doctor_id?: string | null
          report_category?: string | null
          report_type: string
          result_values?: Json | null
          status?: string
          template_data?: Json | null
          template_id?: string | null
          test_date?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          branch_id?: string | null
          conclusion?: string | null
          created_at?: string
          delivered_at?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          findings?: string | null
          id?: string
          organization_id?: string
          patient_id?: string
          referring_doctor_id?: string | null
          report_category?: string | null
          report_type?: string
          result_values?: Json | null
          status?: string
          template_data?: Json | null
          template_id?: string | null
          test_date?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_reports_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "org_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_records: {
        Row: {
          actions_taken: string[] | null
          created_at: string
          description: string
          doctor_id: string | null
          id: string
          outcome: string | null
          patient_id: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["emergency_severity"]
          updated_at: string
          vitals_snapshot: Json | null
        }
        Insert: {
          actions_taken?: string[] | null
          created_at?: string
          description: string
          doctor_id?: string | null
          id?: string
          outcome?: string | null
          patient_id: string
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["emergency_severity"]
          updated_at?: string
          vitals_snapshot?: Json | null
        }
        Update: {
          actions_taken?: string[] | null
          created_at?: string
          description?: string
          doctor_id?: string | null
          id?: string
          outcome?: string | null
          patient_id?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["emergency_severity"]
          updated_at?: string
          vitals_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          appointment_id: string | null
          categories: Json | null
          comment: string | null
          created_at: string
          doctor_id: string
          id: string
          is_anonymous: boolean
          patient_id: string
          rating: number
        }
        Insert: {
          appointment_id?: string | null
          categories?: Json | null
          comment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          is_anonymous?: boolean
          patient_id: string
          rating: number
        }
        Update: {
          appointment_id?: string | null
          categories?: Json | null
          comment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          is_anonymous?: boolean
          patient_id?: string
          rating?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          cost_per_unit: number | null
          created_at: string
          expiry_date: string | null
          id: string
          location: string | null
          min_stock_level: number
          name: string
          notes: string | null
          quantity: number
          sku: string | null
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          cost_per_unit?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          location?: string | null
          min_stock_level?: number
          name: string
          notes?: string | null
          quantity?: number
          sku?: string | null
          supplier?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          location?: string | null
          min_stock_level?: number
          name?: string
          notes?: string | null
          quantity?: number
          sku?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          appointment_id: string | null
          created_at: string
          discount_amount: number
          doctor_id: string
          due_date: string | null
          id: string
          invoice_number: string
          items: Json
          notes: string | null
          paid_at: string | null
          patient_id: string
          payment_method: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          discount_amount?: number
          doctor_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          items?: Json
          notes?: string | null
          paid_at?: string | null
          patient_id: string
          payment_method?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          discount_amount?: number
          doctor_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json
          notes?: string | null
          paid_at?: string | null
          patient_id?: string
          payment_method?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          reference_max: number | null
          reference_min: number | null
          result_unit: string | null
          result_value: number | null
          status: string
          test_category: string
          test_name: string
          tested_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          reference_max?: number | null
          reference_min?: number | null
          result_unit?: string | null
          result_value?: number | null
          status?: string
          test_category: string
          test_name: string
          tested_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reference_max?: number | null
          reference_min?: number | null
          result_unit?: string | null
          result_value?: number | null
          status?: string
          test_category?: string
          test_name?: string
          tested_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          attachments: string[] | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          record_type: string
          symptoms: string[] | null
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          record_type: string
          symptoms?: string[] | null
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          record_type?: string
          symptoms?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          patient_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          patient_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          patient_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      org_branches: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          is_main_branch: boolean
          manager_id: string | null
          name: string
          organization_id: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_main_branch?: boolean
          manager_id?: string | null
          name: string
          organization_id: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_main_branch?: boolean
          manager_id?: string | null
          name?: string
          organization_id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          is_active: boolean
          joined_at: string
          organization_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "org_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          accreditation_number: string | null
          accreditation_type: string | null
          address: string
          city: string
          clinical_establishment_license_url: string | null
          created_at: string
          departments: string[] | null
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean
          letterhead_url: string | null
          logo_url: string | null
          name: string
          num_beds: number | null
          owner_id: string
          owner_id_proof_url: string | null
          phone: string | null
          pincode: string | null
          registration_certificate_url: string | null
          registration_number: string | null
          state: string | null
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["org_verification_status"]
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          accreditation_number?: string | null
          accreditation_type?: string | null
          address: string
          city: string
          clinical_establishment_license_url?: string | null
          created_at?: string
          departments?: string[] | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          letterhead_url?: string | null
          logo_url?: string | null
          name: string
          num_beds?: number | null
          owner_id: string
          owner_id_proof_url?: string | null
          phone?: string | null
          pincode?: string | null
          registration_certificate_url?: string | null
          registration_number?: string | null
          state?: string | null
          type: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["org_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          accreditation_number?: string | null
          accreditation_type?: string | null
          address?: string
          city?: string
          clinical_establishment_license_url?: string | null
          created_at?: string
          departments?: string[] | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          letterhead_url?: string | null
          logo_url?: string | null
          name?: string
          num_beds?: number | null
          owner_id?: string
          owner_id_proof_url?: string | null
          phone?: string | null
          pincode?: string | null
          registration_certificate_url?: string | null
          registration_number?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["org_verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          avatar_url: string | null
          blood_group: string | null
          caretag_id: string
          chronic_conditions: string[] | null
          created_at: string
          current_medications: string[] | null
          date_of_birth: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string
          id: string
          insurance_id: string | null
          insurance_provider: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          blood_group?: string | null
          caretag_id: string
          chronic_conditions?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          date_of_birth: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          gender: string
          id?: string
          insurance_id?: string | null
          insurance_provider?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          blood_group?: string | null
          caretag_id?: string
          chronic_conditions?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          date_of_birth?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string
          id?: string
          insurance_id?: string | null
          insurance_provider?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prescription_templates: {
        Row: {
          created_at: string
          diagnosis: string | null
          doctor_id: string
          id: string
          is_favorite: boolean
          medications: Json
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          id?: string
          is_favorite?: boolean
          medications?: Json
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          is_favorite?: boolean
          medications?: Json
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          diagnosis: string | null
          doctor_id: string
          id: string
          last_refill_date: string | null
          max_refills: number | null
          medications: Json
          next_refill_reminder: string | null
          notes: string | null
          patient_id: string
          refill_count: number | null
          status: Database["public"]["Enums"]["prescription_status"]
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          id?: string
          last_refill_date?: string | null
          max_refills?: number | null
          medications?: Json
          next_refill_reminder?: string | null
          notes?: string | null
          patient_id: string
          refill_count?: number | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          last_refill_date?: string | null
          max_refills?: number | null
          medications?: Json
          next_refill_reminder?: string | null
          notes?: string | null
          patient_id?: string
          refill_count?: number | null
          status?: Database["public"]["Enums"]["prescription_status"]
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          clinic_address: string | null
          clinic_name: string | null
          consultation_type: string | null
          created_at: string
          degree_certificate_url: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          id_proof_url: string | null
          languages_spoken: string[] | null
          license_number: string | null
          medical_council_number: string | null
          mobile_number: string | null
          phone: string | null
          primary_qualification: string | null
          professional_photo_url: string | null
          registering_authority: string | null
          registration_year: number | null
          specialization: string | null
          state: string | null
          updated_at: string
          verification_status: string | null
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          consultation_type?: string | null
          created_at?: string
          degree_certificate_url?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          id_proof_url?: string | null
          languages_spoken?: string[] | null
          license_number?: string | null
          medical_council_number?: string | null
          mobile_number?: string | null
          phone?: string | null
          primary_qualification?: string | null
          professional_photo_url?: string | null
          registering_authority?: string | null
          registration_year?: number | null
          specialization?: string | null
          state?: string | null
          updated_at?: string
          verification_status?: string | null
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_name?: string | null
          consultation_type?: string | null
          created_at?: string
          degree_certificate_url?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          id_proof_url?: string | null
          languages_spoken?: string[] | null
          license_number?: string | null
          medical_council_number?: string | null
          mobile_number?: string | null
          phone?: string | null
          primary_qualification?: string | null
          professional_photo_url?: string | null
          registering_authority?: string | null
          registration_year?: number | null
          specialization?: string | null
          state?: string | null
          updated_at?: string
          verification_status?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          appointment_date: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          priority: string
          reason: string
          referring_doctor_id: string
          specialist_name: string
          specialist_type: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          priority?: string
          reason: string
          referring_doctor_id: string
          specialist_name: string
          specialist_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          priority?: string
          reason?: string
          referring_doctor_id?: string
          specialist_name?: string
          specialist_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          fields: Json
          footer_template: string | null
          header_template: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          organization_id: string | null
          report_type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          fields?: Json
          footer_template?: string | null
          header_template?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          organization_id?: string | null
          report_type: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          fields?: Json
          footer_template?: string | null
          header_template?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          organization_id?: string | null
          report_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          break_end: string | null
          break_start: string | null
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_available: boolean
          max_appointments: number | null
          start_time: string
          updated_at: string
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_available?: boolean
          max_appointments?: number | null
          start_time: string
          updated_at?: string
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_available?: boolean
          max_appointments?: number | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          heart_rate: number | null
          height: number | null
          id: string
          patient_id: string
          recorded_at: string
          respiratory_rate: number | null
          source: string | null
          spo2: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          heart_rate?: number | null
          height?: number | null
          id?: string
          patient_id: string
          recorded_at?: string
          respiratory_rate?: number | null
          source?: string | null
          spo2?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          heart_rate?: number | null
          height?: number | null
          id?: string
          patient_id?: string
          recorded_at?: string
          respiratory_rate?: number | null
          source?: string | null
          spo2?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      demote_from_admin: { Args: { _user_id: string }; Returns: undefined }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_active_session: {
        Args: { _doctor_id: string; _patient_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      promote_to_admin: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role:
        | "doctor"
        | "admin"
        | "center_admin"
        | "hospital_admin"
        | "technician"
      appointment_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      emergency_severity: "low" | "medium" | "high" | "critical"
      org_member_role:
        | "owner"
        | "admin"
        | "doctor"
        | "technician"
        | "receptionist"
      org_type: "diagnostic_center" | "hospital"
      org_verification_status:
        | "pending"
        | "under_review"
        | "verified"
        | "rejected"
      prescription_status: "active" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "doctor",
        "admin",
        "center_admin",
        "hospital_admin",
        "technician",
      ],
      appointment_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      emergency_severity: ["low", "medium", "high", "critical"],
      org_member_role: [
        "owner",
        "admin",
        "doctor",
        "technician",
        "receptionist",
      ],
      org_type: ["diagnostic_center", "hospital"],
      org_verification_status: [
        "pending",
        "under_review",
        "verified",
        "rejected",
      ],
      prescription_status: ["active", "completed", "cancelled"],
    },
  },
} as const
