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
  Eye, ArrowLeft, UserCheck, UserX, Building,
  TrendingUp, TrendingDown, Zap, Sparkles, Filter, Grid3x3, List,
  LayoutGrid, Sparkle, Circle, Crown, Award,
  Activity, Globe, Shield, RefreshCw, MoreHorizontal,
  ChevronRight, Star, Flame, Inbox,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
// STAT CARD — Style signature (bordure top + icône dégradé)
// ==========================================================

const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  color,
  trend,
  isLoading,
}: any) => {
  const colorMap: any = {
    green: {
      bar: 'bg-[#16A34A]',
      iconBg: 'bg-gradient-to-br from-[#16A34A] to-[#15803D]',
      soft: 'bg-[#F0FDF4]',
      text: 'text-[#16A34A]',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(22,163,74,0.3)]',
    },
    amber: {
      bar: 'bg-[#FCD34D]',
      iconBg: 'bg-gradient-to-br from-[#FCD34D] to-[#EAB308]',
      soft: 'bg-[#FEF3C7]',
      text: 'text-[#B88400]',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(252,211,77,0.4)]',
    },
    blue: {
      bar: 'bg-blue-500',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      soft: 'bg-blue-50',
      text: 'text-blue-600',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)]',
    },
    rose: {
      bar: 'bg-rose-500',
      iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600',
      soft: 'bg-rose-50',
      text: 'text-rose-600',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(244,63,94,0.3)]',
    },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className="group relative bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1">

      {/* Bordure top colorée */}
      <div className={`h-1 ${c.bar}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.iconBg} ${c.shadow} group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
              trend >= 0
                ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div className="text-xs font-semibold uppercase tracking-wider text-[#14532D]/50 mb-1">
          {title}
        </div>

        <div className="text-3xl font-extrabold text-[#14532D] tracking-tight">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[#14532D]/40" />
          ) : (
            value
          )}
        </div>

        {subValue && (
          <div className="text-xs text-[#14532D]/50 mt-1.5">{subValue}</div>
        )}
      </div>
    </div>
  );
};

// ==========================================================
// STATUS BADGE
// ==========================================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { icon: JSX.Element; label: string; className: string; dotColor: string }> = {
    'draft': {
      icon: <Clock className="w-3 h-3" />,
      label: 'Brouillon',
      className: 'bg-slate-100 text-slate-600 border-slate-200',
      dotColor: 'bg-slate-400'
    },
    'pending_review': {
      icon: <Clock className="w-3 h-3 animate-pulse" />,
      label: 'En attente',
      className: 'bg-[#FEF3C7] text-[#B88400] border-[#FCD34D]/40',
      dotColor: 'bg-[#FCD34D] animate-pulse'
    },
    'approved': {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Approuvée',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500'
    },
    'published': {
      icon: <Sparkle className="w-3 h-3" />,
      label: 'Publiée',
      className: 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20',
      dotColor: 'bg-[#16A34A]'
    },
    'rejected': {
      icon: <X className="w-3 h-3" />,
      label: 'Rejetée',
      className: 'bg-rose-50 text-rose-600 border-rose-200',
      dotColor: 'bg-rose-500'
    },
    'closed': {
      icon: <X className="w-3 h-3" />,
      label: 'Clôturée',
      className: 'bg-slate-100 text-slate-500 border-slate-200',
      dotColor: 'bg-slate-400'
    },
    'archived': {
      icon: <Clock className="w-3 h-3" />,
      label: 'Archivée',
      className: 'bg-slate-100 text-slate-500 border-slate-200',
      dotColor: 'bg-slate-400'
    }
  };

  const config = statusMap[status] || {
    icon: null,
    label: status,
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    dotColor: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.icon}
      {config.label}
    </span>
  );
};

// ==========================================================
// TAB BUTTON
// ==========================================================

const TabButton = ({ active, onClick, icon: Icon, label, count }: any) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
      active
        ? 'bg-[#16A34A] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]'
        : 'text-[#14532D]/60 hover:text-[#14532D] hover:bg-[#F0FDF4]'
    }`}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span>{label}</span>
    {count !== undefined && (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
        active ? 'bg-white/25 text-white' : 'bg-[#16A34A]/10 text-[#16A34A]'
      }`}>
        {count}
      </span>
    )}
  </button>
);

// ==========================================================
// EMPTY STATE
// ==========================================================

const EmptyState = ({ icon: Icon, title, subtitle, action }: any) => (
  <div className="text-center py-16 bg-white rounded-2xl border border-[#16A34A]/10">
    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
      <Icon className="w-10 h-10 text-[#16A34A]/40" />
    </div>
    <p className="text-lg font-bold text-[#14532D]">{title}</p>
    {subtitle && (
      <p className="text-sm text-[#14532D]/60 mt-1 px-4 max-w-md mx-auto">{subtitle}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
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

  const debouncedSearch = useDebounce(searchTerm, 300);

  const handleGoBack = () => navigate(-1);
  const handleViewOpportunity = (id: number) => navigate(`/admin/opportunities/${id}`);

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([
      refetchStats(),
      refetchPending(),
      refetchAllJobs(),
      refetchOrgs(),
      refetchUsers()
    ]);
  }, []);

  // ==========================================================
  // QUERIES (identiques à l'original)
  // ==========================================================

  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery<AdminDashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboardStats().then((res) => res.data),
    retry: 1,
  });

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

  const { data: organizations, isLoading: isLoadingOrgs, refetch: refetchOrgs } = useQuery<PaginatedResponse<Organization>>({
    queryKey: ['admin-organizations', debouncedSearch],
    queryFn: () => adminApi.getOrganizations({ search: debouncedSearch }).then((res) => res.data),
    enabled: activeTab === 'organizations',
    retry: 1,
  });

  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery<PaginatedResponse<User>>({
    queryKey: ['admin-users', debouncedSearch],
    queryFn: () => adminApi.getUsers({ search: debouncedSearch }).then((res) => res.data),
    enabled: activeTab === 'users',
    retry: 1,
  });

  // ==========================================================
  // MUTATIONS (identiques à l'original)
  // ==========================================================

  const approveJobMutation = useMutation({
    mutationFn: (id: number) => adminApi.reviewOpportunity(id, 'approve'),
    onSuccess: () => {
      toast.success('Offre approuvée');
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
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors du rejet');
    },
  });

  const publishJobMutation = useMutation({
    mutationFn: (id: number) => adminApi.publishOpportunity(id),
    onSuccess: () => {
      toast.success('Offre publiée');
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
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la clôture');
    },
  });

  const verifyOrgMutation = useMutation({
    mutationFn: (id: number) => adminApi.verifyOrganization(id),
    onSuccess: () => {
      toast.success('Organisation vérifiée');
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
      handleRefreshAll();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    },
  });

  // ==========================================================
  // COMPUTED (identiques à l'original)
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
      color: 'green',
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
      color: 'green',
      trend: 25,
    },
  ], [statsData]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ========================================================== */}
      {/* HEADER — Breadcrumb + retour + statut */}
      {/* ========================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="group flex items-center gap-2 rounded-xl border border-[#16A34A]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#14532D]/70 transition-all duration-200 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Retour</span>
          </button>

          <button
            onClick={handleRefreshAll}
            className="group p-2.5 rounded-xl border border-[#16A34A]/15 bg-white text-[#14532D]/70 transition-all duration-200 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#16A34A]"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white border border-[#16A34A]/15 px-4 py-2 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
          </span>
          <span className="text-xs text-[#14532D]/70 font-semibold">En direct</span>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TITLE — Avec breadcrumb */}
      {/* ========================================================== */}

      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#14532D]/50 mb-3">
          <span>Admin</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#16A34A] font-semibold">Dashboard</span>
        </div>

        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <div className="bg-gradient-to-br from-[#16A34A] to-[#15803D] p-3 rounded-2xl shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)]">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FCD34D] border-2 border-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14532D] tracking-tight flex flex-wrap items-center gap-2">
              Panneau d'Administration
              <span className="text-xs font-semibold text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#16A34A]/20">
                v1.0.0
              </span>
            </h1>
            <p className="text-[#14532D]/60 text-sm mt-1.5 flex flex-wrap items-center gap-2">
              <Sparkle className="w-3.5 h-3.5 text-[#FCD34D] shrink-0" />
              <span>Gérez la modération, les entreprises et les utilisateurs au Niger.</span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* STAT CARDS */}
      {/* ========================================================== */}

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} isLoading={isLoadingStats} />
        ))}
      </div>

      {/* ========================================================== */}
      {/* SEARCH & FILTERS */}
      {/* ========================================================== */}

      {(activeTab === 'organizations' || activeTab === 'users' || activeTab === 'all_jobs') && (
        <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#14532D]/40 group-focus-within:text-[#16A34A] transition-colors" />
              <input
                type="text"
                placeholder={`Rechercher ${
                  activeTab === 'organizations'
                    ? 'une entreprise'
                    : activeTab === 'users'
                    ? 'un utilisateur'
                    : 'une offre'
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAF9] text-[#14532D] pl-11 pr-10 py-3 rounded-xl border border-[#16A34A]/15 text-sm placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#14532D]/40 hover:text-[#16A34A] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {activeTab === 'all_jobs' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAFAF9] text-[#14532D] px-4 py-3 rounded-xl border border-[#16A34A]/15 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 focus:bg-white transition-all cursor-pointer hover:border-[#16A34A]/30 w-full sm:w-auto font-medium"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending_review">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="published">Publiées</option>
                <option value="rejected">Rejetées</option>
                <option value="closed">Clôturées</option>
                <option value="draft">Brouillons</option>
              </select>
            )}

            <div className="flex gap-1 bg-[#FAFAF9] border border-[#16A34A]/15 rounded-xl p-1 self-end sm:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-[#16A34A] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]'
                    : 'text-[#14532D]/50 hover:text-[#16A34A]'
                }`}
                title="Vue tableau"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-[#16A34A] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]'
                    : 'text-[#14532D]/50 hover:text-[#16A34A]'
                }`}
                title="Vue grille"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TABS */}
      {/* ========================================================== */}

      <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max">
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
        </div>
      </div>

      {/* ========================================================== */}
      {/* PENDING JOBS */}
      {/* ========================================================== */}

      {activeTab === 'pending_jobs' && (
        <div className="space-y-4">
          {isLoadingPendingJobs ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#16A34A]" />
            </div>
          ) : !pendingJobs || pendingJobs.results.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Aucune offre à modérer"
              subtitle="Toutes les offres au Niger ont été traitées ou sont déjà publiées. Revenez plus tard."
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#14532D]/60 flex items-center gap-2 font-medium">
                  <Zap className="w-4 h-4 text-[#FCD34D]" />
                  <span className="text-[#14532D] font-bold">{pendingJobs.results.length}</span>
                  offre{pendingJobs.results.length > 1 ? 's' : ''} en attente de modération
                </span>
              </div>

              <div className="space-y-4">
                {pendingJobs.results.map((job) => (
                  <div
                    key={job.id}
                    className="group relative bg-white border border-[#FCD34D]/30 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#FCD34D]/60 hover:shadow-[0_12px_32px_-8px_rgba(252,211,77,0.25)] hover:-translate-y-1"
                  >
                    {/* Bordure top ambre */}
                    <div className="h-1 bg-[#FCD34D]" />

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-5">

                        <div className="flex-1 min-w-0">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-[10px] sm:text-xs text-[#B88400] uppercase font-bold bg-[#FEF3C7] px-2.5 py-1 rounded-full border border-[#FCD34D]/40">
                              {job.opportunity_type}
                            </span>
                            <StatusBadge status={job.status} />
                            {job.is_urgent && (
                              <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                                <Flame className="w-3 h-3" /> Urgent
                              </span>
                            )}
                          </div>

                          {/* Titre */}
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#14532D] group-hover:text-[#16A34A] transition-colors">
                            {job.title}
                          </h3>

                          {/* Entreprise */}
                          <p className="text-sm text-[#14532D]/60 flex items-center gap-2 mt-1.5">
                            <Building className="w-3.5 h-3.5 shrink-0 text-[#16A34A]" />
                            <span className="truncate font-medium">{job.organization_name || 'Entreprise'}</span>
                          </p>

                          {/* Localisation */}
                          <p className="text-xs text-[#14532D]/50 mt-1 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {job.city || job.location || 'Localisation non spécifiée'}
                              {job.country && `, ${job.country}`}
                            </span>
                          </p>

                          {/* Description */}
                          {job.description && (
                            <p className="text-sm text-[#14532D]/60 mt-3 line-clamp-2 bg-[#FAFAF9] p-3 rounded-xl border border-[#16A34A]/10 leading-relaxed">
                              {job.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 lg:w-48 shrink-0">
                          <button
                            onClick={() => handleViewOpportunity(job.id)}
                            className="w-full px-4 py-2.5 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all"
                          >
                            <Eye className="w-4 h-4" /> Voir l'offre
                          </button>

                          <button
                            onClick={() => approveJobMutation.mutate(job.id)}
                            disabled={approveJobMutation.isPending}
                            className="w-full px-4 py-2.5 bg-[#16A34A] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                          >
                            {approveJobMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Approuver
                          </button>

                          <button
                            onClick={() =>
                              setRejectingJobId(rejectingJobId === job.id ? null : job.id)
                            }
                            className="w-full px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-100 hover:border-rose-300 transition-all"
                          >
                            <X className="w-4 h-4" /> Refuser
                          </button>
                        </div>
                      </div>

                      {/* Form de rejet */}
                      {rejectingJobId === job.id && (
                        <div className="space-y-3 pt-5 mt-5 border-t border-[#16A34A]/10">
                          <label className="block text-sm font-semibold text-[#14532D]">
                            Motif du refus <span className="text-[#14532D]/40 font-normal">(optionnel)</span>
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Expliquez brièvement pourquoi cette offre est rejetée..."
                            className="w-full bg-[#FEF2F2] border border-rose-200 text-[#14532D] p-3.5 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all placeholder-[#14532D]/40 resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setRejectingJobId(null)}
                              className="px-4 py-2 text-sm text-[#14532D]/60 hover:text-[#14532D] transition-colors font-medium"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() =>
                                rejectJobMutation.mutate({
                                  id: job.id,
                                  reason: rejectionReason,
                                })
                              }
                              disabled={rejectJobMutation.isPending}
                              className="px-5 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-500 transition-all disabled:opacity-50 shadow-[0_4px_12px_-2px_rgba(244,63,94,0.4)] flex items-center gap-2"
                            >
                              {rejectJobMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Confirmer le refus
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* ALL JOBS */}
      {/* ========================================================== */}

      {activeTab === 'all_jobs' && (
        <div className="bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#16A34A]/10 bg-[#F0FDF4]">
            <span className="text-sm text-[#14532D]/70 flex items-center gap-2 font-semibold">
              <Briefcase className="w-4 h-4 text-[#16A34A]" />
              <span className="text-[#14532D] font-bold">{allJobs?.results?.length || 0}</span>
              offre{(allJobs?.results?.length || 0) > 1 ? 's' : ''} trouvée{(allJobs?.results?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>

          {isLoadingAllJobs ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#16A34A]" />
            </div>
          ) : !allJobs || allJobs.results.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Aucune offre trouvée"
              subtitle="Essayez de modifier vos filtres de recherche."
            />
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <table className="w-full text-left text-sm text-[#14532D]/80">
                  <thead className="bg-[#F0FDF4] text-xs text-[#14532D]/60 uppercase tracking-wider border-b border-[#16A34A]/10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Titre</th>
                      <th className="px-6 py-4 hidden md:table-cell font-bold">Entreprise</th>
                      <th className="px-6 py-4 font-bold">Statut</th>
                      <th className="px-6 py-4 hidden lg:table-cell font-bold">Type</th>
                      <th className="px-6 py-4 hidden lg:table-cell font-bold">Date</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16A34A]/5">
                    {allJobs.results.map((job) => (
                      <tr key={job.id} className="hover:bg-[#F0FDF4] transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#14532D] max-w-[220px] truncate">
                          {job.title}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-[#14532D]/60 max-w-[160px] truncate">
                          {job.organization_name || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-xs bg-[#F0FDF4] px-2.5 py-1 rounded-full text-[#16A34A] font-semibold border border-[#16A34A]/20">
                            {job.opportunity_type || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-[#14532D]/50 text-xs">
                          {job.created_at
                            ? new Date(job.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => handleViewOpportunity(job.id)}
                              className="p-2 text-[#14532D]/50 hover:text-[#16A34A] hover:bg-white rounded-lg transition-all"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {job.status === 'pending_review' && (
                              <>
                                <button
                                  onClick={() => approveJobMutation.mutate(job.id)}
                                  className="p-2 text-[#16A34A] hover:bg-white rounded-lg transition-all"
                                  title="Approuver"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setRejectingJobId(rejectingJobId === job.id ? null : job.id)
                                  }
                                  className="p-2 text-rose-500 hover:bg-white rounded-lg transition-all"
                                  title="Refuser"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {job.status === 'approved' && (
                              <button
                                onClick={() => publishJobMutation.mutate(job.id)}
                                className="p-2 text-blue-500 hover:bg-white rounded-lg transition-all"
                                title="Publier"
                              >
                                <Sparkle className="w-4 h-4" />
                              </button>
                            )}

                            {job.status === 'published' && (
                              <button
                                onClick={() => closeJobMutation.mutate(job.id)}
                                className="p-2 text-[#14532D]/50 hover:bg-white rounded-lg transition-all"
                                title="Clôturer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {allJobs.results.map((job) => (
                <div
                  key={job.id}
                  className="group bg-white border border-[#16A34A]/10 rounded-xl p-4 space-y-3 transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[#14532D] text-sm line-clamp-2 group-hover:text-[#16A34A] transition-colors">
                      {job.title}
                    </h4>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-[#14532D]/60 truncate">{job.organization_name || '—'}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-[#16A34A]/10">
                    <span className="text-xs text-[#16A34A] font-bold truncate">
                      {job.opportunity_type || '—'}
                    </span>
                    <button
                      onClick={() => handleViewOpportunity(job.id)}
                      className="p-1.5 text-[#14532D]/50 hover:text-[#16A34A] hover:bg-[#F0FDF4] rounded-lg transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* ORGANIZATIONS */}
      {/* ========================================================== */}

      {activeTab === 'organizations' && (
        <div className="bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#16A34A]/10 bg-[#F0FDF4]">
            <span className="text-sm text-[#14532D]/70 flex items-center gap-2 font-semibold">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="text-[#14532D] font-bold">{organizations?.results?.length || 0}</span>
              entreprise{(organizations?.results?.length || 0) > 1 ? 's' : ''} trouvée{(organizations?.results?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>

          {isLoadingOrgs ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#16A34A]" />
            </div>
          ) : !organizations || organizations.results.length === 0 ? (
            <EmptyState
              icon={Building}
              title="Aucune entreprise trouvée"
              subtitle="Essayez de modifier vos filtres de recherche."
            />
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <table className="w-full text-left text-sm text-[#14532D]/80">
                  <thead className="bg-[#F0FDF4] text-xs text-[#14532D]/60 uppercase tracking-wider border-b border-[#16A34A]/10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Nom</th>
                      <th className="px-6 py-4 hidden md:table-cell font-bold">Secteur</th>
                      <th className="px-6 py-4 font-bold">Statut</th>
                      <th className="px-6 py-4 hidden lg:table-cell font-bold">Créée le</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16A34A]/5">
                    {organizations.results.map((org) => (
                      <tr key={org.id} className="hover:bg-[#F0FDF4] transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#14532D]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="truncate max-w-[160px]">{org.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-[#14532D]/60">
                          {org.industry || '—'}
                        </td>
                        <td className="px-6 py-4">
                          {org.is_verified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20">
                              <Award className="w-3 h-3" /> Vérifiée
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B88400] border border-[#FCD34D]/40">
                              <Clock className="w-3 h-3" /> Non vérifiée
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-[#14532D]/50 text-xs">
                          {org.created_at
                            ? new Date(org.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!org.is_verified ? (
                            <button
                              onClick={() => verifyOrgMutation.mutate(org.id)}
                              disabled={verifyOrgMutation.isPending}
                              className="px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] transition-all disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                            >
                              {verifyOrgMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              Vérifier
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-[#16A34A] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Vérifié
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* USERS */}
      {/* ========================================================== */}

      {activeTab === 'users' && (
        <div className="bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#16A34A]/10 bg-[#F0FDF4]">
            <span className="text-sm text-[#14532D]/70 flex items-center gap-2 font-semibold">
              <Users className="w-4 h-4 text-[#16A34A]" />
              <span className="text-[#14532D] font-bold">{users?.results?.length || 0}</span>
              utilisateur{(users?.results?.length || 0) > 1 ? 's' : ''} trouvé{(users?.results?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>

          {isLoadingUsers ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#16A34A]" />
            </div>
          ) : !users || users.results.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun utilisateur trouvé"
              subtitle="Essayez de modifier vos filtres de recherche."
            />
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <table className="w-full text-left text-sm text-[#14532D]/80">
                  <thead className="bg-[#F0FDF4] text-xs text-[#14532D]/60 uppercase tracking-wider border-b border-[#16A34A]/10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Utilisateur</th>
                      <th className="px-6 py-4 hidden md:table-cell font-bold">Rôle</th>
                      <th className="px-6 py-4 font-bold">Statut</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16A34A]/5">
                    {users.results.map((user) => (
                      <tr key={user.id} className="hover:bg-[#F0FDF4] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]">
                                {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                              </div>
                              {user.is_active && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#16A34A] border-2 border-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#14532D] text-sm truncate">
                                {user.first_name || user.last_name
                                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                  : user.email}
                              </div>
                              <div className="text-xs text-[#14532D]/50 truncate">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              user.role === 'admin'
                                ? 'bg-[#FEF3C7] text-[#B88400] border border-[#FCD34D]/40'
                                : user.role === 'org_admin'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {user.role === 'org_admin'
                              ? 'Admin Entreprise'
                              : user.role || 'Utilisateur'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              toggleUserStatusMutation.mutate({
                                id: user.id,
                                is_active: !user.is_active,
                              })
                            }
                            disabled={toggleUserStatusMutation.isPending}
                            className={`p-2 rounded-lg transition-all ${
                              user.is_active
                                ? 'text-rose-500 hover:bg-rose-50'
                                : 'text-[#16A34A] hover:bg-[#F0FDF4]'
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
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* FOOTER */}
      {/* ========================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span>
            <span className="text-[#16A34A] font-bold">
              {statsData.opportunities?.total || 0}
            </span>{' '}
            offres totales
          </span>
          <span className="hidden xs:block w-px h-4 bg-[#16A34A]/20" />
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#16A34A]" />
            <span className="text-[#16A34A]/70 font-medium">Système opérationnel - Niger</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="w-3 h-3 text-[#FCD34D]" />
            Sécurisé
          </span>
          <span className="w-px h-4 bg-[#16A34A]/20" />
          <span>v1.0.0</span>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;