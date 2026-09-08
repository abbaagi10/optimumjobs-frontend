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
  Users, Clock, DollarSign, Link2, Copy
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

const statCardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }
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
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-1.5 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">
        {value}
      </div>
      {subtitle && (
        <div className="mt-0.5 text-[10px] text-slate-500">{subtitle}</div>
      )}
      <div className="mt-2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-${color}-500 to-transparent transition-all duration-700" />
    </div>
  </motion.div>
);

const LevelBadge = ({ level }: { level: string }) => {
  const levels = {
    basic: { label: 'Notions', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
    intermediate: { label: 'Intermédiaire', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    fluent: { label: 'Courant', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    native: { label: 'Maternelle', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  };

  const config = levels[level as keyof typeof levels] || levels.intermediate;

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.color}`}>
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
          'Authorization': `Bearer ${token}`
        }
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
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <div className="bg-slate-900/80 border border-rose-500/20 rounded-3xl p-12 text-center backdrop-blur-xl">
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
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20"
          >
            <User className="w-10 h-10 text-rose-400" />
          </motion.div>
          <p className="text-lg font-semibold text-white">Profil non trouvé</p>
          <p className="text-sm text-slate-400 mt-2">Le profil que vous recherchez n'existe pas ou est inaccessible.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
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

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* ======================================================
            NAVIGATION
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

          <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-4 py-1.5 border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Profil public</span>
            <Eye className="w-3 h-3 text-amber-400" />
          </div>
        </motion.div>

        {/* ======================================================
            EN-TÊTE DU PROFIL
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-center text-4xl font-bold text-amber-400 shadow-xl shadow-amber-500/10 shrink-0"
            >
              {profile.first_name?.[0] || profile.email?.[0] || 'C'}
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-extrabold text-white">
                  {profile.first_name || ''} {profile.last_name || ''}
                </h1>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20"
                >
                  CANDIDAT
                </motion.span>
              </div>
              <p className="text-sm text-slate-400 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-slate-400">
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-500" />
                    {profile.phone}
                  </span>
                )}
                {(profile.city || profile.country) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {profile.created_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>

              {profile.bio && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800"
                >
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {profile.bio}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-6 pt-6 border-t border-slate-800">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveProfile}
              className={`p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm ${
                isSaved 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
              {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyProfileLink}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              {isCopied ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {isCopied ? 'Copié !' : 'Copier le lien'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 flex items-center gap-2 text-sm ml-auto"
            >
              <Share2 className="w-4 h-4" />
              Partager
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
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
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-400" />
              Compétences
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: any) => (
                <motion.span
                  key={skill.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-300 hover:border-amber-500/30 hover:text-amber-400 transition-all duration-300"
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
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-amber-400" />
              Expériences professionnelles
            </h2>
            <div className="space-y-4">
              {profile.experiences.map((exp: any, index: number) => (
                <motion.div 
                  key={exp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800 pb-4 last:border-0 last:pb-0 group hover:bg-slate-800/20 px-3 -mx-3 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-sm text-amber-400">{exp.company}</p>
                    </div>
                    {exp.is_current && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        Actuel
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <Calendar className="w-3 h-3" />
                    {exp.start_date} - {exp.is_current ? 'Présent' : exp.end_date || 'En cours'}
                    {exp.location && <span>• <MapPin className="w-3 h-3 inline" /> {exp.location}</span>}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
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
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              Formations
            </h2>
            <div className="space-y-4">
              {profile.education.map((edu: any, index: number) => (
                <motion.div 
                  key={edu.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800 pb-4 last:border-0 last:pb-0 group hover:bg-slate-800/20 px-3 -mx-3 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {edu.degree}
                      </h3>
                      <p className="text-sm text-amber-400">{edu.institution}</p>
                      {edu.field_of_study && (
                        <p className="text-xs text-slate-500">{edu.field_of_study}</p>
                      )}
                    </div>
                    {edu.is_current && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        En cours
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <Calendar className="w-3 h-3" />
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
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Languages className="w-4 h-4 text-amber-400" />
              Langues
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.languages.map((lang: any) => (
                <motion.div 
                  key={lang.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{lang.name}</span>
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
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-amber-400" />
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
                  className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <FileText className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm text-white group-hover:text-amber-400 transition-colors">
                        {doc.original_filename}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                          {doc.document_type === 'cv' ? 'CV' : doc.document_type}
                        </span>
                        {doc.file_size && (
                          <span className="text-[10px] text-slate-500">
                            {(doc.file_size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 text-slate-400 group-hover:text-amber-400 transition-colors"
                  >
                    <span className="text-xs font-medium">Télécharger</span>
                    <Download className="w-4 h-4" />
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
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/50 text-xs text-slate-600"
        >
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              <span className="text-amber-400 font-medium">{profile.first_name || 'Candidat'}</span> • Profil public
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
            <span>Profil public</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default PublicProfilePage;