// src/pages/CandidateProfilePage.tsx

import { useEffect, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import {
  User,
  Briefcase,
  GraduationCap,
  Languages,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Loader2,
  Plus,
  Edit2,
  Save,
  X,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  Home,
  Award,
  Shield,
  Activity,
  Crown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Copy,
  Settings,
  Bell,
  HelpCircle,
  Camera,
  Zap,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { profileApi } from '../api/profile';
import { documentsApi } from '../api/documents';
import { useAuthStore } from '../store/authStore';

import {
  DocumentType,
  CandidateProfile,
  Experience,
  Education,
  Language,
  LanguageLevel,
  UserDocument,
} from '../types';

// ==========================================================
// TYPES LOCAUX
// ==========================================================

type ExperienceForm = {
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
};

type EducationForm = {
  degree: string;
  institution: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

type LanguageForm = {
  name: string;
  level: LanguageLevel;
};

// ==========================================================
// HELPERS
// ==========================================================

const getErrorMessage = (error: any, fallback: string) => {
  console.error('❌ Erreur complète:', error);
  const data = error?.response?.data;

  if (!data) return fallback;

  if (data.errors) {
    const messages = Object.values(data.errors).flat();
    return messages.join(' ');
  }

  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.non_field_errors?.length) return data.non_field_errors[0];

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    if (Array.isArray(value)) return `${firstKey}: ${value.join(' ')}`;
    if (typeof value === 'string') return `${firstKey}: ${value}`;
  }

  return fallback;
};

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const cleanExperienceData = (form: ExperienceForm) => {
  const data: any = {
    title: form.title.trim(),
    company: form.company.trim(),
    start_date: form.start_date,
    is_current: form.is_current,
  };

  if (form.location?.trim()) data.location = form.location.trim();
  if (form.description?.trim()) data.description = form.description.trim();

  data.end_date = !form.is_current ? form.end_date || null : null;
  return data;
};

const cleanEducationData = (form: EducationForm) => {
  const data: any = {
    degree: form.degree.trim(),
    institution: form.institution.trim(),
    start_date: form.start_date,
    is_current: form.is_current,
  };

  if (form.field_of_study?.trim()) data.field_of_study = form.field_of_study.trim();

  data.end_date = !form.is_current ? form.end_date || null : null;
  return data;
};

const cleanLanguageData = (form: LanguageForm) => ({
  name: form.name.trim(),
  level: form.level,
});

// ==========================================================
// VALEURS INITIALES
// ==========================================================

const emptyExperienceForm: ExperienceForm = {
  title: '',
  company: '',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
};

const emptyEducationForm: EducationForm = {
  degree: '',
  institution: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  is_current: false,
};

const emptyLanguageForm: LanguageForm = {
  name: '',
  level: 'intermediate',
};

// ==========================================================
// COMPOSANTS
// ==========================================================

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => {
  const colorMap: any = {
    green: {
      bar: 'bg-[#16A34A]',
      iconBg: 'bg-gradient-to-br from-[#16A34A] to-[#15803D]',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(22,163,74,0.3)]',
    },
    amber: {
      bar: 'bg-[#FCD34D]',
      iconBg: 'bg-gradient-to-br from-[#FCD34D] to-[#EAB308]',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(252,211,77,0.4)]',
    },
    blue: {
      bar: 'bg-blue-500',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)]',
    },
    purple: {
      bar: 'bg-purple-500',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(168,85,247,0.3)]',
    },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className="group relative bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1">
      <div className={`h-1 ${c.bar}`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.iconBg} ${c.shadow} group-hover:scale-105 transition-transform shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#14532D]/50 mb-1 truncate">
          {title}
        </div>
        <div className="text-2xl font-extrabold text-[#14532D] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-[#14532D]/50 mt-1 line-clamp-2">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

