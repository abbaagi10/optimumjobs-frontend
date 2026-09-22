// src/pages/PublicProfilePage.tsx

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import {
  User, Briefcase, GraduationCap, Languages, MapPin, Mail, Phone,
  Loader2, ArrowLeft, Home, Building2, Calendar, FileText, Download,
  Sparkles, Zap, Shield, Activity, Crown, ChevronRight,
  Award, Star, Globe, Linkedin, Twitter, Facebook,
  Instagram, Youtube, CheckCircle2, AlertCircle, Eye,
  Share2, Heart, Bookmark, ExternalLink, TrendingUp,
  Users, Clock, DollarSign, Link2, Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// ==========================================================
// ANIMATION VARIANTS
// ==========================================================

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const statCardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 17 } },
};

// ==========================================================
// STAT CARD — Style Light
// ==========================================================

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string; bar: string }> = {
    amber: {
      bg: 'bg-[#FCD34D]/10',
      text: 'text-[#B88400]',
      iconBg: 'bg-[#FCD34D]/20 text-[#B88400]',
      bar: 'from-[#FCD34D]',
    },
    emerald: {
      bg: 'bg-[#16A34A]/10',
      text: 'text-[#16A34A]',
      iconBg: 'bg-[#16A34A]/10 text-[#16A34A]',
      bar: 'from-[#16A34A]',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600',
      iconBg: 'bg-blue-500/10 text-blue-600',
      bar: 'from-blue-500',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600',
      iconBg: 'bg-purple-500/10 text-purple-600',
      bar: 'from-purple-500',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      iconBg: 'bg-rose-500/10 text-rose-600',
      bar: 'from-rose-500',
    },
    slate: {
      bg: 'bg-[#14532D]/10',
      text: 'text-[#14532D]/70',
      iconBg: 'bg-[#14532D]/10 text-[#14532D]/70',
      bar: 'from-[#14532D]/50',
    },
  };

  const c = colorMap[color] || colorMap.emerald;

  return (
    <motion.div
      variants={statCardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="relative group bg-white border border-[#16A34A]/10 p-3 sm:p-4 rounded-2xl transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] cursor-pointer overflow-hidden"
    >
      <div className={`absolute -top-20 -right-20 w-40 h-40 ${c.bg} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#14532D]/50 truncate">
            {title}
          </span>
          <div className={`p-1.5 rounded-xl ${c.iconBg} group-hover:scale-110 transition-transform duration-300 shrink-0`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-[#14532D] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-[10px] text-[#14532D]/50 line-clamp-1">{subtitle}</div>
        )}
        <div className={`mt-2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${c.bar} to-transparent transition-all duration-700`} />
      </div>
    </motion.div>
  );
};

// ==========================================================
// LEVEL BADGE
// ==========================================================

const LevelBadge = ({ level }: { level: string }) => {
  const levels = {
    basic: {
      label: 'Notions',
      color: 'text-[#14532D]/60 bg-[#14532D]/5 border-[#14532D]/10',
    },
    intermediate: {
      label: 'Intermédiaire',
      color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    },
    fluent: {
      label: 'Courant',
      color: 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/20',
    },
    native: {
      label: 'Maternelle',
      color: 'text-[#B88400] bg-[#FCD34D]/15 border-[#FCD34D]/30',
    },
  };

  const config = levels[level as keyof typeof levels] || levels.intermediate;

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.color} whitespace-nowrap`}>
      {config.label}
    </span>
  );
};

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export const PublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
  // QUERIES
  // ==========================================================

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: async () => {
      const response = await apiClient.get(`/profile/${id}/`);
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleDownload = async (docId: number, filename: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Vous devez être connecté pour télécharger');
        return;
      }

      const response = await fetch(`/api/v1/documents/${docId}/download/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Téléchargement réussi !');
    } catch (error: any) {
      console.error('Erreur de téléchargement:', error);
      toast.error(error.message || 'Impossible de télécharger le document');
    }
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/profile/${id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSaveProfile = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Profil retiré des favoris' : 'Profil ajouté aux favoris ❤️');
  };

  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate('/');

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-[#16A34A]" />
        <p className="text-xs sm:text-sm text-[#14532D]/60">Chargement du profil...</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#16A34A]/50"
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

  if (error || !profile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto px-3 sm:px-4 py-12"
      >
        <div className="bg-white border border-rose-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center shadow-[0_12px_32px_-8px_rgba(244,63,94,0.1)]">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20"
          >
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
          </motion.div>
          <p className="text-base sm:text-lg font-semibold text-[#14532D]">Profil non trouvé</p>
          <p className="text-xs sm:text-sm text-[#14532D]/60 mt-2">
            Le profil que vous recherchez n'existe pas ou est inaccessible.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="mt-6 px-6 sm:px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] hover:shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all duration-300 text-xs sm:text-sm"
          >
            Retour
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const stats = {
    experiences: profile.experiences?.length || 0,
    education: profile.education?.length || 0,
    languages: profile.languages?.length || 0,
    skills: profile.skills?.length || 0,
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative space-y-4 sm:space-y-6"
    >
      {/* Background decoration with parallax — Style Light */}
      <div className="fixed inset-0 -z-10 bg-[#F0FDF4] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-soft opacity-40" />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[300px] sm:h-[400px] bg-[#16A34A]/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 50 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#FCD34D]/10 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 15,
            y: -mousePosition.y * 15,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 50 }}
        />
        <motion.div
          className="absolute top-1/2 left-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-[#16A34A]/5 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 10,
            y: mousePosition.y * 10,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 50 }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="group flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[#16A34A]/15 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-[#14532D]/70 transition-all duration-300 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#14532D] hover:shadow-[0_4px_12px_-2px_rgba(22,163,74,0.15)]"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Retour</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="group flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#16A34A]/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-[#16A34A] transition-all duration-300 hover:bg-[#16A34A]/20 hover:text-[#15803D] border border-[#16A34A]/20 hover:border-[#16A34A]/40 hover:shadow-[0_4px_12px_-2px_rgba(22,163,74,0.2)]"
            >
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden sm:inline">Accueil</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white px-3 sm:px-4 py-1.5 border border-[#16A34A]/15 self-start sm:self-auto shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)]">
            <div className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[10px] sm:text-xs text-[#14532D]/60 font-medium">Profil public</span>
            <Eye className="w-3 h-3 text-[#16A34A]" />
          </div>
        </motion.div>

        {/* ======================================================
            EN-TÊTE DU PROFIL
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#16A34A]/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.12)] transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-2xl sm:text-4xl font-bold text-white shadow-[0_8px_20px_-4px_rgba(22,163,74,0.35)] shrink-0"
            >
              {profile.first_name?.[0] || profile.email?.[0] || 'C'}
            </motion.div>

            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#14532D] break-words">
                  {profile.first_name || ''} {profile.last_name || ''}
                </h1>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-[#16A34A]/10 text-[#16A34A] rounded-full border border-[#16A34A]/20 shrink-0"
                >
                  CANDIDAT
                </motion.span>
              </div>
              <p className="text-xs sm:text-sm text-[#14532D]/60 flex items-center justify-center sm:justify-start gap-2 mt-1 min-w-0">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-2 mt-3 text-[10px] sm:text-sm text-[#14532D]/60">
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#14532D]/40 shrink-0" />
                    {profile.phone}
                  </span>
                )}
                {(profile.city || profile.country) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A] shrink-0" />
                    <span className="truncate">
                      {[profile.city, profile.country || 'Niger'].filter(Boolean).join(', ')}
                    </span>
                  </span>
                )}
                {profile.created_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#14532D]/40 shrink-0" />
                    Membre depuis{' '}
                    {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {profile.bio && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 p-3 sm:p-4 bg-[#F0FDF4] rounded-xl border border-[#16A34A]/10"
                >
                  <p className="text-xs sm:text-sm text-[#14532D]/75 leading-relaxed">
                    {profile.bio}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#16A34A]/10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveProfile}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm ${
                isSaved
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  : 'bg-[#14532D]/5 text-[#14532D]/70 hover:text-[#14532D] hover:bg-[#14532D]/10'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
              <span>{isSaved ? 'Sauvegardé' : 'Sauvegarder'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyProfileLink}
              className="p-2 sm:p-2.5 rounded-xl bg-[#14532D]/5 text-[#14532D]/70 hover:text-[#14532D] hover:bg-[#14532D]/10 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm"
            >
              {isCopied ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A]" />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span>{isCopied ? 'Copié !' : 'Copier le lien'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-2.5 rounded-xl bg-[#14532D]/5 text-[#14532D]/70 hover:text-[#14532D] hover:bg-[#14532D]/10 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm sm:ml-auto"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Partager</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ======================================================
            STATISTIQUES
        ====================================================== */}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <StatCard title="Expériences" value={stats.experiences} icon={Briefcase} color="amber" />
          <StatCard title="Formations" value={stats.education} icon={GraduationCap} color="blue" />
          <StatCard title="Langues" value={stats.languages} icon={Languages} color="purple" />
          <StatCard title="Compétences" value={stats.skills} icon={Star} color="emerald" />
        </motion.div>

        {/* ======================================================
            COMPÉTENCES
        ====================================================== */}

        {profile.skills && profile.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-[#16A34A]/10 rounded-2xl p-4 sm:p-6 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.12)] transition-all duration-300"
          >
            <h2 className="text-[10px] sm:text-sm font-semibold text-[#14532D]/60 uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A]" />
              Compétences
            </h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {profile.skills.map((skill: any) => (
                <motion.span
                  key={skill.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-2.5 sm:px-4 py-1 sm:py-2 bg-[#F0FDF4] border border-[#16A34A]/15 rounded-xl text-[10px] sm:text-sm text-[#14532D]/80 hover:border-[#16A34A]/40 hover:text-[#16A34A] transition-all duration-300"
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================================================
            EXPÉRIENCES
        ====================================================== */}

        {profile.experiences && profile.experiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-[#16A34A]/10 rounded-2xl p-4 sm:p-6 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.12)] transition-all duration-300"
          >
            <h2 className="text-[10px] sm:text-sm font-semibold text-[#14532D]/60 uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A]" />
              Expériences professionnelles
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {profile.experiences.map((exp: any, index: number) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#16A34A]/10 pb-3 sm:pb-4 last:border-0 last:pb-0 group hover:bg-[#F0FDF4]/60 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#14532D] group-hover:text-[#16A34A] transition-colors text-sm sm:text-base break-words">
                        {exp.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#16A34A] break-words">{exp.company}</p>
                    </div>
                    {exp.is_current && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#16A34A]/10 text-[#16A34A] rounded-full border border-[#16A34A]/20 shrink-0">
                        Actuel
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#14532D]/50 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {exp.start_date} - {exp.is_current ? 'Présent' : exp.end_date || 'En cours'}
                    </span>
                    {exp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {exp.location}
                      </span>
                    )}
                  </p>
                  {exp.description && (
                    <p className="text-xs sm:text-sm text-[#14532D]/70 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================================================
            FORMATIONS
        ====================================================== */}

        {profile.education && profile.education.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-[#16A34A]/10 rounded-2xl p-4 sm:p-6 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.12)] transition-all duration-300"
          >
            <h2 className="text-[10px] sm:text-sm font-semibold text-[#14532D]/60 uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A]" />
              Formations
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {profile.education.map((edu: any, index: number) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#16A34A]/10 pb-3 sm:pb-4 last:border-0 last:pb-0 group hover:bg-[#F0FDF4]/60 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#14532D] group-hover:text-[#16A34A] transition-colors text-sm sm:text-base break-words">
                        {edu.degree}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#16A34A] break-words">{edu.institution}</p>
                      {edu.field_of_study && (
                        <p className="text-[10px] sm:text-xs text-[#14532D]/50">
                          {edu.field_of_study}
                        </p>
                      )}
                    </div>
                    {edu.is_current && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#16A34A]/10 text-[#16A34A] rounded-full border border-[#16A34A]/20 shrink-0">
                        En cours
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#14532D]/50 mt-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {edu.start_date} - {edu.is_current ? 'En cours' : edu.end_date || 'Terminé'}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================================================
            LANGUES
        ====================================================== */}

        {profile.languages && profile.languages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-[#16A34A]/10 rounded-2xl p-4 sm:p-6 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.12)] transition-all duration-300"
          >
            <h2 className="text-[10px] sm:text-sm font-semibold text-[#14532D]/60 uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A]" />
              Langues
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {profile.languages.map((lang: any) => (
                <motion.div
                  key={lang.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#F0FDF4] p-2.5 sm:p-3 rounded-xl border border-[#16A34A]/15 hover:border-[#16A34A]/40 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#14532D] text-xs sm:text-base truncate">
                      {lang.name}
                    </span>
                    <LevelBadge level={lang.level} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================================================
            DOCUMENTS
        ====================================================== */}

        {profile.documents && profile.documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-[#16A34A]/10 rounded-2xl p-4 sm:p-6 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.12)] transition-all duration-300"
          >
            <h2 className="text-[10px] sm:text-sm font-semibold text-[#14532D]/60 uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A]" />
              Documents
            </h2>
            <div className="space-y-2">
              {profile.documents.map((doc: any) => (
                <motion.button
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleDownload(doc.id, doc.original_filename)}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3.5 bg-[#F0FDF4] rounded-xl border border-[#16A34A]/15 hover:border-[#16A34A]/40 transition-all duration-300 group cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-[#16A34A]/10 shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A]" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <span className="text-xs sm:text-sm text-[#14532D] group-hover:text-[#16A34A] transition-colors block truncate">
                        {doc.original_filename}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] sm:text-[10px] uppercase text-[#14532D]/50 bg-[#14532D]/5 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                          {doc.document_type === 'cv' ? 'CV' : doc.document_type}
                        </span>
                        {doc.file_size && (
                          <span className="text-[9px] sm:text-[10px] text-[#14532D]/50">
                            {(doc.file_size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-1.5 sm:gap-2 text-[#14532D]/60 group-hover:text-[#16A34A] transition-colors shrink-0"
                  >
                    <span className="text-[10px] sm:text-xs font-medium hidden xs:inline">
                      Télécharger
                    </span>
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-[10px] sm:text-xs text-[#14532D]/50"
        >
          <div className="flex flex-wrap items-center justify-center xs:justify-start gap-2 sm:gap-4">
            <span className="text-[#14532D]/60 truncate max-w-[200px] sm:max-w-none">
              <span className="text-[#16A34A] font-medium">
                {profile.first_name || 'Candidat'}
              </span>{' '}
              • Profil public
            </span>
            <span className="hidden xs:block w-px h-4 bg-[#16A34A]/10" />
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#16A34A]" />
              <span className="text-[#16A34A]/80">Sécurisé - Niger</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#16A34A]" />
              Niger v1.0.0
            </span>
            <span className="w-px h-4 bg-[#16A34A]/10" />
            <span>Profil public</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default PublicProfilePage;