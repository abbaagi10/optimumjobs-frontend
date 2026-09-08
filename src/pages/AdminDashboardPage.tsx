// src/pages/AdminDashboardPage.tsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { 
  AdminDashboardStats, 
  Opportunity, 
  Organization, 
  User, 
  PaginatedResponse 
} from '../types';
import { 
  Users, Building2, Briefcase, FileText, CheckCircle2, 
  ShieldAlert, Check, X, Search, Loader2, Clock,
  Eye, RefreshCw, ArrowLeft, UserCheck, UserX, Building,
  TrendingUp, TrendingDown, Zap, Sparkles, Filter, Grid3x3, List,
  ChevronRight, MoreVertical, Bell, Settings,
  LayoutGrid, Sparkle, Circle, Crown, Star, Award,
  Activity, Globe, Fingerprint, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
// CUSTOM HOOKS
// ==========================================================
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// ==========================================================
// COMPONENTS
// ==========================================================

const StatCard = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  color, 
  trend, 
  isLoading,
  onClick 
}: any) => (
  <motion.div
    variants={statCardVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
    onClick={onClick}
    className="relative group bg-slate-900/80 border border-slate-800 p-6 rounded-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer overflow-hidden"
  >
    {/* Gradient Background */}
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    
    {/* Glow Effect */}
    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${color}-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-end gap-3">
        <span className="text-3xl font-black text-white tracking-tight">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : value}
        </span>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      
      {subValue && (
        <div className="mt-1.5 text-xs text-slate-500">
          {subValue}
        </div>
      )}
      
      {/* Progress bar animation */}
      <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
    </div>
  </motion.div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { icon: JSX.Element; label: string; className: string; dotColor: string }> = {
    'draft': {
      icon: <Clock className="w-3 h-3" />,
      label: 'Brouillon',
      className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      dotColor: 'bg-slate-400'
    },
    'pending_review': {
      icon: <Clock className="w-3 h-3 animate-pulse" />,
      label: 'En attente',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotColor: 'bg-amber-400 animate-pulse'
    },
    'approved': {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Approuvée',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      dotColor: 'bg-blue-400'
    },
    'published': {
      icon: <Sparkle className="w-3 h-3" />,
      label: 'Publiée',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-400'
    },
    'rejected': {
      icon: <X className="w-3 h-3" />,
      label: 'Rejetée',
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-400'
    },
    'closed': {
      icon: <X className="w-3 h-3" />,
      label: 'Clôturée',
      className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      dotColor: 'bg-slate-400'
    },
    'archived': {
      icon: <Clock className="w-3 h-3" />,
      label: 'Archivée',
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

const TabButton = ({ active, onClick, icon: Icon, label, count }: any) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -1 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2.5 ${
      active 
        ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : ''}`} />
    {label}
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
      }`}>
        {count}
      </span>
    )}
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute -bottom-[2px] left-4 right-4 h-0.5 bg-amber-300 rounded-full"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </motion.button>
);

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'pending_jobs' | 'all_jobs' | 'organizations' | 'users'>('pending_jobs');
  const [rejectingJobId, setRejectingJobId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const debouncedSearch = useDebounce(searchTerm, 300);

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
  // NAVIGATION
  // ==========================================================

  const handleGoBack = () => navigate(-1);
  const handleViewOpportunity = (id: number) => navigate(`/admin/opportunities/${id}`);

  // ==========================================================
  // REFRESH ALL
  // ==========================================================

  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchPending(),
      refetchAllJobs(),
      refetchOrgs(),
      refetchUsers()
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery<AdminDashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboardStats().then((res) => res.data),
    retry: 1,
  });

  // ==========================================================
  // OFFRES EN ATTENTE
  // ==========================================================

  const { data: pendingJobs, isLoading: isLoadingPendingJobs, refetch: refetchPending } = useQuery<PaginatedResponse<Opportunity>>({
    queryKey: ['admin-pending-jobs'],
    queryFn: async () => {
      const response = await adminApi.getPendingOpportunities();
      const pending = response.data.results.filter(job => job.status === 'pending_review');
      return { ...response.data, results: pending };
    },
    enabled: activeTab === 'pending_jobs',
    retry: 1,
  });

  // ==========================================================
  // TOUTES LES OFFRES
  // ==========================================================

  const { data: allJobs, isLoading: isLoadingAllJobs, refetch: refetchAllJobs } = useQuery<PaginatedResponse<Opportunity>>({
    queryKey: ['admin-all-jobs', statusFilter, debouncedSearch],
    queryFn: async () => {
      const response = await adminApi.getAllOpportunities({ 
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: debouncedSearch || undefined
      });
      return response.data;
    },
    enabled: activeTab === 'all_jobs',
    retry: 1,
  });

  // ==========================================================
  // ORGANISATIONS
  // ==========================================================

  const { data: organizations, isLoading: isLoadingOrgs, refetch: refetchOrgs } = useQuery<PaginatedResponse<Organization>>({
    queryKey: ['admin-organizations', debouncedSearch],
    queryFn: () => adminApi.getOrganizations({ search: debouncedSearch }).then((res) => res.data),
    enabled: activeTab === 'organizations',
    retry: 1,
  });

  // ==========================================================
  // UTILISATEURS
  // ==========================================================

  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery<PaginatedResponse<User>>({
    queryKey: ['admin-users', debouncedSearch],
    queryFn: () => adminApi.getUsers({ search: debouncedSearch }).then((res) => res.data),
    enabled: activeTab === 'users',
    retry: 1,
  });

  // ==========================================================
  // MUTATIONS - MODÉRATION
  // ==========================================================

  const approveJobMutation = useMutation({
    mutationFn: (id: number) => adminApi.reviewOpportunity(id, 'approve'),
    onSuccess: () => {
      toast.success('✅ Offre approuvée !');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'approbation');
    },
  });

  const rejectJobMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      adminApi.reviewOpportunity(id, 'reject', reason),
    onSuccess: () => {
      toast.success('Offre rejetée');
      setRejectingJobId(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors du rejet');
    },
  });

  const publishJobMutation = useMutation({
    mutationFn: (id: number) => adminApi.publishOpportunity(id),
    onSuccess: () => {
      toast.success('✅ Offre publiée !');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la publication');
    },
  });

  const closeJobMutation = useMutation({
    mutationFn: (id: number) => adminApi.closeOpportunity(id),
    onSuccess: () => {
      toast.success('Offre clôturée');
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la clôture');
    },
  });

  // ==========================================================
  // MUTATIONS - ORGANISATIONS & UTILISATEURS
  // ==========================================================

  const verifyOrgMutation = useMutation({
    mutationFn: (id: number) => adminApi.verifyOrganization(id),
    onSuccess: () => {
      toast.success('✅ Organisation vérifiée !');
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la vérification');
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => 
      adminApi.toggleUserActive(id, is_active),
    onSuccess: () => {
      toast.success('Statut utilisateur mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    },
  });

  // ==========================================================
  // COMPUTED VALUES
  // ==========================================================

  const statsData = stats || {
    users: { total: 0, active: 0 },
    organizations: { total: 0, verified: 0 },
    opportunities: { total: 0, pending_review: 0, active: 0 },
    applications: { total: 0, submitted: 0 },
  };

  const statCards = useMemo(() => [
    {
      title: 'Utilisateurs',
      value: statsData.users?.total ?? 0,
      subValue: `${statsData.users?.active ?? 0} actifs`,
      icon: Users,
      color: 'amber',
      trend: 12,
    },
    {
      title: 'Entreprises',
      value: statsData.organizations?.total ?? 0,
      subValue: `${statsData.organizations?.verified ?? 0} vérifiées`,
      icon: Building2,
      color: 'blue',
      trend: 8,
    },
    {
      title: 'En Attente',
      value: statsData.opportunities?.pending_review ?? 0,
      subValue: `${statsData.opportunities?.active ?? 0} actives`,
      icon: Briefcase,
      color: 'amber',
      trend: -3,
    },
    {
      title: 'Candidatures',
      value: statsData.applications?.total ?? 0,
      subValue: `${statsData.applications?.submitted ?? 0} soumises`,
      icon: FileText,
      color: 'emerald',
      trend: 25,
    },
  ], [statsData]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 relative"
    >
      {/* Background decoration with parallax */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0f] overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 30,
            y: mousePosition.y * 20,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 20,
            y: -mousePosition.y * 30,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
      </div>

      {/* ========================================================== */}
      {/* HEADER - Simplified (Layout handles navigation) */}
      {/* ========================================================== */}
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Retour</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefreshAll}
            className={`p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-300"
          >
            <Bell className="w-4 h-4" />
            {statsData.opportunities?.pending_review > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-bold text-slate-950 flex items-center justify-center"
              >
                {statsData.opportunities.pending_review}
              </motion.span>
            )}
          </motion.button>

          <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-4 py-1.5 border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Administration</span>
            <Crown className="w-3 h-3 text-amber-500" />
          </div>
        </div>
      </motion.div>

      {/* ========================================================== */}
      {/* TITLE SECTION */}
      {/* ========================================================== */}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="bg-gradient-to-r from-amber-400 to-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/25"
          >
            <ShieldAlert className="w-7 h-7 text-slate-950" />
          </motion.div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Panneau d'Administration
              <span className="ml-3 text-sm font-normal text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                v3.0.0
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <Sparkle className="w-3 h-3 text-amber-400" />
              Gérez la modération des offres, les entreprises et les utilisateurs.
              <span className="text-slate-600">•</span>
              <span className="text-slate-500 text-xs">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ========================================================== */}
      {/* STAT CARDS */}
      {/* ========================================================== */}
      
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} isLoading={isLoadingStats} />
        ))}
      </motion.div>

      {/* ========================================================== */}
      {/* SEARCH & FILTERS */}
      {/* ========================================================== */}
      
      {(activeTab === 'organizations' || activeTab === 'users' || activeTab === 'all_jobs') && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1 group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-amber-400" />
            <input
              type="text"
              placeholder={`Rechercher ${activeTab === 'organizations' ? 'une entreprise' : activeTab === 'users' ? 'un utilisateur' : 'une offre'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 text-white pl-12 pr-4 py-3.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 placeholder:text-slate-600"
            />
            {searchTerm && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
          
          {activeTab === 'all_jobs' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/80 text-slate-300 px-4 py-3.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 cursor-pointer hover:border-slate-700"
            >
              <option value="all">📊 Tous les statuts</option>
              <option value="pending_review">⏳ En attente</option>
              <option value="approved">✅ Approuvées</option>
              <option value="published">🚀 Publiées</option>
              <option value="rejected">❌ Rejetées</option>
              <option value="closed">🔒 Clôturées</option>
              <option value="draft">📝 Brouillons</option>
            </select>
          )}
          
          <div className="flex gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25' : 'text-slate-500 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25' : 'text-slate-500 hover:text-white'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ========================================================== */}
      {/* TABS */}
      {/* ========================================================== */}
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2 pb-4 overflow-x-auto scrollbar-hide"
      >
        <TabButton
          active={activeTab === 'pending_jobs'}
          onClick={() => setActiveTab('pending_jobs')}
          icon={Clock}
          label="À modérer"
          count={statsData.opportunities?.pending_review || 0}
        />
        <TabButton
          active={activeTab === 'all_jobs'}
          onClick={() => setActiveTab('all_jobs')}
          icon={Briefcase}
          label="Toutes les offres"
        />
        <TabButton
          active={activeTab === 'organizations'}
          onClick={() => setActiveTab('organizations')}
          icon={Building2}
          label="Entreprises"
        />
        <TabButton
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          icon={Users}
          label="Utilisateurs"
        />
      </motion.div>

      {/* ========================================================== */}
      {/* TAB CONTENT */}
      {/* ========================================================== */}
      
      <AnimatePresence mode="wait">
        {/* PENDING JOBS */}
        {activeTab === 'pending_jobs' && (
          <motion.div
            key="pending-jobs"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                {pendingJobs?.results?.length || 0} offre(s) en attente de modération
              </span>
            </div>

            {isLoadingPendingJobs ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : !pendingJobs || pendingJobs.results.length === 0 ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="font-semibold text-white text-lg">Aucune offre à modérer</p>
                <p className="text-sm text-slate-400 mt-1">Toutes les offres ont été traitées ou sont déjà publiées.</p>
              </motion.div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
                {pendingJobs.results.map((job) => (
                  <motion.div
                    key={job.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.005, borderColor: 'rgba(251, 191, 36, 0.3)' }}
                    className="bg-slate-900/80 border border-amber-500/20 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs text-amber-400 uppercase font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            {job.opportunity_type}
                          </span>
                          <StatusBadge status={job.status} />
                          {job.is_urgent && (
                            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Urgent
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                          <Building className="w-3.5 h-3.5" />
                          {job.organization_name || 'Entreprise'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <Circle className="w-2 h-2 fill-slate-600" />
                          {job.city || job.location || 'Localisation non spécifiée'}
                          {job.country && `, ${job.country}`}
                        </p>
                        {job.description && (
                          <p className="text-sm text-slate-400 mt-3 line-clamp-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            {job.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewOpportunity(job.id)}
                          className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-700 transition-all duration-300"
                        >
                          <Eye className="w-4 h-4" /> Voir
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => approveJobMutation.mutate(job.id)}
                          disabled={approveJobMutation.isPending}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50"
                        >
                          {approveJobMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Approuver
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRejectingJobId(rejectingJobId === job.id ? null : job.id)}
                          className="px-5 py-2.5 bg-rose-600/20 text-rose-400 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-rose-600/30 transition-all duration-300"
                        >
                          <X className="w-4 h-4" /> Refuser
                        </motion.button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {rejectingJobId === job.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-4 mt-4 border-t border-slate-800 overflow-hidden"
                        >
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Motif du refus (optionnel)..."
                            className="w-full bg-slate-950/80 border border-slate-800 text-white p-3.5 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-300"
                            rows={2}
                          />
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => setRejectingJobId(null)} 
                              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                              Annuler
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => rejectJobMutation.mutate({ id: job.id, reason: rejectionReason })}
                              disabled={rejectJobMutation.isPending}
                              className="px-6 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-500 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-rose-500/25"
                            >
                              {rejectJobMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Confirmer le refus'}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ALL JOBS */}
        {activeTab === 'all_jobs' && (
          <motion.div
            key="all-jobs"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/30">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                {allJobs?.results?.length || 0} offre(s) trouvée(s)
              </span>
            </div>

            {isLoadingAllJobs ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : !allJobs || allJobs.results.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="text-lg font-semibold text-white">Aucune offre trouvée</p>
                <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Titre</th>
                      <th className="px-6 py-4 hidden md:table-cell font-semibold">Entreprise</th>
                      <th className="px-6 py-4 font-semibold">Statut</th>
                      <th className="px-6 py-4 hidden lg:table-cell font-semibold">Type</th>
                      <th className="px-6 py-4 hidden lg:table-cell font-semibold">Date</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allJobs.results.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        variants={tableRowVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: index * 0.03 }}
                        whileHover="hover"
                        className="hover:bg-white/5 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 font-semibold text-white">{job.title}</td>
                        <td className="px-6 py-4 hidden md:table-cell text-slate-400">
                          {job.organization_name || '—'}
                        </td>
                        <td className="px-6 py-4">{StatusBadge({ status: job.status })}</td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                            {job.opportunity_type || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-slate-400 text-xs">
                          {job.created_at ? new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewOpportunity(job.id)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>

                            {job.status === 'pending_review' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => approveJobMutation.mutate(job.id)}
                                  disabled={approveJobMutation.isPending}
                                  className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-all duration-200"
                                  title="Approuver"
                                >
                                  <Check className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setRejectingJobId(rejectingJobId === job.id ? null : job.id)}
                                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-all duration-200"
                                  title="Refuser"
                                >
                                  <X className="w-4 h-4" />
                                </motion.button>
                              </>
                            )}

                            {job.status === 'approved' && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => publishJobMutation.mutate(job.id)}
                                disabled={publishJobMutation.isPending}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-all duration-200"
                                title="Publier"
                              >
                                <Sparkle className="w-4 h-4" />
                              </motion.button>
                            )}

                            {job.status === 'published' && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => closeJobMutation.mutate(job.id)}
                                disabled={closeJobMutation.isPending}
                                className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all duration-200"
                                title="Clôturer"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {allJobs.results.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(251, 191, 36, 0.3)' }}
                    className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-white text-sm">{job.title}</h4>
                      {StatusBadge({ status: job.status })}
                    </div>
                    <p className="text-xs text-slate-400">{job.organization_name || '—'}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs text-slate-500">{job.opportunity_type || '—'}</span>
                      <div className="flex gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewOpportunity(job.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </motion.button>
                        {job.status === 'pending_review' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => approveJobMutation.mutate(job.id)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-all duration-200"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ORGANIZATIONS */}
        {activeTab === 'organizations' && (
          <motion.div
            key="organizations"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/30">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                {organizations?.results?.length || 0} entreprise(s) trouvée(s)
              </span>
            </div>

            {isLoadingOrgs ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : !organizations || organizations.results.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Building className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="text-lg font-semibold text-white">Aucune entreprise trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Nom</th>
                      <th className="px-6 py-4 hidden md:table-cell font-semibold">Secteur</th>
                      <th className="px-6 py-4 font-semibold">Statut</th>
                      <th className="px-6 py-4 hidden lg:table-cell font-semibold">Créée le</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {organizations.results.map((org, index) => (
                      <motion.tr
                        key={org.id}
                        variants={tableRowVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: index * 0.03 }}
                        whileHover="hover"
                        className="hover:bg-white/5 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-400" />
                          </div>
                          {org.name}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-slate-400">
                          {org.industry || '—'}
                        </td>
                        <td className="px-6 py-4">
                          {org.is_verified ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Award className="w-3 h-3" /> Vérifiée
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" /> Non vérifiée
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-slate-400 text-xs">
                          {org.created_at ? new Date(org.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!org.is_verified && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => verifyOrgMutation.mutate(org.id)}
                              disabled={verifyOrgMutation.isPending}
                              className="px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-xs font-semibold transition-all duration-300 disabled:opacity-50"
                            >
                              {verifyOrgMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Vérifier'}
                            </motion.button>
                          )}
                          {org.is_verified && (
                            <span className="text-xs text-emerald-500/50 font-medium">
                              ✅ Vérifié
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/30">
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                {users?.results?.length || 0} utilisateur(s) trouvé(s)
              </span>
            </div>

            {isLoadingUsers ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : !users || users.results.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="text-lg font-semibold text-white">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Utilisateur</th>
                      <th className="px-6 py-4 hidden md:table-cell font-semibold">Rôle</th>
                      <th className="px-6 py-4 font-semibold">Statut</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.results.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        variants={tableRowVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: index * 0.03 }}
                        whileHover="hover"
                        className="hover:bg-white/5 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center font-bold text-amber-400 text-sm">
                              {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : user.email}
                              </div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            user.role === 'admin' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : user.role === 'org_admin'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {user.role === 'org_admin' ? 'Admin Entreprise' : user.role || 'Utilisateur'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleUserStatusMutation.mutate({ id: user.id, is_active: !user.is_active })}
                            disabled={toggleUserStatusMutation.isPending}
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              user.is_active 
                                ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' 
                                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                            }`}
                            title={user.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {toggleUserStatusMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.is_active ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* FOOTER - Simplified (Layout handles footer) */}
      {/* ========================================================== */}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/50 text-xs text-slate-600"
      >
        <div className="flex items-center gap-4">
          <span className="text-slate-500">
            <span className="text-amber-400 font-medium">{statsData.opportunities?.total || 0}</span> offres totales
          </span>
          <span className="w-px h-4 bg-slate-800" />
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400/70">Système opérationnel</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-amber-400" />
            Sécurisé
          </span>
          <span className="w-px h-4 bg-slate-800" />
          <span>v1.0.0</span>
        </div>
      </motion.div>
    </motion.div>
  );
};