const LevelBadge = ({ level }: { level: LanguageLevel }) => {
  const levels = {
    basic: { label: 'Notions', color: 'text-slate-600 bg-slate-100 border-slate-200' },
    intermediate: { label: 'Intermédiaire', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    fluent: { label: 'Courant', color: 'text-[#16A34A] bg-[#F0FDF4] border-[#16A34A]/20' },
    native: { label: 'Maternelle', color: 'text-[#B88400] bg-[#FEF3C7] border-[#FCD34D]/40' },
  };

  const config = levels[level] || levels.intermediate;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
};

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export const CandidateProfilePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // ==========================================================
  // ETATS
  // ==========================================================

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
  const [editingLanguageId, setEditingLanguageId] = useState<number | null>(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showLanguageForm, setShowLanguageForm] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('cv');
  const [uploading, setUploading] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    country: '',
    bio: '',
  });

  const [experienceForm, setExperienceForm] = useState<ExperienceForm>(emptyExperienceForm);
  const [educationForm, setEducationForm] = useState<EducationForm>(emptyEducationForm);
  const [languageForm, setLanguageForm] = useState<LanguageForm>(emptyLanguageForm);

  // ==========================================================
  // QUERIES
  // ==========================================================

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery<CandidateProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileApi.getProfile();
      return response.data;
    },
  });

  const {
    data: documentsData,
    isLoading: isDocsLoading,
  } = useQuery<UserDocument[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await documentsApi.getList();
      return normalizeList<UserDocument>(response.data);
    },
  });

  const documents = documentsData ?? [];

  // ==========================================================
  // SYNCHRONISATION DU FORMULAIRE
  // ==========================================================

  useEffect(() => {
    if (!profile) return;

    setEditForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      city: profile.city || '',
      country: profile.country || '',
      bio: profile.bio || '',
    });
  }, [profile]);

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<CandidateProfile>) => profileApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Profil mis à jour');
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Erreur lors de la mise à jour du profil.'));
    },
  });

  const addExperienceMutation = useMutation({
    mutationFn: (data: Omit<Experience, 'id'>) => profileApi.addExperience(data),
    onSuccess: () => {
      toast.success('Expérience ajoutée');
      setExperienceForm(emptyExperienceForm);
      setShowExperienceForm(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible d’ajouter cette expérience.'));
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Experience> }) =>
      profileApi.updateExperience(id, data),
    onSuccess: () => {
      toast.success('Expérience modifiée');
      setEditingExperienceId(null);
      setExperienceForm(emptyExperienceForm);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de modifier cette expérience.'));
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteExperience(id),
    onSuccess: () => {
      toast.success('Expérience supprimée');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de supprimer cette expérience.'));
    },
  });

  const addEducationMutation = useMutation({
    mutationFn: (data: Omit<Education, 'id'>) => profileApi.addEducation(data),
    onSuccess: () => {
      toast.success('Formation ajoutée');
      setEducationForm(emptyEducationForm);
      setShowEducationForm(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible d’ajouter cette formation.'));
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Education> }) =>
      profileApi.updateEducation(id, data),
    onSuccess: () => {
      toast.success('Formation modifiée');
      setEditingEducationId(null);
      setEducationForm(emptyEducationForm);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de modifier cette formation.'));
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteEducation(id),
    onSuccess: () => {
      toast.success('Formation supprimée');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de supprimer cette formation.'));
    },
  });

  const addLanguageMutation = useMutation({
    mutationFn: (data: Omit<Language, 'id'>) => profileApi.addLanguage(data),
    onSuccess: () => {
      toast.success('Langue ajoutée');
      setLanguageForm(emptyLanguageForm);
      setShowLanguageForm(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible d’ajouter cette langue.'));
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Language> }) =>
      profileApi.updateLanguage(id, data),
    onSuccess: () => {
      toast.success('Langue modifiée');
      setEditingLanguageId(null);
      setLanguageForm(emptyLanguageForm);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de modifier cette langue.'));
    },
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteLanguage(id),
    onSuccess: () => {
      toast.success('Langue supprimée');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de supprimer cette langue.'));
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: DocumentType }) =>
      documentsApi.upload(file, type),
    onSuccess: () => {
      toast.success('Document téléversé');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Erreur lors de l’envoi du fichier.'));
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id: number) => documentsApi.delete(id),
    onSuccess: () => {
      toast.success('Document supprimé');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de supprimer le document.'));
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setIsCopied(true);
      toast.success('Email copié');
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleExperienceSubmit = () => {
    if (!experienceForm.title.trim()) {
      toast.error('Veuillez renseigner l’intitulé du poste.');
      return;
    }
    if (!experienceForm.company.trim()) {
      toast.error('Veuillez renseigner l’entreprise.');
      return;
    }
    if (!experienceForm.start_date) {
      toast.error('Veuillez renseigner la date de début.');
      return;
    }

    const data = cleanExperienceData(experienceForm);
    if (editingExperienceId) {
      updateExperienceMutation.mutate({ id: editingExperienceId, data });
    } else {
      addExperienceMutation.mutate(data);
    }
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperienceId(experience.id);
    setExperienceForm({
      title: experience.title || '',
      company: experience.company || '',
      location: experience.location || '',
      start_date: experience.start_date || '',
      end_date: experience.end_date || '',
      is_current: experience.is_current || false,
      description: experience.description || '',
    });
    setShowExperienceForm(true);
  };

  const cancelExperienceForm = () => {
    setEditingExperienceId(null);
    setExperienceForm(emptyExperienceForm);
    setShowExperienceForm(false);
  };

  const handleEducationSubmit = () => {
    if (!educationForm.degree.trim()) {
      toast.error('Veuillez renseigner le diplôme.');
      return;
    }
    if (!educationForm.institution.trim()) {
      toast.error('Veuillez renseigner l’établissement.');
      return;
    }
    if (!educationForm.start_date) {
      toast.error('Veuillez renseigner la date de début.');
      return;
    }

    const data = cleanEducationData(educationForm);
    if (editingEducationId) {
      updateEducationMutation.mutate({ id: editingEducationId, data });
    } else {
      addEducationMutation.mutate(data);
    }
  };

  const handleEditEducation = (education: Education) => {
    setEditingEducationId(education.id);
    setEducationForm({
      degree: education.degree || '',
      institution: education.institution || '',
      field_of_study: education.field_of_study || '',
      start_date: education.start_date || '',
      end_date: education.end_date || '',
      is_current: education.is_current || false,
    });
    setShowEducationForm(true);
  };

  const cancelEducationForm = () => {
    setEditingEducationId(null);
    setEducationForm(emptyEducationForm);
    setShowEducationForm(false);
  };

  const handleLanguageSubmit = () => {
    if (!languageForm.name.trim()) {
      toast.error('Veuillez renseigner la langue.');
      return;
    }

    const data = cleanLanguageData(languageForm);
    if (editingLanguageId) {
      updateLanguageMutation.mutate({ id: editingLanguageId, data });
    } else {
      addLanguageMutation.mutate(data);
    }
  };

  const handleEditLanguage = (language: Language) => {
    setEditingLanguageId(language.id);
    setLanguageForm({
      name: language.name || '',
      level: language.level || 'intermediate',
    });
    setShowLanguageForm(true);
  };

  const cancelLanguageForm = () => {
    setEditingLanguageId(null);
    setLanguageForm(emptyLanguageForm);
    setShowLanguageForm(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx'];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension || '')) {
      toast.error('Format accepté : PDF, DOC ou DOCX.');
      return;
    }

    try {
      setUploading(true);
      await uploadDocMutation.mutateAsync({ file, type: selectedDocType });
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const experiences = normalizeList<Experience>(profile?.experiences);
  const education = normalizeList<Education>(profile?.education);
  const languages = normalizeList<Language>(profile?.languages);

  const isSavingExperience = addExperienceMutation.isPending || updateExperienceMutation.isPending;
  const isSavingEducation = addEducationMutation.isPending || updateEducationMutation.isPending;
  const isSavingLanguage = addLanguageMutation.isPending || updateLanguageMutation.isPending;

  const stats = {
    experiences: experiences.length,
    education: education.length,
    languages: languages.length,
    documents: documents.length,
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isProfileLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#14532D]/60 font-medium">
          Chargement de votre profil...
        </p>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (isProfileError || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <p className="text-lg font-extrabold text-[#14532D]">
            Impossible de charger votre profil.
          </p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}
            className="mt-4 rounded-xl bg-[#16A34A] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ======================================================
          BARRE DE NAVIGATION
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleGoBack}
            className="group flex items-center gap-2 rounded-xl border border-[#16A34A]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          <button
            onClick={handleGoHome}
            className="group flex items-center gap-2 rounded-xl border border-[#16A34A]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            <Home className="h-4 w-4 text-[#16A34A]" />
            <span className="hidden sm:inline">Accueil</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-full bg-white border border-[#16A34A]/15 px-4 py-1.5 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
            <span className="text-xs text-[#14532D]/70 font-semibold">Mon profil</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          EN-TÊTE PROFIL
      ====================================================== */}

      <div className="bg-white border border-[#16A34A]/10 rounded-3xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#16A34A] via-[#FCD34D] to-[#16A34A]" />

        <div className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Avatar */}
            <div
              className="relative shrink-0 self-start lg:self-center"
              onMouseEnter={() => setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-3xl font-extrabold text-white shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] relative overflow-hidden">
                {profile.first_name?.[0]?.toUpperCase() || profile.last_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'C'}
                {isHoveringAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#16A34A] border-2 border-white" />
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0 w-full">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      placeholder="Prénom"
                      className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                    />
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      placeholder="Nom"
                      className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-[#16A34A]/15 bg-[#FAFAF9] px-4 py-3">
                    <Mail className="h-4 w-4 shrink-0 text-[#16A34A]" />
                    <span className="text-sm text-[#14532D]/70 truncate">{user?.email}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-[#16A34A]" />
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="Téléphone"
                        className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#16A34A]" />
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        placeholder="Ville"
                        className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 shrink-0 text-[#16A34A]" />
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      placeholder="Pays"
                      className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                    />
                  </div>

                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Bio / Présentation"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#14532D] break-words">
                      {profile.first_name || profile.last_name
                        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                        : 'Mon profil'}
                    </h1>
                    <span className="px-3 py-1 text-xs font-bold bg-[#16A34A] text-white rounded-full shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]">
                      CANDIDAT
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-[#14532D]/60">
                    <span className="flex items-center gap-1.5 group cursor-pointer min-w-0" onClick={handleCopyEmail}>
                      <Mail className="h-4 w-4 text-[#16A34A] shrink-0" />
                      <span className="truncate max-w-[220px]">{profile.email || user?.email}</span>
                      {isCopied ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#14532D]/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-[#16A34A] shrink-0" />
                        {profile.phone}
                      </span>
                    )}
                    {(profile.city || profile.country) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-[#16A34A] shrink-0" />
                        {[profile.city, profile.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-sm leading-6 text-[#14532D]/80 max-w-3xl">
                      {profile.bio}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col xs:flex-row shrink-0 gap-2 w-full lg:w-auto">
              {isEditingProfile ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditForm({
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        phone: profile.phone || '',
                        city: profile.city || '',
                        country: profile.country || '',
                        bio: profile.bio || '',
                      });
                    }}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-white border border-[#16A34A]/20 px-5 py-2.5 text-sm font-semibold text-[#14532D] hover:bg-[#F0FDF4] transition-all"
                  >
                    <X className="h-4 w-4" />
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                  Modifier le profil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          STATS RAPIDES
      ====================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Expériences" value={stats.experiences} icon={Briefcase} color="green" />
        <StatCard title="Formations" value={stats.education} icon={GraduationCap} color="blue" />
        <StatCard title="Langues" value={stats.languages} icon={Languages} color="purple" />
        <StatCard title="Documents" value={stats.documents} icon={FileText} color="amber" />
      </div>

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">

          {/* EXPÉRIENCES */}
          <section className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 border-b border-[#16A34A]/10 pb-4">
              <div className="flex items-center gap-2 text-base font-extrabold text-[#14532D] min-w-0">
                <Briefcase className="h-5 w-5 text-[#16A34A] shrink-0" />
                <h2 className="truncate">Expériences</h2>
                <span className="text-xs text-[#14532D]/40 font-normal shrink-0">
                  ({experiences.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showExperienceForm && !editingExperienceId) {
                    cancelExperienceForm();
                  } else {
                    setEditingExperienceId(null);
                    setExperienceForm(emptyExperienceForm);
                    setShowExperienceForm(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#16A34A] text-white rounded-xl hover:bg-[#15803D] shadow-[0_2px_8px_-2px_rgba(22,163,74,0.4)] transition-all shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </button>
            </div>

            {showExperienceForm && (
              <div className="mt-5 rounded-2xl border border-[#16A34A]/20 bg-[#FAFAF9] p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-[#14532D] text-sm">
                    {editingExperienceId ? 'Modifier l’expérience' : 'Ajouter une expérience'}
                  </h3>
                  <button type="button" onClick={cancelExperienceForm} className="text-[#14532D]/40 hover:text-rose-500 transition-colors shrink-0">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={experienceForm.title}
                    onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                    placeholder="Intitulé du poste"
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  <input
                    type="text"
                    value={experienceForm.company}
                    onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                    placeholder="Entreprise"
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  <input
                    type="text"
                    value={experienceForm.location}
                    onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                    placeholder="Lieu"
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  <input
                    type="date"
                    value={experienceForm.start_date}
                    onChange={(e) => setExperienceForm({ ...experienceForm, start_date: e.target.value })}
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  {!experienceForm.is_current && (
                    <input
                      type="date"
                      value={experienceForm.end_date}
                      onChange={(e) => setExperienceForm({ ...experienceForm, end_date: e.target.value })}
                      className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                    />
                  )}
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-[#14532D]/80">
                  <input
                    type="checkbox"
                    checked={experienceForm.is_current}
                    onChange={(e) => setExperienceForm({
                      ...experienceForm,
                      is_current: e.target.checked,
                      end_date: e.target.checked ? '' : experienceForm.end_date,
                    })}
                    className="h-4 w-4 accent-[#16A34A]"
                  />
                  Poste actuel
                </label>

                <textarea
                  value={experienceForm.description}
                  onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                  placeholder="Description de l’expérience"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all mt-4 font-medium"
                />

                <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelExperienceForm}
                    className="rounded-xl bg-white border border-[#16A34A]/20 px-4 py-2 text-sm font-semibold text-[#14532D] hover:bg-[#F0FDF4] transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleExperienceSubmit}
                    disabled={isSavingExperience}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2 text-sm font-bold text-white hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] transition-all disabled:opacity-50"
                  >
                    {isSavingExperience && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingExperienceId ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {experiences.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
                    <Briefcase className="h-7 w-7 text-[#16A34A]/40" />
                  </div>
                  <p className="text-sm font-bold text-[#14532D]">Aucune expérience renseignée</p>
                  <p className="mt-1 text-xs text-[#14532D]/50">Ajoutez vos expériences professionnelles</p>
                </div>
              ) : (
                experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="group rounded-xl border border-[#16A34A]/10 bg-[#FAFAF9] p-4 hover:border-[#16A34A]/30 hover:bg-white transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-[#14532D] group-hover:text-[#16A34A] transition-colors text-sm sm:text-base break-words">
                            {exp.title}
                          </h3>
                          <span className="text-[#16A34A] font-bold text-sm">•</span>
                          <p className="text-sm text-[#16A34A] font-semibold break-words">{exp.company}</p>
                          {exp.is_current && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] rounded-full border border-[#16A34A]/20">
                              Actuel
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-[#14532D]/50 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {exp.start_date}{' — '}
                            {exp.is_current ? 'Présent' : exp.end_date || 'Non précisé'}
                          </span>
                          {exp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          )}
                        </p>
                        {exp.description && (
                          <p className="mt-3 text-sm leading-6 text-[#14532D]/70">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditExperience(exp)}
                          className="rounded-lg p-2 text-[#14532D]/40 hover:bg-white hover:text-[#16A34A] transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExperienceMutation.mutate(exp.id)}
                          disabled={deleteExperienceMutation.isPending}
                          className="rounded-lg p-2 text-[#14532D]/40 hover:bg-white hover:text-rose-500 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* FORMATIONS */}
          <section className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 border-b border-[#16A34A]/10 pb-4">
              <div className="flex items-center gap-2 text-base font-extrabold text-[#14532D] min-w-0">
                <GraduationCap className="h-5 w-5 text-[#16A34A] shrink-0" />
                <h2 className="truncate">Formations</h2>
                <span className="text-xs text-[#14532D]/40 font-normal shrink-0">
                  ({education.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showEducationForm && !editingEducationId) {
                    cancelEducationForm();
                  } else {
                    setEditingEducationId(null);
                    setEducationForm(emptyEducationForm);
                    setShowEducationForm(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#16A34A] text-white rounded-xl hover:bg-[#15803D] shadow-[0_2px_8px_-2px_rgba(22,163,74,0.4)] transition-all shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </button>
            </div>

            {showEducationForm && (
              <div className="mt-5 rounded-2xl border border-[#16A34A]/20 bg-[#FAFAF9] p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-[#14532D] text-sm">
                    {editingEducationId ? 'Modifier la formation' : 'Ajouter une formation'}
                  </h3>
                  <button type="button" onClick={cancelEducationForm} className="text-[#14532D]/40 hover:text-rose-500 transition-colors shrink-0">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                    placeholder="Diplôme"
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  <input
                    type="text"
                    value={educationForm.institution}
                    onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                    placeholder="Établissement"
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  <input
                    type="text"
                    value={educationForm.field_of_study}
                    onChange={(e) => setEducationForm({ ...educationForm, field_of_study: e.target.value })}
                    placeholder="Domaine d'étude"
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  <input
                    type="date"
                    value={educationForm.start_date}
                    onChange={(e) => setEducationForm({ ...educationForm, start_date: e.target.value })}
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  {!educationForm.is_current && (
                    <input
                      type="date"
                      value={educationForm.end_date}
                      onChange={(e) => setEducationForm({ ...educationForm, end_date: e.target.value })}
                      className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                    />
                  )}
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-[#14532D]/80">
                  <input
                    type="checkbox"
                    checked={educationForm.is_current}
                    onChange={(e) => setEducationForm({
                      ...educationForm,
                      is_current: e.target.checked,
                      end_date: e.target.checked ? '' : educationForm.end_date,
                    })}
                    className="h-4 w-4 accent-[#16A34A]"
                  />
                  Formation en cours
                </label>

                <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelEducationForm}
                    className="rounded-xl bg-white border border-[#16A34A]/20 px-4 py-2 text-sm font-semibold text-[#14532D] hover:bg-[#F0FDF4] transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleEducationSubmit}
                    disabled={isSavingEducation}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2 text-sm font-bold text-white hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] transition-all disabled:opacity-50"
                  >
                    {isSavingEducation && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingEducationId ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {education.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
                    <GraduationCap className="h-7 w-7 text-[#16A34A]/40" />
                  </div>
                  <p className="text-sm font-bold text-[#14532D]">Aucune formation renseignée</p>
                  <p className="mt-1 text-xs text-[#14532D]/50">Ajoutez vos diplômes et formations</p>
                </div>
              ) : (
                education.map((edu) => (
                  <div
                    key={edu.id}
                    className="group rounded-xl border border-[#16A34A]/10 bg-[#FAFAF9] p-4 hover:border-[#16A34A]/30 hover:bg-white transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-[#14532D] group-hover:text-[#16A34A] transition-colors text-sm sm:text-base break-words">
                            {edu.degree}
                            {edu.field_of_study && <> en {edu.field_of_study}</>}
                          </h3>
                          {edu.is_current && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] rounded-full border border-[#16A34A]/20">
                              En cours
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#16A34A] font-semibold break-words">{edu.institution}</p>
                        <p className="mt-2 text-xs text-[#14532D]/50 flex items-center gap-2">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {edu.start_date}{' — '}
                          {edu.is_current ? 'En cours' : edu.end_date || 'Non précisé'}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditEducation(edu)}
                          className="rounded-lg p-2 text-[#14532D]/40 hover:bg-white hover:text-[#16A34A] transition-all"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEducationMutation.mutate(edu.id)}
                          disabled={deleteEducationMutation.isPending}
                          className="rounded-lg p-2 text-[#14532D]/40 hover:bg-white hover:text-rose-500 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* LANGUES */}
          <section className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 border-b border-[#16A34A]/10 pb-4">
              <div className="flex items-center gap-2 text-base font-extrabold text-[#14532D] min-w-0">
                <Languages className="h-5 w-5 text-[#16A34A] shrink-0" />
                <h2 className="truncate">Langues</h2>
                <span className="text-xs text-[#14532D]/40 font-normal shrink-0">
                  ({languages.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showLanguageForm && !editingLanguageId) {
                    cancelLanguageForm();
                  } else {
                    setEditingLanguageId(null);
                    setLanguageForm(emptyLanguageForm);
                    setShowLanguageForm(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#16A34A] text-white rounded-xl hover:bg-[#15803D] shadow-[0_2px_8px_-2px_rgba(22,163,74,0.4)] transition-all shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </button>
            </div>

            {showLanguageForm && (
              <div className="mt-5 rounded-2xl border border-[#16A34A]/20 bg-[#FAFAF9] p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-[#14532D] text-sm">
                    {editingLanguageId ? 'Modifier la langue' : 'Ajouter une langue'}
                  </h3>
                  <button type="button" onClick={cancelLanguageForm} className="text-[#14532D]/40 hover:text-rose-500 transition-colors shrink-0">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    value={languageForm.name}
                    onChange={(e) => setLanguageForm({ ...languageForm, name: e.target.value })}
                    placeholder="Langue (ex. Français)"
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] placeholder-[#14532D]/30 outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  />
                  <select
                    value={languageForm.level}
                    onChange={(e) => setLanguageForm({ ...languageForm, level: e.target.value as LanguageLevel })}
                    className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  >
                    <option value="basic">Notions</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="fluent">Courant</option>
                    <option value="native">Langue maternelle</option>
                  </select>
                </div>

                <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelLanguageForm}
                    className="rounded-xl bg-white border border-[#16A34A]/20 px-4 py-2 text-sm font-semibold text-[#14532D] hover:bg-[#F0FDF4] transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleLanguageSubmit}
                    disabled={isSavingLanguage}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2 text-sm font-bold text-white hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] transition-all disabled:opacity-50"
                  >
                    {isSavingLanguage && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingLanguageId ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {languages.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
                    <Languages className="h-7 w-7 text-[#16A34A]/40" />
                  </div>
                  <p className="text-sm font-bold text-[#14532D]">Aucune langue renseignée</p>
                </div>
              ) : (
                languages.map((language) => (
                  <div
                    key={language.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#16A34A]/10 bg-[#FAFAF9] p-3 hover:border-[#16A34A]/30 hover:bg-white transition-all group"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-[#14532D] group-hover:text-[#16A34A] transition-colors text-sm block truncate">
                        {language.name}
                      </span>
                      <div className="mt-1">
                        <LevelBadge level={language.level} />
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditLanguage(language)}
                        className="rounded-lg p-2 text-[#14532D]/40 hover:bg-white hover:text-[#16A34A] transition-all"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLanguageMutation.mutate(language.id)}
                        disabled={deleteLanguageMutation.isPending}
                        className="rounded-lg p-2 text-[#14532D]/40 hover:bg-white hover:text-rose-500 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ======================================================
            COLONNE DROITE — DOCUMENTS + ACTIONS
        ====================================================== */}

        <div className="space-y-6">

          {/* Documents */}
          <section className="lg:sticky lg:top-24 bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 border-b border-[#16A34A]/10 pb-4 text-base font-extrabold text-[#14532D]">
              <FileText className="h-5 w-5 text-[#16A34A] shrink-0" />
              <h2 className="truncate">Mes documents</h2>
              <span className="text-xs text-[#14532D]/40 font-normal shrink-0">
                ({documents.length})
              </span>
            </div>

            {/* Upload */}
            <div className="mt-5 space-y-3">
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                className="w-full rounded-xl border border-[#16A34A]/20 bg-white px-4 py-3 text-sm text-[#14532D] outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
              >
                <option value="cv">Curriculum Vitae (CV)</option>
                <option value="diploma">Diplôme</option>
                <option value="certificate">Certificat</option>
                <option value="cover_letter">Lettre de motivation</option>
                <option value="other">Autre</option>
              </select>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#16A34A]/30 bg-[#FAFAF9] p-5 transition-all hover:border-[#16A34A]/60 hover:bg-[#F0FDF4]">
                <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] border border-[#16A34A]/20 flex items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-[#16A34A]" />
                </div>
                <span className="text-sm font-bold text-[#14532D]">Ajouter un document</span>
                <span className="mt-1 text-xs text-[#14532D]/50 text-center">PDF, DOC, DOCX — Max 5 Mo</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading && (
                  <Loader2 className="mt-3 h-5 w-5 animate-spin text-[#16A34A]" />
                )}
              </label>
            </div>

            {/* Liste */}
            <div className="mt-5 space-y-2">
              {isDocsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-[#16A34A]" />
                </div>
              ) : documents.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
                    <FileText className="h-7 w-7 text-[#16A34A]/40" />
                  </div>
                  <p className="text-sm font-bold text-[#14532D]">Aucun document</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#16A34A]/10 bg-[#FAFAF9] p-3 hover:border-[#16A34A]/30 hover:bg-white transition-all group"
                  >
                    <div className="flex min-w-0 items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-[#F0FDF4] border border-[#16A34A]/10 shrink-0">
                        <FileText className="h-4 w-4 text-[#16A34A]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#14532D] group-hover:text-[#16A34A] transition-colors">
                          {doc.original_filename}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase text-[#14532D]/40 truncate font-semibold">
                          {doc.document_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <a
                        href={documentsApi.getDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-2 text-[#14532D]/40 hover:bg-white hover:text-[#16A34A] transition-all"
                        title="Ouvrir"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteDocMutation.mutate(doc.id)}
                        disabled={deleteDocMutation.isPending}
                        className="rounded-lg p-2 text-[#14532D]/40 hover:bg-white hover:text-rose-500 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Actions rapides */}
          <section className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <h3 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#FCD34D]" />
              Actions rapides
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAF9] rounded-xl border border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] transition-all text-sm text-[#14532D]/80 hover:text-[#14532D] group font-medium">
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#16A34A]" />
                  Paramètres du compte
                </span>
                <ChevronRight className="w-4 h-4 text-[#14532D]/40 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAF9] rounded-xl border border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] transition-all text-sm text-[#14532D]/80 hover:text-[#14532D] group font-medium">
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#16A34A]" />
                  Notifications
                </span>
                <ChevronRight className="w-4 h-4 text-[#14532D]/40 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAF9] rounded-xl border border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] transition-all text-sm text-[#14532D]/80 hover:text-[#14532D] group font-medium">
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#16A34A]" />
                  Aide & Support
                </span>
                <ChevronRight className="w-4 h-4 text-[#14532D]/40 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span>
            <span className="text-[#16A34A] font-bold">{profile.first_name || 'Candidat'}</span> • Profil
          </span>
          <span className="hidden xs:block w-px h-4 bg-[#16A34A]/20" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-[#16A34A]" />
            <span className="text-[#16A34A]/70 font-medium">Sécurisé</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#FCD34D]" />
            V1.0.0
          </span>
          <span className="w-px h-4 bg-[#16A34A]/20" />
          <span>Profil Candidat</span>
        </div>
      </div>

    </div>
  );
};

export default CandidateProfilePage;