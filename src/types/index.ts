// src/types/index.ts

// ==================== AUTH TYPES ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  role: 'candidate' | 'organization';
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: User;
}


// ==================== USER TYPES ====================

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'candidate' | 'organization' | 'admin';
  is_active: boolean;
  profile_picture?: string;
  city?: string;
  country?: string;
  phone?: string;
  date_joined?: string;
}


// ==================== ORGANIZATION TYPES ====================

export interface Organization {
  id: number;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  sector?: string;
  city?: string;
  country?: string;
  address?: string;
  email?: string;
  phone?: string;
  is_verified: boolean;
  logo?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface OrgMember {
  id: number;
  user: User;
  organization: number;
  role: 'admin' | 'member';
  joined_at?: string;
  created_at?: string;
}


// ==================== OPPORTUNITY / JOB TYPES ====================

export interface Opportunity {
  id: number;
  title: string;
  description: string;

  opportunity_type:
    | 'job'
    | 'internship'
    | 'volunteer'
    | 'training';

  status:
    | 'draft'
    | 'pending_review'
    | 'approved'
    | 'published'
    | 'rejected'
    | 'closed'
    | 'archived';

  organization: number;
  organization_name?: string;
  organization_details?: Organization;

  category?: {
    id: number;
    name: string;
  } | null;

  skills?: string[] | { id: number; name: string }[];

  city?: string;
  location?: string;
  country?: string;

  salary_range?: string;
  salary_min?: number | null;
  salary_max?: number | null;

  is_remote: boolean;

  requirements?: string[];

  responsibilities?: string;
  benefits?: string;

  experience_level?: string;
  education_level?: string;
  contract_type?: string;
  duration_weeks?: number | null;

  rejection_reason?: string;
  application_deadline?: string | null;
  published_at?: string | null;

  created_at: string;
  updated_at: string;
}


export interface JobPosting extends Opportunity {
  employment_type?:
    | 'full_time'
    | 'part_time'
    | 'contract'
    | 'internship';

  vacancies?: number;
}


// ==================== APPLICATION TYPES ====================

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: number;
  
  // Relation avec l'opportunité
  opportunity: number;
  opportunity_title?: string;
  organization_name?: string;
  
  // Relation avec le candidat
  candidate: number;
  candidate_details?: User;
  
  // Statut
  status: ApplicationStatus;
  
  // Dates
  submitted_at: string;
  updated_at: string;
  created_at?: string;
  
  // Documents
  cover_note?: string;
  cover_letter?: string;
  
  // Anciens champs pour compatibilité
  job?: number;
  job_details?: {
    id?: number;
    title: string;
    organization_name: string;
    organization?: number;
    city?: string;
    location?: string;
    salary_range?: string;
  };
  applied_at?: string;
  document_id?: number;
  resume_document?: number;
}


// ==================== PROFILE TYPES ====================

export interface CandidateProfile {
  id?: number;
  user: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  skills?: Skill[];
  experiences?: Experience[];
  education?: Education[];
  languages?: Language[];
  profile_picture?: string | null;
}


export interface Skill {
  id: number;
  name: string;
  category?: string;
}


export interface Experience {
  id: number;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string;
}


export interface Education {
  id: number;
  degree: string;
  field_of_study: string;
  institution: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string;
}


// ==================== LANGUAGE TYPES ====================

export type LanguageLevel =
  | 'basic'
  | 'intermediate'
  | 'fluent'
  | 'native';


export interface Language {
  id: number;
  name: string;
  level: LanguageLevel;
}


// ==================== DOCUMENT TYPES ====================

export type DocumentType =
  | 'cv'
  | 'diploma'
  | 'certificate'
  | 'cover_letter'
  | 'other';


export interface UserDocument {
  id: number;
  file: string;
  original_filename: string;
  document_type: DocumentType;
  uploaded_at: string;
  user: number;
}


// ==================== ADMIN TYPES ====================

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
  };
  organizations: {
    total: number;
    verified: number;
  };
  opportunities: {
    total: number;
    pending_review: number;
    active: number;
  };
  applications: {
    total: number;
    submitted: number;
  };
}

// ==================== ADMIN OPPORTUNITY TYPES ====================

export interface AdminOpportunityFilters {
  status?: string;
  search?: string;
  organization?: number;
  date_from?: string;
  date_to?: string;
}

export interface AdminOpportunityStats {
  total: number;
  pending_review: number;
  approved: number;
  published: number;
  rejected: number;
  closed: number;
  archived: number;
}

export interface AdminAction {
  id: number;
  user: number;
  user_name?: string;
  action: 'create' | 'submit' | 'approve' | 'reject' | 'publish' | 'close' | 'archive';
  comment?: string;
  created_at: string;
}


// ==================== PAGINATION ====================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}


// ==================== CANDIDATE DASHBOARD ====================

export interface CandidateStats {
  totalApplications: number;
  inReview: number;
  interviewsCount: number;
  savedJobsCount: number;
}


export interface CandidateApplication extends Application {
  jobTitle?: string;
  companyName?: string;
  location?: string;
  appliedAt?: string;
  salaryRange?: string;
  status: ApplicationStatus;
}


// ==================== OPPORTUNITY MANAGEMENT ====================

export interface OpportunityReviewData {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

export interface OpportunityCreateData {
  title: string;
  description: string;
  opportunity_type: 'job' | 'internship' | 'training';
  organization: number;
  category?: number;
  skills?: number[];
  city?: string;
  country?: string;
  is_remote?: boolean;
  experience_level?: string;
  education_level?: string;
  contract_type?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  duration_weeks?: number | null;
  application_deadline?: string | null;
}