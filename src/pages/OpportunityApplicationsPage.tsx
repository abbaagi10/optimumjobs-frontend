// src/pages/OpportunityApplicationsPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Application, ApplicationStatus } from '../types';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Home, Loader2, Eye, FileText, Download,
  User, Briefcase, MapPin, Mail, Phone,
  CheckCircle, XCircle, Clock, Users, ChevronDown,
  ExternalLink, Building2, Calendar, Globe,
  Edit2, Trash2, Zap, Shield, Activity, Crown,
  ChevronRight, Award, Star, TrendingUp,
  Search, AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// ==========================================================
// STATUS BADGE
// ==========================================================

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const statusMap: Record<string, { icon: JSX.Element; label: string; className: string; dotColor: string }> = {
    'submitted': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En attente',
      className: 'bg-[#FEF3C7] text-[#B88400] border-[#FCD34D]/40',
      dotColor: 'bg-[#FCD34D] animate-pulse'
    },
    'under_review': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En examen',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500'
    },
    'shortlisted': {
      icon: <Star className="w-3 h-3" />,
      label: 'Présélectionnée',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
      dotColor: 'bg-purple-500'
    },
    'interview': {
      icon: <Users className="w-3 h-3" />,
      label: 'Entretien',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dotColor: 'bg-indigo-500'
    },
    'accepted': {
      icon: <Award className="w-3 h-3" />,
      label: 'Acceptée',
      className: 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20',
      dotColor: 'bg-[#16A34A]'
    },
    'rejected': {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Refusée',
      className: 'bg-rose-50 text-rose-600 border-rose-200',
      dotColor: 'bg-rose-500'
    },
    'withdrawn': {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Retirée',
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.icon}
      {config.label}
    </span>
  );
};

