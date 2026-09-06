// src/pages/JobDetailPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import { applicationsApi } from '../api/applications';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Loader2, 
  Building2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  ArrowLeft,
  Home,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Users,
  DollarSign,
  Globe,
  FileText,
  Send,
  Check,
  XCircle,
  Sparkles,
  Zap,
  Shield,
  Activity,
  Crown,
  ChevronRight,
  Star,
  Heart,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  Mail,
  Phone,
  Link2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
// COMPOSANTS
// ==========================================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { icon: JSX.Element; label: string; className: string; dotColor: string }> = {
    'submitted': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En attente',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-400 animate-pulse'
    },
    'under_review': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En révision',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      dotColor: 'bg-blue-400'
    },
    'shortlisted': {
      icon: <Star className="w-3 h-3" />,
      label: 'Présélectionné',
      className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      dotColor: 'bg-purple-400'
    },
    'interview': {
      icon: <Users className="w-3 h-3" />,
      label: 'Entretien',
      className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      dotColor: 'bg-indigo-400'
    },
    'accepted': {
      icon: <Award className="w-3 h-3" />,
      label: 'Accepté',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-400'
    },
    'rejected': {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Refusé',
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-400'
    },
    'withdrawn': {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Retiré',
      className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      dotColor: 'bg-slate-400'
    }
  };

  const config = statusMap[status] || {
    icon: null,
    label: status,
    className: 'bg-slate-800 text-slate-400 border-slate-700',
    dotColor: 'bg-slate-400'
  };

  return (
    <motion.span 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.icon}
      {config.label}
    </motion.span>
  );
};

