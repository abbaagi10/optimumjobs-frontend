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
  Sparkles,
  Award,
  Star,
  Zap,
  Shield,
  Activity,
  Crown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  AtSign,
  Link2,
  Copy,
  Eye,
  Heart,
  Share2,
  Settings,
  Bell,
  HelpCircle
} from 'lucide-react';

import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
// ANIMATION VARIANTS
// ==========================================================

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 }
};

const statCardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }
};

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
  console.error('❌ Response:', error?.response);
  console.error('❌ Response data:', error?.response?.data);
  
  const data = error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (data.errors) {
    const messages = Object.values(data.errors).flat();
    return messages.join(' ');
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (data.non_field_errors?.length) {
    return data.non_field_errors[0];
  }

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    if (Array.isArray(value)) {
      return `${firstKey}: ${value.join(' ')}`;
    }
    if (typeof value === 'string') {
      return `${firstKey}: ${value}`;
    }
  }

  return fallback;
};

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

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
  
  if (!form.is_current) {
    data.end_date = form.end_date || null;
  } else {
    data.end_date = null;
  }

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
  
  if (!form.is_current) {
    data.end_date = form.end_date || null;
  } else {
    data.end_date = null;
  }

  return data;
};

const cleanLanguageData = (form: LanguageForm) => {
  return {
    name: form.name.trim(),
    level: form.level,
  };
};

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

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <motion.div
    variants={statCardVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
    className="relative group bg-slate-900/80 border border-slate-800 p-4 rounded-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${color}-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
      )}
      <div className="mt-3 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-${color}-500 to-transparent transition-all duration-700" />
    </div>
  </motion.div>
);

