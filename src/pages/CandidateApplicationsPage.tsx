// src/pages/CandidateApplicationsPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { applicationsApi } from '../api/applications';
import { Application, PaginatedResponse } from '../types';
import {
  Clock, CheckCircle2, XCircle, FileText, Building2, Loader2,
  ArrowLeft, Eye, Trash2, AlertCircle, RefreshCw,
  Sparkles, Award, Star, Calendar,
  Grid3x3, List,
  Activity, Shield, Home, Inbox, Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';

// ==========================================================
// STATUS BADGE
// ==========================================================

const StatusBadge = ({ status }: { status: Application['status'] }) => {
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
      icon: <CheckCircle2 className="w-3 h-3" />,
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.icon}
      {config.label}
    </span>
  );
};

// ==========================================================
// APPLICATION CARD (LIST)
// ==========================================================

const ApplicationCard = ({
  app,
  onWithdraw,
  isPending,
  index,
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
    <div
      className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        isWithdrawn
          ? 'border-slate-200 opacity-60 hover:opacity-80'
          : 'border-[#16A34A]/10 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)]'
      }`}
    >
      {/* Bordure top colorée selon statut */}
      <div className={`h-1 ${
        isWithdrawn ? 'bg-slate-300' :
        app.status === 'accepted' ? 'bg-[#16A34A]' :
        app.status === 'rejected' ? 'bg-rose-500' :
        app.status === 'submitted' ? 'bg-[#FCD34D]' :
        app.status === 'under_review' ? 'bg-blue-500' :
        app.status === 'shortlisted' ? 'bg-purple-500' :
        app.status === 'interview' ? 'bg-indigo-500' :
        'bg-[#16A34A]'
      }`} />

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">

          {/* Header — Titre + badges */}
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`font-extrabold text-base sm:text-lg break-words ${
                isWithdrawn ? 'text-slate-400' : 'text-[#14532D] group-hover:text-[#16A34A] transition-colors'
              }`}>
                {app.opportunity_title || app.job_details?.title || "Offre d'emploi"}
              </h3>
              <StatusBadge status={app.status} />
              {!isWithdrawn && app.status === 'shortlisted' && (
                <span className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Présélection
                </span>
              )}
              {!isWithdrawn && app.status === 'interview' && (
                <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Entretien
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#14532D]/60">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none font-medium">
                  {app.organization_name || app.job_details?.organization_name || 'Entreprise'}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#14532D]/40 shrink-0" />
                Postulée le {new Date(app.submitted_at || app.created_at || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              {isWithdrawn && (
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Retirée
                </span>
              )}
              {!isWithdrawn && app.status === 'accepted' && (
                <span className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  Félicitations !
                </span>
              )}
            </div>

            {/* Cover note */}
            {app.cover_note && (
              <p className={`text-xs bg-[#FAFAF9] p-3 rounded-xl border border-[#16A34A]/10 mt-2 w-full line-clamp-2 leading-relaxed ${
                isWithdrawn ? 'text-slate-400' : 'text-[#14532D]/70'
              }`}>
                "{app.cover_note}"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 shrink-0 pt-2 border-t border-[#16A34A]/10">

            <Link
              to={`/jobs/${app.opportunity}`}
              className="flex-1 xs:flex-none px-4 py-2.5 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all flex items-center justify-center gap-2 group/link"
            >
              <Eye className="w-4 h-4 text-[#16A34A] group-hover/link:scale-110 transition-transform" />
              Voir l'offre
            </Link>

            {canWithdraw && (
              <button
                onClick={() => onWithdraw(app.id, app.opportunity_title || app.job_details?.title || 'cette offre')}
                disabled={isPending}
                className="flex-1 xs:flex-none px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-rose-100 hover:border-rose-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Retirer
              </button>
            )}

            {isWithdrawn && (
              <span className="flex-1 xs:flex-none px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Retirée
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const CandidateApplicationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
          page_size: pageSize,
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
    onSuccess: () => {
      toast.success('Candidature retirée');
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['myApplications', 'all'] });
      refetch();
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.detail ||
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

  const filteredApplications =
    statusFilter === 'all'
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
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#14532D]/60 font-medium">
          Chargement de vos candidatures...
        </p>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ======================================================
          BARRE DE NAVIGATION
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
            onClick={handleRefresh}
            className={`group p-2.5 rounded-xl border border-[#16A34A]/15 bg-white text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#16A34A] ${isRefreshing ? 'animate-spin' : ''}`}
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white border border-[#16A34A]/15 px-4 py-1.5 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
            <span className="text-xs text-[#14532D]/70 font-semibold">Mes candidatures</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          EN-TÊTE
      ====================================================== */}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#14532D] tracking-tight">
            Mes Candidatures
          </h1>
          <span className="px-3 py-1 text-xs font-extrabold bg-[#16A34A] text-white rounded-full shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]">
            {applications.length}
          </span>
        </div>
        <p className="text-sm text-[#14532D]/60">
          Suivez l'état d'avancement de toutes vos postulations au Niger.
        </p>

        {/* Stats inline */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <span className="text-[#14532D]/60 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
            Total : <span className="font-bold text-[#14532D]">{applications.length}</span>
          </span>
          <span className="text-[#16A34A] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Actives : <span className="font-bold">{activeApplications.length}</span>
          </span>
          {withdrawnApplications.length > 0 && (
            <span className="text-[#14532D]/50 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Retirées : <span className="font-bold">{withdrawnApplications.length}</span>
            </span>
          )}
          {statusCounts.accepted > 0 && (
            <span className="text-[#16A34A] flex items-center gap-1.5 font-semibold">
              <Award className="w-3.5 h-3.5" />
              Acceptées : {statusCounts.accepted} 🎉
            </span>
          )}
        </div>
      </div>

      {/* ======================================================
          FILTRES ET VUE
      ====================================================== */}

      <div className="flex flex-col gap-3">

        {/* Filtres scrollables */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
          <div className="flex gap-2 min-w-max">
            {['all', 'submitted', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[#16A34A] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]'
                    : 'bg-white text-[#14532D]/60 border border-[#16A34A]/15 hover:border-[#16A34A]/30 hover:text-[#16A34A]'
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
                  <span className="ml-1 opacity-70">
                    ({statusCounts[status as keyof typeof statusCounts] || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle vue */}
        <div className="flex justify-end">
          <div className="flex gap-1 bg-white border border-[#16A34A]/15 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#16A34A] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]'
                  : 'text-[#14532D]/50 hover:text-[#16A34A]'
              }`}
              title="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
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

      {/* ======================================================
          LISTE DES CANDIDATURES
      ====================================================== */}

      {filteredApplications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#16A34A]/10 rounded-2xl px-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
            <Inbox className="w-10 h-10 text-[#16A34A]/40" />
          </div>
          <p className="text-lg font-extrabold text-[#14532D]">
            {statusFilter !== 'all' ? 'Aucune candidature avec ce statut' : 'Aucune candidature'}
          </p>
          <p className="text-sm text-[#14532D]/60 mt-1">
            {statusFilter !== 'all'
              ? 'Essayez de modifier votre filtre'
              : "Vous n'avez encore postulé à aucune offre d'emploi au Niger."}
          </p>
          {statusFilter === 'all' && (
            <Link
              to="/jobs"
              className="inline-block mt-5 px-6 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all"
            >
              Voir les offres
            </Link>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredApplications.map((app, index) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onWithdraw={handleWithdraw}
              isPending={withdrawMutation.isPending}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className={`group bg-white border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                app.status === 'withdrawn'
                  ? 'border-slate-200 opacity-60'
                  : 'border-[#16A34A]/10 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)]'
              }`}
            >
              {/* Bordure top */}
              <div className={`h-1 ${
                app.status === 'withdrawn' ? 'bg-slate-300' :
                app.status === 'accepted' ? 'bg-[#16A34A]' :
                app.status === 'rejected' ? 'bg-rose-500' :
                app.status === 'submitted' ? 'bg-[#FCD34D]' :
                'bg-[#16A34A]'
              }`} />

              <div className="p-4 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-bold text-[#14532D] text-sm line-clamp-2 flex-1 min-w-0 group-hover:text-[#16A34A] transition-colors">
                    {app.opportunity_title || 'Offre'}
                  </h4>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-xs text-[#14532D]/60 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 shrink-0 text-[#16A34A]" />
                  <span className="truncate font-medium">
                    {app.organization_name || 'Entreprise'}
                  </span>
                </p>
                <p className="text-xs text-[#14532D]/40 mt-2">
                  {new Date(app.submitted_at || app.created_at || Date.now()).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#16A34A]/10 mt-auto">
                  <Link
                    to={`/jobs/${app.opportunity}`}
                    className="flex-1 text-center px-3 py-2 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-lg text-xs font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all"
                  >
                    Voir
                  </Link>
                  {app.status !== 'withdrawn' &&
                    (app.status === 'submitted' || app.status === 'under_review') && (
                      <button
                        onClick={() => handleWithdraw(app.id, app.opportunity_title || 'cette offre')}
                        disabled={withdrawMutation.isPending}
                        className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        Retirer
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span>
            <span className="text-[#16A34A] font-bold">{applications.length}</span> candidature{applications.length > 1 ? 's' : ''} au total
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
          <span>Mes candidatures</span>
        </div>
      </div>

    </div>
  );
};

export default CandidateApplicationsPage;