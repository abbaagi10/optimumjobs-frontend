// src/pages/AdminProfilePage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit2,
  Save,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  LayoutDashboard,
  Sparkles,
  Crown,
  Activity,
  Fingerprint,
  Shield,
  Award,
  Star,
  Zap,
  Copy,
  Check,
  Camera,
  Settings,
  Lock,
  Bell,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { profileApi } from '../api/profile';
import { useAuthStore } from '../store/authStore';
import { CandidateProfile } from '../types';

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

// ==========================================================
// COMPONENTS
// ==========================================================

interface AdminProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  country: string;
  bio: string;
}

interface ApiErrorResponse {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

const emptyForm: AdminProfileForm = {
  first_name: '',
  last_name: '',
  phone: '',
  city: '',
  country: '',
  bio: '',
};

const ProfileDisplayValue: React.FC<{
  value?: string | null;
  icon?: React.ReactNode;
}> = ({ value, icon }) => (
  <motion.div
    variants={fadeInUp}
    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-[46px] rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden w-full group hover:border-amber-500/30 transition-all duration-300"
  >
    {icon && (
      <span className="text-slate-500 group-hover:text-amber-400 transition-colors shrink-0">
        {icon}
      </span>
    )}
    <span className="text-xs sm:text-sm text-white truncate min-w-0 flex-1">
      {value || 'Non renseigné'}
    </span>
  </motion.div>
);

const InfoCard = ({ icon: Icon, label, value, color = 'amber' }: any) => (
  <motion.div
    variants={fadeInUp}
    className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 transition-all duration-300 group"
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] sm:text-xs text-slate-500">{label}</span>
      <div className={`p-1.5 rounded-lg bg-${color}-500/10 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
        <Icon className={`w-3.5 h-3.5 text-${color}-400`} />
      </div>
    </div>
    <p className="text-xs sm:text-sm font-semibold text-white mt-2 break-words">{value}</p>
  </motion.div>
);

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminProfileForm>(emptyForm);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState(false);

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
  // QUERY
  // ==========================================================

  const {
    data: profile,
    isLoading,
    isError,
    refetch
  } = useQuery<CandidateProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileApi.getProfile();
      return response.data;
    },
  });

  // ==========================================================
  // FORM HANDLING
  // ==========================================================

  const getInitialFormData = (
    profData?: CandidateProfile | null
  ): AdminProfileForm => ({
    first_name: profData?.first_name || user?.first_name || '',
    last_name: profData?.last_name || user?.last_name || '',
    phone: profData?.phone || user?.phone || '',
    city: profData?.city || user?.city || '',
    country: profData?.country || user?.country || 'Niger',
    bio: profData?.bio || '',
  });

  useEffect(() => {
    if (profile) {
      setForm(getInitialFormData(profile));
    }
  }, [profile, user]);

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const updateProfileMutation = useMutation({
    mutationFn: (data: AdminProfileForm) => profileApi.updateProfile(data),

    onSuccess: async () => {
      toast.success('Profil administrateur mis à jour avec succès.');
      setIsEditing(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
      ]);
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error('Erreur mise à jour profil admin:', error);
      const backendError = error?.response?.data;
      let message = 'Impossible de mettre à jour le profil.';

      if (backendError?.detail) {
        message = backendError.detail;
      } else if (backendError && typeof backendError === 'object') {
        const firstError = Object.values(backendError)[0];
        if (Array.isArray(firstError)) {
          message = String(firstError[0]);
        } else if (firstError) {
          message = String(firstError);
        }
      }

      toast.error(message);
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(form);
  };

  const handleCancel = () => {
    setForm(getInitialFormData(profile));
    setIsEditing(false);
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
  // COMPUTED
  // ==========================================================

  const firstName = profile?.first_name || user?.first_name || '';
  const lastName = profile?.last_name || user?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Compte Administrateur';

  const initials =
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    'A';

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
          <p className="text-sm text-slate-400">Chargement du profil...</p>
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
        </div>
      </motion.div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto px-3 sm:px-4 py-10"
      >
        <div className="bg-slate-900/80 border border-rose-500/20 rounded-3xl p-6 sm:p-12 text-center backdrop-blur-xl">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20"
          >
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Impossible de charger le profil</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Une erreur est survenue lors de la récupération de votre profil administrateur.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refetch()}
            className="mt-6 px-6 sm:px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 text-sm sm:text-base"
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
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSave}
      className="space-y-4 sm:space-y-6 relative"
    >
      {/* Background decoration with parallax */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0f] overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] bg-amber-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 15,
            y: -mousePosition.y * 15,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
      </div>

      {/* ======================================================
          BOUTON RETOUR
      ====================================================== */}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-800 hover:text-white transition-all duration-300 group hover:border-amber-500/30 w-full xs:w-auto justify-center"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:-translate-x-1 transition-transform duration-300" />
          <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span>Retour au Tableau de Bord</span>
        </motion.button>

        <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-3 sm:px-4 py-1.5 border border-slate-800 self-start xs:self-auto">
          <Crown className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Admin Niger</span>
        </div>
      </motion.div>

      {/* ======================================================
          HEADER DE PROFIL
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
      >
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
            {/* Avatar */}
            <motion.div
              className="relative shrink-0"
              onMouseEnter={() => setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30 shadow-xl flex items-center justify-center relative overflow-hidden"
              >
                <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
                  {initials}
                </span>
                <AnimatePresence>
                  {isHoveringAvatar && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 bg-slate-950/80 flex items-center justify-center"
                    >
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 border-slate-900"
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

            {/* Titres et infos */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white truncate">
                  {fullName}
                </h1>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold shrink-0"
                >
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Administrateur
                </motion.span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400">
                {user?.email && (
                  <motion.span
                    className="inline-flex items-center gap-1.5 max-w-full cursor-pointer group"
                    onClick={handleCopyEmail}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span className="truncate group-hover:text-white transition-colors">{user.email}</span>
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </motion.span>
                )}

                {(profile?.city || profile?.country) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-500" />
                    <span>
                      {[profile?.city, profile?.country || 'Niger']
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </span>
                )}

                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600">
                  <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                  <span className="text-emerald-400/70">En ligne</span>
                </span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.button
                  key="edit"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 w-full xs:w-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </motion.button>
              ) : (
                <>
                  <motion.button
                    key="cancel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs sm:text-sm font-semibold hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 w-full xs:w-auto"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </motion.button>

                  <motion.button
                    key="save"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 w-full xs:w-auto"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Enregistrer
                  </motion.button>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Colonne de gauche - Informations personnelles */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-center gap-3 pb-4 sm:pb-5 border-b border-slate-800">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Informations personnelles
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500">
                  Gérez les informations de votre compte administrateur.
                </p>
              </div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-5 sm:mt-6"
            >
              {/* Prénom */}
              <motion.div variants={fadeInUp}>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-2">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    className="w-full px-3 sm:px-4 py-3 rounded-xl bg-slate-950 text-white border border-slate-800 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all duration-300 h-[46px] text-xs sm:text-sm"
                  />
                ) : (
                  <ProfileDisplayValue value={profile?.first_name} />
                )}
              </motion.div>

              {/* Nom */}
              <motion.div variants={fadeInUp}>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-2">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="w-full px-3 sm:px-4 py-3 rounded-xl bg-slate-950 text-white border border-slate-800 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all duration-300 h-[46px] text-xs sm:text-sm"
                  />
                ) : (
                  <ProfileDisplayValue value={profile?.last_name} />
                )}
              </motion.div>

              {/* Email */}
              <motion.div variants={fadeInUp}>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-2">
                  Adresse email
                </label>
                <ProfileDisplayValue
                  icon={<Mail className="w-4 h-4 text-slate-500 shrink-0" />}
                  value={user?.email}
                />
                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-1.5">
                  L'adresse email est gérée par le compte utilisateur.
                </p>
              </motion.div>

              {/* Téléphone */}
              <motion.div variants={fadeInUp}>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-2">
                  Téléphone
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Ex : +227 XX XX XX XX"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-3 rounded-xl bg-slate-950 text-white border border-slate-800 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all duration-300 h-[46px] text-xs sm:text-sm"
                    />
                  </div>
                ) : (
                  <ProfileDisplayValue
                    icon={<Phone className="w-4 h-4 text-slate-500 shrink-0" />}
                    value={profile?.phone}
                  />
                )}
              </motion.div>

              {/* Ville */}
              <motion.div variants={fadeInUp}>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-2">
                  Ville
                </label>
                {isEditing ? (
                  <div className="relative">
                    <MapPin className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Votre ville"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-3 rounded-xl bg-slate-950 text-white border border-slate-800 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all duration-300 h-[46px] text-xs sm:text-sm"
                    />
                  </div>
                ) : (
                  <ProfileDisplayValue
                    icon={<MapPin className="w-4 h-4 text-slate-500 shrink-0" />}
                    value={profile?.city}
                  />
                )}
              </motion.div>

              {/* Pays */}
              <motion.div variants={fadeInUp}>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-2">
                  Pays
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Globe className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Votre pays"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-3 rounded-xl bg-slate-950 text-white border border-slate-800 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all duration-300 h-[46px] text-xs sm:text-sm"
                    />
                  </div>
                ) : (
                  <ProfileDisplayValue
                    icon={<Globe className="w-4 h-4 text-slate-500 shrink-0" />}
                    value={profile?.country || 'Niger'}
                  />
                )}
              </motion.div>
            </motion.div>

            {/* Biographie */}
            <motion.div
              variants={fadeInUp}
              className="mt-5"
            >
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-2">
                Biographie / Présentation
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Présentez-vous brièvement..."
                  className="w-full px-3 sm:px-4 py-3 rounded-xl bg-slate-950 text-white border border-slate-800 placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all duration-300 text-xs sm:text-sm"
                />
              ) : (
                <motion.div
                  whileHover={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}
                  className="min-h-[100px] sm:min-h-[110px] px-3 sm:px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed break-words transition-all duration-300"
                >
                  {profile?.bio || 'Aucune présentation renseignée.'}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Colonne de droite - Compte & Sécurité */}
        <div className="space-y-4 sm:space-y-6">
          {/* Informations du compte */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-center gap-3 pb-4 sm:pb-5 border-b border-slate-800">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white">Compte</h2>
                <p className="text-[10px] sm:text-xs text-slate-500">Informations de sécurité</p>
              </div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3 mt-5 sm:mt-6"
            >
              <InfoCard
                icon={ShieldCheck}
                label="Rôle"
                value="Administrateur"
                color="amber"
              />
              <InfoCard
                icon={CheckCircle2}
                label="Statut"
                value={user?.is_active ? 'Actif' : 'Inactif'}
                color="emerald"
              />
              <InfoCard
                icon={Mail}
                label="Email du compte"
                value={user?.email || 'Non disponible'}
                color="blue"
              />
              <InfoCard
                icon={Fingerprint}
                label="ID Utilisateur"
                value={`#${user?.id || 'N/A'}`}
                color="purple"
              />
            </motion.div>
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              Actions rapides
            </h2>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 text-xs sm:text-sm text-slate-300 hover:text-white group"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  Changer le mot de passe
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 text-xs sm:text-sm text-slate-300 hover:text-white group"
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
                type="button"
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 text-xs sm:text-sm text-slate-300 hover:text-white group"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  Aide & Support
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Session info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Session active
              </span>
              <span className="w-px h-4 bg-slate-800" />
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/50 text-[10px] sm:text-xs text-slate-600"
      >
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-2 sm:gap-4">
          <span className="text-slate-500">
            <span className="text-amber-400 font-medium">Admin</span> • Profil
          </span>
          <span className="hidden xs:block w-px h-4 bg-slate-800" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400/70">Sécurisé - Niger</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-400" />
            v1.0.0
          </span>
          <span className="w-px h-4 bg-slate-800" />
          <span>Profil Admin</span>
        </div>
      </motion.div>
    </motion.form>
  );
};

export default AdminProfilePage;