const LevelBadge = ({ level }: { level: LanguageLevel }) => {
  const levels = {
    basic: { label: 'Notions', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
    intermediate: { label: 'Intermédiaire', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    fluent: { label: 'Courant', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    native: { label: 'Maternelle', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  };

  const config = levels[level] || levels.intermediate;

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.color}`}>
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ==========================================================
  // MOUSE PARALLAX
  // ==========================================================

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
  // SYNCHRONISATION DU FORMULAIRE PROFIL
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
      toast.success('Profil mis à jour avec succès.');
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
      toast.success('Expérience ajoutée avec succès.');
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
      toast.success('Expérience modifiée avec succès.');
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
      toast.success('Expérience supprimée.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de supprimer cette expérience.'));
    },
  });

  const addEducationMutation = useMutation({
    mutationFn: (data: Omit<Education, 'id'>) => profileApi.addEducation(data),
    onSuccess: () => {
      toast.success('Formation ajoutée avec succès.');
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
      toast.success('Formation modifiée avec succès.');
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
      toast.success('Formation supprimée.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de supprimer cette formation.'));
    },
  });

  const addLanguageMutation = useMutation({
    mutationFn: (data: Omit<Language, 'id'>) => profileApi.addLanguage(data),
    onSuccess: () => {
      toast.success('Langue ajoutée avec succès.');
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
      toast.success('Langue modifiée avec succès.');
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
      toast.success('Langue supprimée.');
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
      toast.success('Document téléversé avec succès.');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Erreur lors de l’envoi du fichier.'));
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id: number) => documentsApi.delete(id),
    onSuccess: () => {
      toast.success('Document supprimé.');
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
      toast.success('Email copié !');
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  // ==========================================================
  // HANDLERS EXPERIENCE
  // ==========================================================

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

  // ==========================================================
  // HANDLERS EDUCATION
  // ==========================================================

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

  // ==========================================================
  // HANDLERS LANGUAGE
  // ==========================================================

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

  // ==========================================================
  // HANDLER UPLOAD
  // ==========================================================

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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Chargement de votre profil...</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-500/50"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (isProfileError || !profile) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto px-4 py-12"
      >
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <p className="text-lg font-semibold text-white">Impossible de charger votre profil.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}
            className="mt-4 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-all duration-300"
          >
            Réessayer
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {/* Background decoration with parallax */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0f] overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 15,
            y: -mousePosition.y * 15,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
        <motion.div 
          className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 10,
            y: mousePosition.y * 10,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
      </div>

      {/* ======================================================
          BARRE DE NAVIGATION
      ====================================================== */}

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Retour</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoHome}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 px-4 py-2.5 text-sm font-medium text-amber-400 transition-all duration-300 hover:from-amber-500/20 hover:to-amber-600/20 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <Home className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden sm:inline">Accueil</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-4 py-1.5 border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Mon profil</span>
            <Crown className="w-3 h-3 text-amber-400" />
          </div>
        </div>
      </motion.div>

      {/* ======================================================
          EN-TÊTE PROFIL
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Avatar */}
          <motion.div 
            className="relative"
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-center text-3xl font-bold text-amber-400 shadow-xl shadow-amber-500/10 relative overflow-hidden"
            >
              {profile.first_name?.[0]?.toUpperCase() || profile.last_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'C'}
              <AnimatePresence>
                {isHoveringAvatar && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-0 bg-slate-950/80 flex items-center justify-center"
                  >
                    <Camera className="w-6 h-6 text-amber-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Informations */}
          <div className="flex-1 min-w-0">
            {isEditingProfile ? (
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.input
                    variants={fadeInUp}
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    placeholder="Prénom"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                  />
                  <motion.input
                    variants={fadeInUp}
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    placeholder="Nom"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                  />
                </div>

                <motion.div 
                  variants={fadeInUp}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                >
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="text-sm text-slate-400">{user?.email}</span>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.div variants={fadeInUp} className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Téléphone"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="Ville"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                  </motion.div>
                </div>

                <motion.div variants={fadeInUp} className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-slate-500" />
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    placeholder="Pays"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                  />
                </motion.div>

                <motion.textarea
                  variants={fadeInUp}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Bio / Présentation"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                />
              </motion.div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <motion.h1 variants={fadeInUp} className="text-2xl md:text-3xl font-extrabold text-white">
                    {profile.first_name || profile.last_name
                      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                      : 'Mon profil'}
                  </motion.h1>
                  <motion.span
                    variants={fadeInUp}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 rounded-full"
                  >
                    CANDIDAT
                  </motion.span>
                </div>

                <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5 group cursor-pointer" onClick={handleCopyEmail}>
                    <Mail className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    {profile.email || user?.email}
                    {isCopied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-slate-500" />
                      {profile.phone}
                    </span>
                  )}
                  {(profile.city || profile.country) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {[profile.city, profile.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </motion.div>

                {profile.bio && (
                  <motion.p variants={fadeInUp} className="text-sm leading-6 text-slate-300">
                    {profile.bio}
                  </motion.p>
                )}
              </motion.div>
            )}
          </div>

          {/* Actions profil */}
          <div className="flex shrink-0 gap-2">
            {isEditingProfile ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                  className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-all duration-300"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-bold text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
              >
                <Edit2 className="h-4 w-4" />
                Modifier
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ======================================================
          STATISTIQUES RAPIDES
      ====================================================== */}

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard title="Expériences" value={stats.experiences} icon={Briefcase} color="amber" />
        <StatCard title="Formations" value={stats.education} icon={GraduationCap} color="blue" />
        <StatCard title="Langues" value={stats.languages} icon={Languages} color="purple" />
        <StatCard title="Documents" value={stats.documents} icon={FileText} color="emerald" />
      </motion.div>

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-8 lg:col-span-2">
          {/* EXPERIENCES */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-lg font-bold text-amber-400">
                <Briefcase className="h-5 w-5" />
                <h2>Expériences professionnelles</h2>
                <span className="text-xs text-slate-500 font-normal">({experiences.length})</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 transition-all duration-300 border border-amber-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </motion.button>
            </div>

            <AnimatePresence>
              {showExperienceForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-5 overflow-hidden"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-white">
                      {editingExperienceId ? 'Modifier l’expérience' : 'Ajouter une expérience'}
                    </h3>
                    <button type="button" onClick={cancelExperienceForm} className="text-slate-400 hover:text-white transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      value={experienceForm.title}
                      onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                      placeholder="Intitulé du poste"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    <input
                      type="text"
                      value={experienceForm.company}
                      onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                      placeholder="Entreprise"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    <input
                      type="text"
                      value={experienceForm.location}
                      onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                      placeholder="Lieu"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    <input
                      type="date"
                      value={experienceForm.start_date}
                      onChange={(e) => setExperienceForm({ ...experienceForm, start_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    {!experienceForm.is_current && (
                      <input
                        type="date"
                        value={experienceForm.end_date}
                        onChange={(e) => setExperienceForm({ ...experienceForm, end_date: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                      />
                    )}
                  </div>

                  <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={experienceForm.is_current}
                      onChange={(e) => setExperienceForm({
                        ...experienceForm,
                        is_current: e.target.checked,
                        end_date: e.target.checked ? '' : experienceForm.end_date,
                      })}
                      className="h-4 w-4 accent-amber-500"
                    />
                    Poste actuel
                  </label>

                  <textarea
                    value={experienceForm.description}
                    onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                    placeholder="Description de l’expérience"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 mt-4"
                  />

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelExperienceForm}
                      className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-all duration-300"
                    >
                      Annuler
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleExperienceSubmit}
                      disabled={isSavingExperience}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50"
                    >
                      {isSavingExperience && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editingExperienceId ? 'Modifier' : 'Ajouter'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 space-y-4">
              {experiences.length === 0 ? (
                <motion.div 
                  variants={fadeInScale}
                  className="py-8 text-center text-slate-500"
                >
                  <Briefcase className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium text-slate-400">Aucune expérience renseignée</p>
                  <p className="mt-1 text-xs text-slate-600">Ajoutez vos expériences professionnelles</p>
                </motion.div>
              ) : (
                experiences.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-xl border border-slate-800 bg-slate-950/40 p-4 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                            {exp.title}
                          </h3>
                          <span className="text-xs text-amber-400/70">•</span>
                          <p className="text-sm text-amber-400">{exp.company}</p>
                          {exp.is_current && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                              Actuel
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-slate-500 flex items-center gap-3">
                          <Calendar className="w-3 h-3" />
                          {exp.start_date}
                          {' — '}
                          {exp.is_current ? 'Présent' : exp.end_date || 'Non précisé'}
                          {exp.location && (
                            <>• <MapPin className="w-3 h-3 inline" /> {exp.location}</>
                          )}
                        </p>
                        {exp.description && (
                          <p className="mt-3 text-sm leading-6 text-slate-400 group-hover:text-slate-300 transition-colors">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => handleEditExperience(exp)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-amber-400 transition-all duration-300"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => deleteExperienceMutation.mutate(exp.id)}
                          disabled={deleteExperienceMutation.isPending}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-all duration-300"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>

          {/* FORMATIONS */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-lg font-bold text-amber-400">
                <GraduationCap className="h-5 w-5" />
                <h2>Formations & diplômes</h2>
                <span className="text-xs text-slate-500 font-normal">({education.length})</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 transition-all duration-300 border border-amber-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </motion.button>
            </div>

            <AnimatePresence>
              {showEducationForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-5 overflow-hidden"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-white">
                      {editingEducationId ? 'Modifier la formation' : 'Ajouter une formation'}
                    </h3>
                    <button type="button" onClick={cancelEducationForm} className="text-slate-400 hover:text-white transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      value={educationForm.degree}
                      onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                      placeholder="Diplôme"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    <input
                      type="text"
                      value={educationForm.institution}
                      onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                      placeholder="Établissement"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    <input
                      type="text"
                      value={educationForm.field_of_study}
                      onChange={(e) => setEducationForm({ ...educationForm, field_of_study: e.target.value })}
                      placeholder="Domaine d'étude"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    <input
                      type="date"
                      value={educationForm.start_date}
                      onChange={(e) => setEducationForm({ ...educationForm, start_date: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    {!educationForm.is_current && (
                      <input
                        type="date"
                        value={educationForm.end_date}
                        onChange={(e) => setEducationForm({ ...educationForm, end_date: e.target.value })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                      />
                    )}
                  </div>

                  <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={educationForm.is_current}
                      onChange={(e) => setEducationForm({
                        ...educationForm,
                        is_current: e.target.checked,
                        end_date: e.target.checked ? '' : educationForm.end_date,
                      })}
                      className="h-4 w-4 accent-amber-500"
                    />
                    Formation en cours
                  </label>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEducationForm}
                      className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-all duration-300"
                    >
                      Annuler
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleEducationSubmit}
                      disabled={isSavingEducation}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50"
                    >
                      {isSavingEducation && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editingEducationId ? 'Modifier' : 'Ajouter'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 space-y-4">
              {education.length === 0 ? (
                <motion.div 
                  variants={fadeInScale}
                  className="py-8 text-center text-slate-500"
                >
                  <GraduationCap className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium text-slate-400">Aucune formation renseignée</p>
                  <p className="mt-1 text-xs text-slate-600">Ajoutez vos diplômes et formations</p>
                </motion.div>
              ) : (
                education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.05 }}
                    className="group rounded-xl border border-slate-800 bg-slate-950/40 p-4 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                            {edu.degree}
                            {edu.field_of_study && <> en {edu.field_of_study}</>}
                          </h3>
                          {edu.is_current && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                              En cours
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-amber-400">{edu.institution}</p>
                        <p className="mt-2 text-xs text-slate-500 flex items-center gap-3">
                          <Calendar className="w-3 h-3" />
                          {edu.start_date}
                          {' — '}
                          {edu.is_current ? 'En cours' : edu.end_date || 'Non précisé'}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => handleEditEducation(edu)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-amber-400 transition-all duration-300"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => deleteEducationMutation.mutate(edu.id)}
                          disabled={deleteEducationMutation.isPending}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-all duration-300"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>

          {/* LANGUES */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-lg font-bold text-amber-400">
                <Languages className="h-5 w-5" />
                <h2>Langues</h2>
                <span className="text-xs text-slate-500 font-normal">({languages.length})</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 transition-all duration-300 border border-amber-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </motion.button>
            </div>

            <AnimatePresence>
              {showLanguageForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-5 overflow-hidden"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-white">
                      {editingLanguageId ? 'Modifier la langue' : 'Ajouter une langue'}
                    </h3>
                    <button type="button" onClick={cancelLanguageForm} className="text-slate-400 hover:text-white transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      value={languageForm.name}
                      onChange={(e) => setLanguageForm({ ...languageForm, name: e.target.value })}
                      placeholder="Langue (ex. Français)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    <select
                      value={languageForm.level}
                      onChange={(e) => setLanguageForm({ ...languageForm, level: e.target.value as LanguageLevel })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    >
                      <option value="basic">Notions</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="fluent">Courant</option>
                      <option value="native">Langue maternelle</option>
                    </select>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelLanguageForm}
                      className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-all duration-300"
                    >
                      Annuler
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleLanguageSubmit}
                      disabled={isSavingLanguage}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50"
                    >
                      {isSavingLanguage && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editingLanguageId ? 'Modifier' : 'Ajouter'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 space-y-2">
              {languages.length === 0 ? (
                <motion.div 
                  variants={fadeInScale}
                  className="py-8 text-center text-slate-500"
                >
                  <Languages className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium text-slate-400">Aucune langue renseignée</p>
                </motion.div>
              ) : (
                languages.map((language, index) => (
                  <motion.div
                    key={language.id}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3 hover:border-amber-500/30 transition-all duration-300 group"
                  >
                    <div>
                      <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {language.name}
                      </span>
                      <div className="mt-1">
                        <LevelBadge level={language.level} />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleEditLanguage(language)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-amber-400 transition-all duration-300"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => deleteLanguageMutation.mutate(language.id)}
                        disabled={deleteLanguageMutation.isPending}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-all duration-300"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        {/* ======================================================
            COLONNE DOCUMENTS
        ====================================================== */}

        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="sticky top-24 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 text-lg font-bold text-amber-400">
              <FileText className="h-5 w-5" />
              <h2>Mes documents</h2>
              <span className="text-xs text-slate-500 font-normal">({documents.length})</span>
            </div>

            {/* Upload */}
            <div className="mt-5 space-y-3">
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
              >
                <option value="cv">Curriculum Vitae (CV)</option>
                <option value="diploma">Diplôme</option>
                <option value="certificate">Certificat</option>
                <option value="cover_letter">Lettre de motivation</option>
                <option value="other">Autre</option>
              </select>

              <motion.label
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/30 p-5 transition-all duration-300 hover:border-amber-500/50 hover:bg-slate-950/50"
              >
                <Upload className="mb-2 h-7 w-7 text-slate-500 group-hover:text-amber-400 transition-colors" />
                <span className="text-sm font-medium text-slate-300">Ajouter un document</span>
                <span className="mt-1 text-[10px] text-slate-500">PDF, DOC, DOCX — Max 5 Mo</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading && (
                  <Loader2 className="mt-3 h-5 w-5 animate-spin text-amber-500" />
                )}
              </motion.label>
            </div>

            {/* Liste documents */}
            <div className="mt-6 space-y-2">
              {isDocsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : documents.length === 0 ? (
                <motion.div 
                  variants={fadeInScale}
                  className="py-8 text-center text-slate-500"
                >
                  <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium text-slate-400">Aucun document</p>
                  <p className="mt-1 text-xs text-slate-600">Ajoutez vos documents</p>
                </motion.div>
              ) : (
                documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-amber-500/30 transition-all duration-300 group"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-amber-500/10">
                        <FileText className="h-4 w-4 shrink-0 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                          {doc.original_filename}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase text-slate-500">
                          {doc.document_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={documentsApi.getDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-all duration-300"
                        title="Ouvrir"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </motion.a>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => deleteDocMutation.mutate(doc.id)}
                        disabled={deleteDocMutation.isPending}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all duration-300"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>

          {/* Actions rapides */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              Actions rapides
            </h3>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 text-sm text-slate-300 hover:text-white group"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  Paramètres du compte
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 text-sm text-slate-300 hover:text-white group"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  Notifications
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 text-sm text-slate-300 hover:text-white group"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  Aide & Support
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.section>
        </div>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/50 text-xs text-slate-600"
      >
        <div className="flex items-center gap-4">
          <span className="text-slate-500">
            <span className="text-amber-400 font-medium">{profile.first_name || 'Candidat'}</span> • Profil
          </span>
          <span className="w-px h-4 bg-slate-800" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400/70">Sécurisé</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-400" />
            V1.0.0
          </span>
          <span className="w-px h-4 bg-slate-800" />
          <span>Profil Candidat</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CandidateProfilePage;