// src/pages/CandidateDashboard.tsx

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';
import { jobsApi } from '../api/jobs';
import { profileApi } from '../api/profile';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Building2, 
  ChevronRight,
  TrendingUp,
  FileText,
  Loader2,
  MapPin,
  AlertCircle,
  Eye,
  Bookmark,
  ArrowRight,
  Calendar,
  Users,
  LayoutGrid,
  List,
  Sparkles,
  Award,
  Zap,
  Star,
  Shield,
  Activity,
  Home,
  Bell,
  Settings,
  HelpCircle,
  Crown,
  Globe,
  Linkedin,
  Mail,
  Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Application, PaginatedResponse, CandidateProfile, JobPosting } from '../types';
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

const statCardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }
};

const tableRowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  hover: { backgroundColor: "rgba(255,255,255,0.03)" }
};

// ==========================================================
// COMPONENTS
// ==========================================================

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
  <motion.div
    variants={statCardVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
    className="relative group bg-slate-900/80 border border-slate-800 p-5 rounded-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer overflow-hidden"
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
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black text-white tracking-tight">
          {value}
        </span>
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
      )}
      <div className="mt-3 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-${color}-500 to-transparent transition-all duration-700" />
    </div>
  </motion.div>
);

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

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'applications' | 'jobs'>('jobs');
  const [jobFilter, setJobFilter] = useState<string>('all');
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

  const { data: applicationsData, isLoading: isLoadingApps } = useQuery<PaginatedResponse<Application>>({
    queryKey: ['myApplications', 'all'],
    queryFn: async () => {
      const allResults: Application[] = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 50;

      while (hasMore) {
        const response = await applicationsApi.getMyApplications({ 
          page, 
          page_size: pageSize 
        });
        allResults.push(...response.data.results);
        hasMore = !!response.data.next;
        page++;
      }

      return {
        count: allResults.length,
        next: null,
        previous: null,
        results: allResults,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: jobsData, isLoading: isLoadingJobs } = useQuery<PaginatedResponse<JobPosting>>({
    queryKey: ['jobs', 'all'],
    queryFn: async () => {
      const allResults: JobPosting[] = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 50;

      while (hasMore) {
        const response = await jobsApi.getList({ 
          page, 
          page_size: pageSize 
        });
        allResults.push(...response.data.results);
        hasMore = !!response.data.next;
        page++;
      }

      return {
        count: allResults.length,
        next: null,
        previous: null,
        results: allResults,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery<CandidateProfile>({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile().then((res) => res.data),
  });

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const allApplications = applicationsData?.results || [];
  const activeApplications = allApplications.filter(app => app.status !== 'withdrawn');
  const allJobs = jobsData?.results || [];

  const stats = {
    totalApplications: activeApplications.length,
    inReview: activeApplications.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
    interviewsCount: activeApplications.filter(a => a.status === 'shortlisted' || a.status === 'interview').length,
    acceptedCount: activeApplications.filter(a => a.status === 'accepted').length,
  };

  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.organization_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || 
                           (job.city || '').toLowerCase().includes(locationFilter.toLowerCase());
    const matchesStatus = jobFilter === 'all' || job.status === jobFilter;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoadingApps || isLoadingJobs || isLoadingProfile) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Chargement de votre tableau de bord...</p>
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

      {/* ========================================================== */}
      {/* EN-TÊTE */}
      {/* ========================================================== */}

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-2xl shadow-lg shadow-amber-500/10">
              {profile?.first_name?.[0] || profile?.last_name?.[0] || 'C'}
            </div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950"
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
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              Bonjour {profile?.first_name || 'Candidat'} 👋
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 rounded-full"
              >
                CANDIDAT
              </motion.span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              {profile?.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  {profile?.city}{profile?.country ? `, ${profile.country}` : ''}
                </span>
              )}
              {profile?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                En ligne
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-300"
          >
            <Bell className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-4 py-1.5 border border-slate-800">
            <Crown className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-slate-500 font-medium">Dashboard</span>
          </div>
        </div>
      </motion.div>

      {/* ========================================================== */}
      {/* STATISTIQUES RAPIDES */}
      {/* ========================================================== */}

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard 
          title="Candidatures" 
          value={stats.totalApplications} 
          icon={Briefcase} 
          color="amber"
          subtitle={`${activeApplications.length} actives`}
          trend={12}
        />
        <StatCard 
          title="En cours" 
          value={stats.inReview} 
          icon={Clock} 
          color="blue"
          subtitle="En attente de réponse"
          trend={-3}
        />
        <StatCard 
          title="Entretiens" 
          value={stats.interviewsCount} 
          icon={Users} 
          color="purple"
          subtitle="Présélections"
          trend={25}
        />
        <StatCard 
          title="Acceptées" 
          value={stats.acceptedCount} 
          icon={Award} 
          color="emerald"
          subtitle="Félicitations ! 🎉"
          trend={8}
        />
      </motion.div>

      {/* ========================================================== */}
      {/* ONGLETS : Offres | Candidatures */}
      {/* ========================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('jobs')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            viewMode === 'jobs'
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Offres disponibles
          <span className="text-xs opacity-60">({allJobs.length})</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setViewMode('applications')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            viewMode === 'applications'
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <List className="w-4 h-4" />
          Mes candidatures
          <span className="text-xs opacity-60">({activeApplications.length})</span>
        </motion.button>
      </motion.div>

      {/* ========================================================== */}
      {/* VUE 1 : TOUTES LES OFFRES */}
      {/* ========================================================== */}

      <AnimatePresence mode="wait">
        {viewMode === 'jobs' && (
          <motion.div
            key="jobs"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
                <input
                  type="text"
                  placeholder="Rechercher un poste, une entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/80 text-white text-sm pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>
              <div className="relative sm:w-48 group">
                <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
                <input
                  type="text"
                  placeholder="Ville, pays..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-slate-900/80 text-white text-sm pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 placeholder:text-slate-600"
                />
              </div>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full sm:w-44 bg-slate-900/80 text-slate-300 text-sm px-4 py-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 cursor-pointer hover:border-slate-700"
              >
                <option value="all">📊 Tous les statuts</option>
                <option value="active">✅ Actives</option>
                <option value="published">🚀 Publiées</option>
                <option value="closed">🔒 Fermées</option>
              </select>
            </div>

            {/* Liste des offres */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    variants={tableRowVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.03 }}
                    whileHover="hover"
                    className="group bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800/60 hover:border-amber-500/30 p-5 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors duration-300">
                                {job.title}
                              </h3>
                              {job.is_urgent && (
                                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">
                              {job.organization_name || 'Entreprise'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                              {job.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {job.city}{job.country ? `, ${job.country}` : ''}
                                </span>
                              )}
                              {job.is_remote && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  Télétravail
                                </span>
                              )}
                              {job.salary_min && job.salary_max && (
                                <span className="flex items-center gap-1 text-amber-400">
                                  💰 {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} FCFA
                                </span>
                              )}
                              {job.application_deadline && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(job.application_deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center gap-2 group/btn"
                        >
                          Voir l'offre
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-all duration-300"
                          title="Sauvegarder"
                        >
                          <Bookmark className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  variants={fadeInScale}
                  className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-lg font-semibold text-white">Aucune offre trouvée</p>
                  <p className="text-sm text-slate-400 mt-1">Essayez de modifier vos critères de recherche</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* VUE 2 : MES CANDIDATURES */}
        {/* ========================================================== */}

        {viewMode === 'applications' && (
          <motion.div
            key="applications"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {/* En-tête des candidatures */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  {activeApplications.length} candidature{activeApplications.length > 1 ? 's' : ''} active
                  {allApplications.length > activeApplications.length && (
                    <span className="text-slate-500 ml-2">
                      ({allApplications.length - activeApplications.length} retirée{allApplications.length - activeApplications.length > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
                {stats.acceptedCount > 0 && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {stats.acceptedCount} acceptée{stats.acceptedCount > 1 ? 's' : ''} 🎉
                  </span>
                )}
              </div>
              <Link
                to="/applications"
                className="text-sm text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 group hover:gap-2 transition-all"
              >
                Voir toutes
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Liste des candidatures actives */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {activeApplications.length > 0 ? (
                activeApplications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    variants={tableRowVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.05 }}
                    whileHover="hover"
                    className="group bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800/60 hover:border-amber-500/30 p-5 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors duration-300">
                            {app.job_details?.title || app.opportunity_title || 'Offre d\'emploi'}
                          </h3>
                          <StatusBadge status={app.status} />
                          {app.status === 'shortlisted' && (
                            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Présélection
                            </span>
                          )}
                          {app.status === 'interview' && (
                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1">
                              <Users className="w-3 h-3" /> Entretien
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            {app.job_details?.organization_name || app.organization_name || 'Entreprise'}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Postulé le {new Date(app.submitted_at || app.applied_at || app.created_at || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {app.cover_note && (
                          <p className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 mt-2 max-w-xl line-clamp-2">
                            "{app.cover_note}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            to={`/jobs/${app.opportunity}`}
                            className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all duration-300 flex items-center gap-1.5 group/link"
                          >
                            <Eye className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                            Voir l'offre
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  variants={fadeInScale}
                  className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-lg font-semibold text-white">Aucune candidature active</p>
                  <p className="text-sm text-slate-400 mt-1">Vous n'avez pas encore postulé à des offres</p>
                  <Link 
                    to="/jobs" 
                    className="inline-block mt-4 text-amber-400 hover:text-amber-300 font-semibold text-sm hover:underline transition-all"
                  >
                    Commencer à postuler →
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* FOOTER */}
      {/* ========================================================== */}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/50 text-xs text-slate-600"
      >
        <div className="flex items-center gap-4">
          <span className="text-slate-500">
            <span className="text-amber-400 font-medium">{profile?.first_name || 'Candidat'}</span> • Tableau de bord
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
          <span>Dashboard Candidat</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CandidateDashboard;