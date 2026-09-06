// src/pages/CandidateApplicationsPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { applicationsApi } from '../api/applications';
import { Application, PaginatedResponse } from '../types';
import { 
  Clock, CheckCircle2, XCircle, FileText, Building2, Loader2, 
  ArrowLeft, Eye, Trash2, AlertCircle, RefreshCw,
  Sparkles, TrendingUp, Award, Star, Zap, Calendar,
  ChevronRight, Filter, Grid3x3, List, Search,
  Bell, Settings, HelpCircle, Activity, Shield,
  Home // <-- AJOUT DE L'IMPORT MANQUANT
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

const tableRowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  hover: { backgroundColor: "rgba(255,255,255,0.03)" }
};

// ==========================================================
// COMPONENTS
// ==========================================================

const StatusBadge = ({ status }: { status: Application['status'] }) => {
  const statusMap: Record<string, { icon: JSX.Element; label: string; className: string; dotColor: string }> = {
    'submitted': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En attente',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-400 animate-pulse'
    },
    'under_review': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En examen',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      dotColor: 'bg-blue-400'
    },
    'shortlisted': {
      icon: <Star className="w-3 h-3" />,
      label: 'Présélectionnée',
      className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      dotColor: 'bg-purple-400'
    },
    'interview': {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Entretien',
      className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      dotColor: 'bg-indigo-400'
    },
    'accepted': {
      icon: <Award className="w-3 h-3" />,
      label: 'Acceptée ✅',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-400'
    },
    'rejected': {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Refusée',
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-400'
    },
    'withdrawn': {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Retirée',
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

const ApplicationCard = ({ 
  app, 
  onWithdraw, 
  isPending,
  index 
}: { 
  app: Application; 
  onWithdraw: (id: number, title: string) => void;
  isPending: boolean;
  index: number;
}) => {
  const isWithdrawn = app.status === 'withdrawn';
  const isActive = !isWithdrawn && (app.status === 'submitted' || app.status === 'under_review');
  const canWithdraw = isActive;

  return (
    <motion.div
      variants={tableRowVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.05 }}
      whileHover="hover"
      className={`group bg-slate-900/80 border p-6 rounded-2xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isWithdrawn 
          ? 'border-slate-700/50 opacity-60 hover:opacity-80 hover:border-slate-600' 
          : 'border-slate-800 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5'
      }`}
    >
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <motion.h3 
            className={`font-bold text-lg ${
              isWithdrawn 
                ? 'text-slate-400' 
                : 'text-white group-hover:text-amber-400 transition-colors'
            }`}
          >
            {app.opportunity_title || app.job_details?.title || 'Offre d\'emploi'}
          </motion.h3>
          <StatusBadge status={app.status} />
          {!isWithdrawn && app.status === 'shortlisted' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 flex items-center gap-1"
            >
              <Star className="w-3 h-3" /> Présélection
            </motion.span>
          )}
          {!isWithdrawn && app.status === 'interview' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Entretien
            </motion.span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            {app.organization_name || app.job_details?.organization_name || 'Entreprise'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Postulée le {new Date(app.submitted_at || app.created_at || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          {isWithdrawn && (
            <span className="flex items-center gap-1.5 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Retirée
            </span>
          )}
          {!isWithdrawn && app.status === 'accepted' && (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Award className="w-3.5 h-3.5" />
              Félicitations !
            </span>
          )}
        </div>

        {app.cover_note && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 mt-2 max-w-2xl line-clamp-2 ${
              isWithdrawn ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-300 transition-colors'
            }`}
          >
            "{app.cover_note}"
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
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

        {canWithdraw && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onWithdraw(app.id, app.opportunity_title || app.job_details?.title || 'cette offre')}
            disabled={isPending}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-sm font-semibold transition-all duration-300 border border-rose-500/20 hover:border-rose-500/40 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Retirer
          </motion.button>
        )}

        {isWithdrawn && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-4 py-2 bg-slate-800/50 text-slate-500 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Retirée
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const CandidateApplicationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const { data: applicationsData, isLoading, refetch } = useQuery<PaginatedResponse<Application>>({
    queryKey: ['myApplications'],
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
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  // ==========================================================
  // MUTATION
  // ==========================================================

  const withdrawMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.withdraw(id),
    onSuccess: (_, id) => {
      toast.success('Candidature retirée avec succès');
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['myApplications', 'all'] });
      refetch();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message ||
                           'Erreur lors du retrait de la candidature';
      toast.error(errorMessage);
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  const handleWithdraw = (applicationId: number, applicationTitle: string) => {
    if (window.confirm(`Voulez-vous vraiment retirer votre candidature pour "${applicationTitle}" ?`)) {
      withdrawMutation.mutate(applicationId);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    toast.success('Liste rafraîchie');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const applications = applicationsData?.results || [];
  
  const activeApplications = applications.filter(app => app.status !== 'withdrawn');
  const withdrawnApplications = applications.filter(app => app.status === 'withdrawn');

  const filteredApplications = statusFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

  const statusCounts = {
    all: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length,
  };

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
        <p className="text-sm text-slate-400">Chargement de vos candidatures...</p>
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
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 15,
            y: -mousePosition.y * 15,
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

          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-4 py-1.5 border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Mes candidatures</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
        </div>
      </motion.div>

      {/* ======================================================
          EN-TÊTE
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Mes Candidatures
          </h1>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 rounded-full"
          >
            {applications.length}
          </motion.span>
        </div>
        <p className="text-sm text-slate-400">
          Suivez l'état d'avancement de toutes vos postulations
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-slate-500 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Total : {applications.length} candidature{applications.length > 1 ? 's' : ''}
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-emerald-400 flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            Actives : {activeApplications.length}
          </motion.span>
          {withdrawnApplications.length > 0 && (
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-slate-500 flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Retirées : {withdrawnApplications.length}
            </motion.span>
          )}
          {statusCounts.accepted > 0 && (
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-emerald-400 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              Acceptées : {statusCounts.accepted} 🎉
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* ======================================================
          FILTRES ET VUE
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div className="flex flex-wrap gap-2">
          {['all', 'submitted', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status === 'all' ? 'Tous' : 
               status === 'under_review' ? 'En examen' :
               status === 'shortlisted' ? 'Présélection' :
               status === 'interview' ? 'Entretien' :
               status === 'accepted' ? 'Acceptés' :
               status === 'rejected' ? 'Refusés' :
               status === 'withdrawn' ? 'Retirés' :
               status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-1 text-[10px] opacity-60">
                  ({statusCounts[status as keyof typeof statusCounts] || 0})
                </span>
              )}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
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
      </motion.div>

      {/* ======================================================
          LISTE DES CANDIDATURES
      ====================================================== */}

      <AnimatePresence mode="wait">
        {filteredApplications.length === 0 ? (
          <motion.div
            key="empty"
            variants={fadeInScale}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-lg font-semibold text-white">
              {statusFilter !== 'all' ? 'Aucune candidature avec ce statut' : 'Aucune candidature'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {statusFilter !== 'all' 
                ? 'Essayez de modifier votre filtre' 
                : 'Vous n\'avez encore postulé à aucune offre d\'emploi.'}
            </p>
            {statusFilter === 'all' && (
              <Link 
                to="/jobs" 
                className="inline-block mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
              >
                Voir les offres
              </Link>
            )}
          </motion.div>
        ) : viewMode === 'list' ? (
          <motion.div
            key="list"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {filteredApplications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onWithdraw={handleWithdraw}
                isPending={withdrawMutation.isPending}
                index={index}
              />
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
            {filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
                variants={tableRowVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(251, 191, 36, 0.3)' }}
                className={`bg-slate-900/80 border p-4 rounded-xl transition-all duration-300 ${
                  app.status === 'withdrawn' 
                    ? 'border-slate-700/50 opacity-60' 
                    : 'border-slate-800 hover:shadow-xl hover:shadow-amber-500/5'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-white text-sm">{app.opportunity_title || 'Offre'}</h4>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" />
                  {app.organization_name || 'Entreprise'}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(app.submitted_at || app.created_at || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                  <Link
                    to={`/jobs/${app.opportunity}`}
                    className="flex-1 text-center px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                  >
                    Voir
                  </Link>
                  {app.status !== 'withdrawn' && (app.status === 'submitted' || app.status === 'under_review') && (
                    <button
                      onClick={() => handleWithdraw(app.id, app.opportunity_title || 'cette offre')}
                      disabled={withdrawMutation.isPending}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-medium hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                    >
                      Retirer
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
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
            <span className="text-amber-400 font-medium">{applications.length}</span> candidatures totales
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
          <span>Mes candidatures</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CandidateApplicationsPage;