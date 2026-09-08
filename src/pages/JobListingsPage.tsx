// src/pages/JobListingsPage.tsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/jobs';
import { applicationsApi } from '../api/applications';
import { documentsApi } from '../api/documents';
import { JobPosting, PaginatedResponse } from '../types';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  Search, MapPin, Briefcase, Building2, Clock, Send, 
  X, Loader2, DollarSign, ArrowLeft, Home,
  Sparkles, Zap, Shield, Activity, Crown, ChevronRight,
  Globe, Calendar, Users, Award, Star, Eye,
  Filter, Grid3x3, List, TrendingUp, Heart,
  Share2, Bookmark, CheckCircle2, AlertCircle
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

const tableRowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  hover: { backgroundColor: "rgba(255,255,255,0.03)" }
};

// ==========================================================
// COMPOSANTS
// ==========================================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { icon: JSX.Element; label: string; className: string; dotColor: string }> = {
    'active': {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Active',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-400 animate-pulse'
    },
    'pending_review': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En attente',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-400'
    },
    'closed': {
      icon: <X className="w-3 h-3" />,
      label: 'Fermée',
      className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      dotColor: 'bg-slate-400'
    },
    'published': {
      icon: <Sparkles className="w-3 h-3" />,
      label: 'Publiée',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-400'
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.icon}
      {config.label}
    </motion.span>
  );
};

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

const JobListingsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'recent' | 'salary' | 'deadline'>('recent');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

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

  const { data: jobsData, isLoading: isJobsLoading, refetch } = useQuery<PaginatedResponse<JobPosting>>({
    queryKey: ['jobs', search, location],
    queryFn: () => jobsApi.getList({ search, location }).then((res) => res.data),
  });

  const { data: documents, isLoading: isDocsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getList().then((res) => res.data),
    enabled: !!selectedJob && isAuthenticated && user?.role === 'candidate',
  });

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const applyMutation = useMutation({
    mutationFn: (data: { opportunityId: number; cover_note?: string }) =>
      applicationsApi.apply(data.opportunityId, {
        cover_note: data.cover_note,
      }),
    onSuccess: () => {
      toast.success('Candidature envoyée avec succès ! 🎉');
      setIsApplyModalOpen(false);
      setSelectedJob(null);
      setCoverNote('');
      setSelectedDocId(null);
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Erreur lors de la candidature');
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  const handleApply = (job: JobPosting) => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour postuler');
      return;
    }
    if (user?.role !== 'candidate') {
      toast.error('Seuls les candidats peuvent postuler');
      return;
    }
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleSaveJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
    toast.success(savedJobs.includes(jobId) ? 'Offre retirée des favoris' : 'Offre ajoutée aux favoris ❤️');
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    refetch();
  };

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const jobs = jobsData?.results || [];

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'salary') {
      const aSalary = a.salary_max || 0;
      const bSalary = b.salary_max || 0;
      return bSalary - aSalary;
    }
    if (sortBy === 'deadline') {
      if (!a.application_deadline) return 1;
      if (!b.application_deadline) return -1;
      return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
    }
    return 0;
  });

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

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

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
            <span className="text-xs text-slate-500 font-medium">Offres d'emploi</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
        </motion.div>

        {/* ======================================================
            BARRE DE RECHERCHE
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl hover:border-slate-700 transition-all duration-300 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                Trouvez votre prochaine opportunité
                <span className="text-xs font-normal text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                  {jobs.length} offres
                </span>
              </h1>
              <p className="text-sm text-slate-400">Découvrez les meilleures offres d'emploi</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
              <input
                type="text"
                placeholder="Titre du poste, mots-clés..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 text-white pl-12 pr-4 py-3.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 placeholder:text-slate-600"
              />
            </div>

            <div className="relative group">
              <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
              <input
                type="text"
                placeholder="Ville, pays ou Télétravail..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950/80 text-white pl-12 pr-4 py-3.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 placeholder:text-slate-600"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Rechercher</span>
            </motion.button>
          </form>

          {/* Filtres et tris */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'salary' | 'deadline')}
                className="bg-slate-950/80 text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-xs cursor-pointer hover:border-slate-700"
              >
                <option value="recent">📅 Plus récentes</option>
                <option value="salary">💰 Salaire élevé</option>
                <option value="deadline">⏳ Date limite</option>
              </select>
              
              {(search || location) && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={handleResetFilters}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Réinitialiser
                </motion.button>
              )}
            </div>

            <div className="flex gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25' : 'text-slate-500 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25' : 'text-slate-500 hover:text-white'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ======================================================
            LISTE DES OFFRES
        ====================================================== */}

        <AnimatePresence mode="wait">
          {isJobsLoading ? (
            <motion.div 
              key="loading"
              variants={fadeInScale}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex justify-center py-20"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
                <p className="text-sm text-slate-400">Chargement des offres...</p>
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
          ) : sortedJobs.length === 0 ? (
            <motion.div 
              key="empty"
              variants={fadeInScale}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-lg font-semibold text-white">Aucune offre ne correspond à vos critères</p>
              <p className="text-sm text-slate-400 mt-1">Essayez de modifier vos filtres de recherche</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetFilters}
                className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors inline-flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser les filtres
              </motion.button>
            </motion.div>
          ) : viewMode === 'list' ? (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {sortedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  variants={tableRowVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.03 }}
                  whileHover="hover"
                  className="group bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <Link to={`/jobs/${job.id}`} className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                        {job.title}
                      </h2>
                      <StatusBadge status={job.status} />
                      {job.is_urgent && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Urgent
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                        {job.organization_name || 'Entreprise'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        {job.city || job.location || 'Non spécifié'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {job.salary_min && job.salary_max && (
                        <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                          <TrendingUp className="w-4 h-4" />
                          {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} FCFA
                        </span>
                      )}
                      {job.is_remote && (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Globe className="w-3 h-3" />
                          Télétravail
                        </span>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-sm text-slate-400 line-clamp-2 group-hover:text-slate-300 transition-colors">
                        {job.description}
                      </p>
                    )}
                  </Link>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all duration-300 flex items-center gap-1.5 group/link"
                      >
                        <Eye className="w-4 h-4 group-hover/link:scale-110 transition-transform" />
                        Voir
                      </Link>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSaveJob(job.id)}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        savedJobs.includes(job.id)
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                      }`}
                      title={savedJobs.includes(job.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-rose-400' : ''}`} />
                    </motion.button>

                    {job.status === 'active' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApply(job)}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl transition-all duration-300 text-sm flex items-center gap-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25"
                      >
                        <Send className="w-4 h-4" />
                        Postuler
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {sortedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  variants={tableRowVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(251, 191, 36, 0.3)' }}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                      {job.title}
                    </h4>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" />
                    {job.organization_name || 'Entreprise'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {job.city || job.location || 'Non spécifié'}
                  </p>
                  {job.salary_min && job.salary_max && (
                    <p className="text-xs text-amber-400 mt-1 font-medium">
                      💰 {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} FCFA
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="flex-1 text-center px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                    >
                      Voir
                    </Link>
                    {job.status === 'active' && (
                      <button
                        onClick={() => handleApply(job)}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                      >
                        Postuler
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================
            MODAL DE CANDIDATURE
        ====================================================== */}

        <AnimatePresence>
          {isApplyModalOpen && selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900/95 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Send className="w-5 h-5 text-amber-400" />
                      Postuler à l'offre
                    </h3>
                    <p className="text-sm font-semibold text-amber-400 mt-1">{selectedJob.title}</p>
                    <p className="text-xs text-slate-400">{selectedJob.organization_name}</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsApplyModalOpen(false);
                      setSelectedJob(null);
                    }} 
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyMutation.mutate({
                      opportunityId: selectedJob.id,
                      cover_note: coverNote,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      CV / Document
                    </label>
                    {isDocsLoading ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Chargement de vos documents...</span>
                      </div>
                    ) : documents && documents.length > 0 ? (
                      <select
                        value={selectedDocId || ''}
                        onChange={(e) => setSelectedDocId(Number(e.target.value))}
                        className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                      >
                        <option value="">Sélectionner un document...</option>
                        {documents.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.original_filename} ({doc.document_type})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-xs text-amber-400/80">
                          Aucun CV trouvé. Téléversez-en un depuis votre profil.
                        </p>
                        <Link to="/profile" className="inline-block mt-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                          Aller au profil →
                        </Link>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Lettre de motivation
                    </label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Présentez brièvement votre profil et vos motivations..."
                      className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 resize-none placeholder:text-slate-600"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                      Optionnel - Laissez vide si vous n'avez pas de lettre de motivation.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setIsApplyModalOpen(false);
                        setSelectedJob(null);
                      }}
                      className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={applyMutation.isPending}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {applyMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Confirmer la candidature
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <span className="text-amber-400 font-medium">{jobs.length}</span> offres disponibles
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
            <span>Liste des offres</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default JobListingsPage;