const InfoItem = ({ icon: Icon, label, value, color = 'text-slate-400' }: any) => (
  <motion.div 
    variants={fadeInUp}
    className="flex items-center gap-3 py-2.5 border-b border-slate-800/50 last:border-0 group hover:bg-slate-800/20 px-3 -mx-3 rounded-lg transition-colors duration-200"
  >
    <div className={`p-1.5 rounded-lg bg-${color.replace('text-', '')}/10`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <span className="text-sm text-slate-300 flex-1">{label}</span>
    <span className="text-sm text-white font-medium text-right group-hover:text-amber-400 transition-colors">
      {value}
    </span>
  </motion.div>
);

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coverNote, setCoverNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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
  // QUERIES
  // ==========================================================

  const { data: job, isLoading: isLoadingJob, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(Number(id)).then(res => res.data),
    enabled: !!id,
  });

  const { data: applications, isLoading: isLoadingApps } = useQuery({
    queryKey: ['jobApplications', id],
    queryFn: async () => {
      const response = await applicationsApi.getMyApplications();
      const apps = response.data.results || [];
      return apps.filter((app: any) => app.opportunity === Number(id));
    },
    enabled: !!id,
  });

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const applyMutation = useMutation({
    mutationFn: (data: { cover_note?: string }) => 
      applicationsApi.apply(Number(id), data),
    onSuccess: () => {
      toast.success('Candidature envoyée avec succès ! 🎉');
      setCoverNote('');
      setIsApplying(false);
      queryClient.invalidateQueries({ queryKey: ['jobApplications', id] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['myApplications', 'all'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message ||
                     'Erreur lors de la candidature';
      toast.error(message);
      setIsApplying(false);
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleApply = () => {
    if (!id) return;
    setIsApplying(true);
    applyMutation.mutate({ cover_note: coverNote });
  };

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/jobs/${id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Lien copié !');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Offre retirée des favoris' : 'Offre ajoutée aux favoris ❤️');
  };

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const existingApplication = applications && applications.length > 0 ? applications[0] : null;
  const hasApplied = !!existingApplication;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoadingJob || isLoadingApps) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Chargement de l'offre...</p>
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

  if (error || !job) {
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
            <Briefcase className="w-10 h-10 text-rose-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Offre non trouvée</h2>
          <p className="text-sm text-slate-400 mt-2">L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoHome}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            Retour à l'accueil
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

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

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
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Détail de l'offre</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
        </motion.div>

        {/* ======================================================
            CONTENU PRINCIPAL
        ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Détails de l'offre */}
          <div className="lg:col-span-2 space-y-6">

            {/* En-tête de l'offre */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 flex-shrink-0"
                >
                  <Building2 className="w-8 h-8" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-extrabold text-white">{job.title}</h1>
                    {job.is_urgent && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Urgent
                      </motion.span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    {job.organization_name || 'Entreprise'}
                  </p>
                  
                  {hasApplied && existingApplication && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex flex-wrap items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <StatusBadge status={existingApplication.status} />
                      <span className="text-xs text-slate-400">
                        Candidature envoyée le {new Date(existingApplication.submitted_at || existingApplication.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveJob}
                  className={`p-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm ${
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
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {isCopied ? 'Copié !' : 'Copier le lien'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 flex items-center gap-2 text-sm ml-auto"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </motion.button>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
            >
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-amber-400" />
                Description du poste
              </h2>
              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                {job.description || 'Aucune description disponible.'}
              </div>
            </motion.div>

            {/* Prérequis */}
            {job.requirements && job.requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
              >
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-amber-400" />
                  Compétences requises
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req: string, index: number) => (
                    <motion.span 
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-300 hover:border-amber-500/30 hover:text-amber-400 transition-all duration-300"
                    >
                      {req}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Colonne de droite - Informations et Candidature */}
          <div className="space-y-6">

            {/* Informations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300 sticky top-24"
            >
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-amber-400" />
                Informations
              </h2>

              <div className="space-y-1">
                {job.city && (
                  <InfoItem 
                    icon={MapPin} 
                    label="Localisation" 
                    value={`${job.city}${job.country ? `, ${job.country}` : ''}`}
                    color="text-amber-400"
                  />
                )}

                {job.is_remote && (
                  <InfoItem 
                    icon={Globe} 
                    label="Télétravail" 
                    value="✅ Oui"
                    color="text-emerald-400"
                  />
                )}

                {job.salary_min && job.salary_max && (
                  <InfoItem 
                    icon={DollarSign} 
                    label="Salaire" 
                    value={`${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} FCFA`}
                    color="text-emerald-400"
                  />
                )}

                {job.contract_type && (
                  <InfoItem 
                    icon={Briefcase} 
                    label="Type de contrat" 
                    value={job.contract_type}
                    color="text-blue-400"
                  />
                )}

                {job.experience_level && (
                  <InfoItem 
                    icon={Users} 
                    label="Niveau d'expérience" 
                    value={job.experience_level}
                    color="text-purple-400"
                  />
                )}

                {job.application_deadline && (
                  <InfoItem 
                    icon={Calendar} 
                    label="Date limite" 
                    value={new Date(job.application_deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    color="text-amber-400"
                  />
                )}

                {job.created_at && (
                  <InfoItem 
                    icon={Calendar} 
                    label="Publiée le" 
                    value={new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    color="text-slate-400"
                  />
                )}
              </div>

              {/* Statistiques */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-slate-950/60 p-3 rounded-xl text-center border border-slate-800 hover:border-amber-500/30 transition-all duration-300"
                  >
                    <p className="text-xs text-slate-500">Candidatures</p>
                    <p className="text-lg font-bold text-white">0</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-slate-950/60 p-3 rounded-xl text-center border border-slate-800 hover:border-amber-500/30 transition-all duration-300"
                  >
                    <p className="text-xs text-slate-500">Vues</p>
                    <p className="text-lg font-bold text-white">0</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Formulaire de candidature */}
            <AnimatePresence mode="wait">
              {!hasApplied ? (
                <motion.div
                  key="apply-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
                >
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Send className="w-4 h-4 text-amber-400" />
                    Postuler
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Lettre de motivation <span className="text-slate-600">(optionnelle)</span>
                      </label>
                      <textarea
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        placeholder="Décrivez brièvement votre motivation et vos compétences..."
                        className="w-full bg-slate-950 text-white px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 min-h-[120px] resize-none placeholder:text-slate-600 text-sm"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleApply}
                      disabled={isApplying}
                      className="w-full px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Postuler maintenant
                        </>
                      )}
                    </motion.button>

                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-2"
                    >
                      <Shield className="w-3 h-3 text-emerald-400" />
                      Vos informations sont sécurisées
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-600">Candidature gratuite</span>
                    </motion.p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="applied"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <motion.div 
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20"
                    >
                      <Check className="w-6 h-6 text-emerald-400" />
                    </motion.div>
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Candidature envoyée
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Vous avez déjà postulé à cette offre le {existingApplication ? new Date(existingApplication.submitted_at || existingApplication.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={existingApplication?.status || 'submitted'} />
                      </div>
                      <Link
                        to="/applications"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors group"
                      >
                        Voir mes candidatures
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <span className="text-amber-400 font-medium">{job.title}</span> • Détail de l'offre
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
              Version 3.0.0
            </span>
            <span className="w-px h-4 bg-slate-800" />
            <span>Détail de l'offre</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default JobDetailPage;