// ==========================================================
// STAT CARD
// ==========================================================

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    green: {
      bar: 'bg-[#16A34A]',
      iconBg: 'bg-gradient-to-br from-[#16A34A] to-[#15803D]',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(22,163,74,0.3)]',
    },
    amber: {
      bar: 'bg-[#FCD34D]',
      iconBg: 'bg-gradient-to-br from-[#FCD34D] to-[#EAB308]',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(252,211,77,0.4)]',
    },
    blue: {
      bar: 'bg-blue-500',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)]',
    },
    purple: {
      bar: 'bg-purple-500',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      shadow: 'shadow-[0_8px_16px_-4px_rgba(168,85,247,0.3)]',
    },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className="group relative bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1">
      <div className={`h-1 ${c.bar}`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg} ${c.shadow} group-hover:scale-105 transition-transform shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#14532D]/50 mb-1 truncate">
          {title}
        </div>
        <div className="text-2xl font-extrabold text-[#14532D] tracking-tight">
          {value}
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export const OpportunityApplicationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [expandedApplication, setExpandedApplication] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // ==========================================================
  // QUERIES
  // ==========================================================

  const { data: orgsData } = useQuery({
    queryKey: ['myOrganizations'],
    queryFn: async () => {
      const response = await apiClient.get('/organizations/');
      return response.data;
    },
  });

  const orgs = orgsData?.results || orgsData || [];
  const orgId = orgs.length > 0 ? orgs[0]?.id : null;

  const { data: opportunity, isLoading: isLoadingOpp, error: oppError } = useQuery({
    queryKey: ['opportunityManage', id],
    queryFn: async () => {
      const response = await apiClient.get(`/opportunities/manage/${id}/`);
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: applicationsData, isLoading: isLoadingApps } = useQuery({
    queryKey: ['opportunityApplications', id, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      const response = await apiClient.get(
        `/opportunities/${id}/applications/?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: number; status: ApplicationStatus }) =>
      apiClient.patch(`/applications/${applicationId}/status/`, { status }),
    onSuccess: () => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['opportunityApplications', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    },
  });

  const deleteOpportunityMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/opportunities/manage/${id}/`);
    },
    onSuccess: () => {
      toast.success('Offre supprimée');
      navigate('/organization/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    },
  });

  const publishOpportunityMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/opportunities/manage/${id}/publish/`);
    },
    onSuccess: () => {
      toast.success('Offre publiée');
      queryClient.invalidateQueries({ queryKey: ['opportunityManage', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la publication');
    },
  });

  const closeOpportunityMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/opportunities/manage/${id}/close/`);
    },
    onSuccess: () => {
      toast.success('Offre fermée');
      queryClient.invalidateQueries({ queryKey: ['opportunityManage', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la fermeture');
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);
  const handleGoToDashboard = () => navigate('/organization/dashboard');

  const handleToggleExpand = (applicationId: number) => {
    setExpandedApplication(
      expandedApplication === applicationId ? null : applicationId
    );
  };

  const handleDelete = () => {
    if (confirm('Voulez-vous vraiment supprimer cette offre ? Cette action est irréversible.')) {
      deleteOpportunityMutation.mutate();
    }
  };

  const handlePublish = () => {
    if (confirm('Voulez-vous publier cette offre ? Elle sera visible par les candidats.')) {
      publishOpportunityMutation.mutate();
    }
  };

  const handleClose = () => {
    if (confirm('Voulez-vous fermer cette offre ? Les candidats ne pourront plus postuler.')) {
      closeOpportunityMutation.mutate();
    }
  };

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const applications = applicationsData?.results || applicationsData || [];

  const filteredApplications = applications.filter((app: any) => {
    const name = `${app.candidate_details?.first_name || ''} ${
      app.candidate_details?.last_name || ''
    }`.toLowerCase();
    const email = (app.candidate_details?.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(
      (a: any) => a.status === 'submitted' || a.status === 'under_review'
    ).length,
    shortlisted: applications.filter(
      (a: any) => a.status === 'shortlisted' || a.status === 'interview'
    ).length,
    accepted: applications.filter((a: any) => a.status === 'accepted').length,
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoadingOpp || isLoadingApps) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#14532D]/60 font-medium">
          Chargement des candidatures...
        </p>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (oppError || !opportunity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
            <Building2 className="w-10 h-10 text-rose-500" />
          </div>
          <p className="text-lg font-extrabold text-[#14532D]">Offre non trouvée</p>
          <p className="text-sm text-[#14532D]/60 mt-2">
            Vous n'avez pas accès à cette offre ou elle n'existe pas.
          </p>
          <button
            onClick={handleGoToDashboard}
            className="mt-6 px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleGoBack}
            className="group flex items-center gap-2 rounded-xl border border-[#16A34A]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          <button
            onClick={handleGoHome}
            className="group flex items-center gap-2 rounded-xl border border-[#16A34A]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            <Home className="h-4 w-4 text-[#16A34A]" />
            <span className="hidden sm:inline">Accueil</span>
          </button>

          <button
            onClick={handleGoToDashboard}
            className="group flex items-center gap-2 rounded-xl border border-[#16A34A]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            <Building2 className="h-4 w-4 text-[#16A34A]" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white border border-[#16A34A]/15 px-4 py-1.5 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)] self-start sm:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
          </span>
          <span className="text-xs text-[#14532D]/70 font-semibold">
            Gestion des candidatures
          </span>
        </div>
      </div>

      {/* ======================================================
          DÉTAILS DE L'OFFRE
      ====================================================== */}

      <div className="bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#16A34A] via-[#FCD34D] to-[#16A34A]" />

        <div className="p-5 sm:p-6 md:p-8 space-y-6">

          <div className="flex flex-col gap-4">
            <div className="space-y-3 flex-1 min-w-0">

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#14532D] break-words">
                  {opportunity.title}
                </h1>

                {opportunity.status === 'active' && (
                  <span className="text-xs font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                )}
                {opportunity.status === 'pending_review' && (
                  <span className="text-xs font-bold bg-[#FEF3C7] text-[#B88400] border border-[#FCD34D]/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    En attente
                  </span>
                )}
                {opportunity.status === 'closed' && (
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Fermée
                  </span>
                )}
                {opportunity.is_urgent && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Urgent
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#14532D]/60">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="truncate font-medium">
                    {opportunity.organization_name || 'Mon organisation'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#14532D]/40 shrink-0" />
                  <span className="truncate">
                    {opportunity.city || opportunity.location || 'Non spécifié'}
                  </span>
                </span>
                {opportunity.salary_min && opportunity.salary_max && (
                  <span className="flex items-center gap-1.5 text-[#16A34A] font-bold">
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {opportunity.salary_min.toLocaleString()} - {opportunity.salary_max.toLocaleString()} FCFA
                    </span>
                  </span>
                )}
                {opportunity.is_remote && (
                  <span className="flex items-center gap-1 text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#16A34A]/20 font-semibold">
                    <Globe className="w-3 h-3" />
                    Télétravail
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#14532D]/40 shrink-0" />
                  Publiée le{' '}
                  {new Date(opportunity.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Actions sur l'offre */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-4 border-t border-[#16A34A]/10">
              {opportunity.status === 'pending_review' && (
                <button
                  onClick={handlePublish}
                  disabled={publishOpportunityMutation.isPending}
                  className="px-4 py-2.5 bg-[#16A34A] text-white rounded-xl text-sm font-bold hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {publishOpportunityMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Publier
                </button>
              )}

              {opportunity.status === 'active' && (
                <button
                  onClick={handleClose}
                  disabled={closeOpportunityMutation.isPending}
                  className="px-4 py-2.5 bg-[#FEF3C7] text-[#B88400] border border-[#FCD34D]/40 rounded-xl text-sm font-bold hover:bg-[#FCD34D]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {closeOpportunityMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Fermer
                </button>
              )}

              <Link
                to={`/organization/opportunities/${opportunity.id}/edit`}
                className="px-4 py-2.5 bg-white border border-blue-200 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleteOpportunityMutation.isPending}
                className="px-4 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleteOpportunityMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            </div>
          </div>

          {/* Description */}
          {opportunity.description && (
            <div className="pt-4 border-t border-[#16A34A]/10">
              <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#16A34A]" />
                Description
              </h2>
              <p className="text-sm text-[#14532D]/80 whitespace-pre-wrap leading-relaxed">
                {opportunity.description}
              </p>
            </div>
          )}

          {/* Prérequis */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-[#16A34A]" />
                Prérequis
              </h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.requirements.map((req: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-[#F0FDF4] border border-[#16A34A]/15 rounded-lg text-xs text-[#14532D] font-medium"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#16A34A]/10">
            <StatCard title="Total" value={stats.total} icon={Users} color="green" />
            <StatCard title="En attente" value={stats.pending} icon={Clock} color="amber" />
            <StatCard title="Présélectionnés" value={stats.shortlisted} icon={Star} color="purple" />
            <StatCard title="Acceptés" value={stats.accepted} icon={Award} color="green" />
          </div>
        </div>
      </div>

      {/* ======================================================
          LISTE DES CANDIDATURES
      ====================================================== */}

      <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">

        <div className="flex flex-col gap-4 border-b border-[#16A34A]/10 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-[#14532D] truncate">
              Candidatures reçues
            </h2>
            <span className="text-xs font-extrabold bg-[#16A34A] text-white px-2.5 py-1 rounded-full shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]">
              {applications.length}
            </span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto bg-[#FAFAF9] text-[#14532D] px-4 py-2.5 rounded-xl border border-[#16A34A]/15 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all cursor-pointer font-semibold"
          >
            <option value="">Tous les statuts</option>
            <option value="submitted">En attente</option>
            <option value="under_review">En examen</option>
            <option value="shortlisted">Présélectionnée</option>
            <option value="interview">Entretien</option>
            <option value="accepted">Acceptée</option>
            <option value="rejected">Refusée</option>
          </select>
        </div>

        {/* Recherche */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#14532D]/40" />
          <input
            type="text"
            placeholder="Rechercher un candidat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAF9] text-[#14532D] pl-11 pr-4 py-3 rounded-xl border border-[#16A34A]/15 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 focus:bg-white transition-all text-sm placeholder-[#14532D]/30 font-medium"
          />
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 mt-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-[#16A34A]/40" />
            </div>
            <p className="text-lg font-extrabold text-[#14532D]">
              {searchTerm || selectedStatus
                ? 'Aucun candidat ne correspond à vos filtres'
                : 'Aucune candidature reçue'}
            </p>
            <p className="text-sm text-[#14532D]/60 mt-1">
              {searchTerm || selectedStatus
                ? 'Essayez de modifier vos filtres de recherche'
                : "Partagez l'offre pour attirer des candidats au Niger."}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredApplications.map((app: any) => (
              <div
                key={app.id}
                className={`bg-[#FAFAF9] border rounded-xl overflow-hidden transition-all ${
                  expandedApplication === app.id
                    ? 'border-[#16A34A]/40 bg-white'
                    : 'border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-white'
                }`}
              >
                {/* En-tête cliquable */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => handleToggleExpand(app.id)}
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]">
                        {(app.candidate_details?.first_name?.[0] || 'C').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-[#14532D] text-sm truncate">
                            {app.candidate_details?.first_name || 'Candidat'}{' '}
                            {app.candidate_details?.last_name || ''}
                          </span>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#14532D]/60 mt-1">
                          <span className="flex items-center gap-1 min-w-0">
                            <Mail className="w-3 h-3 shrink-0 text-[#16A34A]" />
                            <span className="truncate max-w-[200px]">
                              {app.candidate_details?.email || 'Email non disponible'}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3" />
                            {new Date(app.submitted_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#14532D]/40 shrink-0 transition-transform ${
                        expandedApplication === app.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Détails étendus */}
                {expandedApplication === app.id && (
                  <div className="border-t border-[#16A34A]/10 p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* Colonne gauche */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#16A34A]" />
                          Informations
                        </h4>
                        <div className="space-y-2 text-sm">
                          {app.candidate_details?.phone && (
                            <p className="flex items-center gap-2 text-[#14532D]/80">
                              <Phone className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                              <span className="truncate">{app.candidate_details.phone}</span>
                            </p>
                          )}
                          {app.candidate_details?.city && (
                            <p className="flex items-center gap-2 text-[#14532D]/80">
                              <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                              <span className="truncate">
                                {app.candidate_details.city}
                                {app.candidate_details.country &&
                                  `, ${app.candidate_details.country}`}
                              </span>
                            </p>
                          )}
                        </div>

                        {app.cover_note && (
                          <div>
                            <h5 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider">
                              Lettre de motivation
                            </h5>
                            <p className="text-xs text-[#14532D]/70 bg-[#FAFAF9] p-3 rounded-lg border border-[#16A34A]/10 mt-1.5 leading-relaxed">
                              {app.cover_note}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Colonne droite */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-[#16A34A]" />
                          Compétences & CV
                        </h4>

                        {app.candidate_details?.skills &&
                          app.candidate_details.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {app.candidate_details.skills.slice(0, 6).map((skill: any) => (
                                <span
                                  key={skill.id}
                                  className="text-[10px] bg-[#F0FDF4] text-[#16A34A] px-2 py-0.5 rounded-full border border-[#16A34A]/20 font-semibold"
                                >
                                  {skill.name}
                                </span>
                              ))}
                              {app.candidate_details.skills.length > 6 && (
                                <span className="text-[10px] text-[#14532D]/40">
                                  +{app.candidate_details.skills.length - 6}
                                </span>
                              )}
                            </div>
                          )}

                        {app.documents && app.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {app.documents.map((doc: any) => (
                              <a
                                key={doc.id}
                                href={`/api/v1/documents/${doc.document}/download/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#16A34A] hover:text-[#15803D] transition-colors flex items-center gap-1.5 bg-[#F0FDF4] px-3 py-1.5 rounded-lg border border-[#16A34A]/20 hover:border-[#16A34A]/40 font-semibold"
                              >
                                <FileText className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[100px]">
                                  {doc.document_name || 'CV'}
                                </span>
                                <Download className="w-3 h-3 shrink-0" />
                              </a>
                            ))}
                          </div>
                        )}

                        <Link
                          to={`/profile/${app.candidate}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors font-semibold group/link"
                        >
                          <ExternalLink className="w-3 h-3 group-hover/link:scale-110 transition-transform" />
                          Voir le profil complet
                          <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-[#16A34A]/10 flex flex-col xs:flex-row items-start xs:items-center gap-3">
                      <div className="flex items-center gap-2 w-full xs:w-auto">
                        <span className="text-xs text-[#14532D]/50 shrink-0 font-semibold">
                          Statut :
                        </span>
                        <select
                          value={app.status}
                          onChange={(e) => {
                            updateStatusMutation.mutate({
                              applicationId: app.id,
                              status: e.target.value as ApplicationStatus,
                            });
                          }}
                          disabled={updateStatusMutation.isPending}
                          className="flex-1 xs:flex-none bg-[#FAFAF9] text-[#14532D] px-3 py-2 rounded-lg border border-[#16A34A]/15 text-xs focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all disabled:opacity-50 cursor-pointer font-semibold"
                        >
                          <option value="submitted">En attente</option>
                          <option value="under_review">En examen</option>
                          <option value="shortlisted">Présélectionner</option>
                          <option value="interview">Entretien</option>
                          <option value="accepted">Accepter</option>
                          <option value="rejected">Refuser</option>
                        </select>
                      </div>
                      {updateStatusMutation.isPending && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A34A]" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span className="truncate max-w-[220px] sm:max-w-none">
            <span className="text-[#16A34A] font-bold truncate">{opportunity.title}</span> • Candidatures
          </span>
          <span className="hidden xs:block w-px h-4 bg-[#16A34A]/20" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-[#16A34A]" />
            <span className="text-[#16A34A]/70 font-medium">Sécurisé - Niger</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#FCD34D]" />
            v1.0.0
          </span>
          <span className="w-px h-4 bg-[#16A34A]/20" />
          <span>Gestion des candidatures</span>
        </div>
      </div>

    </div>
  );
};

export default OpportunityApplicationsPage;