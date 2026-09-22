// src/pages/AdminOpportunityDetailPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import {
  ArrowLeft, Loader2, Building2, MapPin, Calendar,
  Briefcase, Check, X, Clock, AlertCircle, Users,
  FileText, Globe, RefreshCw,
  Shield, Award, Sparkles, Zap, TrendingUp,
  Eye, Share2, ChevronRight,
  Crown, Activity,
  Link2, ExternalLink, Send, CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

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
      icon: <Sparkles className="w-3 h-3" />,
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
// INFO ITEM
// ==========================================================

const InfoItem = ({ label, value, icon: Icon, color = 'text-[#16A34A]' }: any) => (
  <div className="flex justify-between items-center py-3 border-b border-[#16A34A]/10 last:border-0 gap-3 group hover:bg-[#F0FDF4] px-2 -mx-2 rounded-lg transition-colors">
    <span className="text-sm text-[#14532D]/60 flex items-center gap-2 shrink-0 font-medium">
      <Icon className={`w-4 h-4 ${color} shrink-0`} />
      {label}
    </span>
    <span className="text-sm text-[#14532D] font-semibold text-right group-hover:text-[#16A34A] transition-colors break-words">
      {value}
    </span>
  </div>
);

// ==========================================================
// ACTION BUTTON
// ==========================================================

const ActionButton = ({
  onClick,
  disabled,
  isLoading,
  icon: Icon,
  label,
  variant = 'primary',
  className = ''
}: any) => {
  const variants = {
    primary: 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)]',
    success: 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)]',
    amber: 'bg-[#FCD34D] hover:bg-[#EAB308] text-[#14532D] shadow-[0_4px_12px_-2px_rgba(252,211,77,0.5)] hover:shadow-[0_8px_16px_-4px_rgba(252,211,77,0.6)]',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_12px_-2px_rgba(244,63,94,0.4)]',
    secondary: 'bg-white border border-[#16A34A]/20 text-[#14532D] hover:bg-[#F0FDF4] hover:border-[#16A34A]/40',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </button>
  );
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const AdminOpportunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // ==========================================================
  // QUERIES
  // ==========================================================

  const { data: job, isLoading, refetch } = useQuery({
    queryKey: ['admin-opportunity', id],
    queryFn: () => adminApi.getAdminOpportunityDetail(Number(id)).then(res => res.data),
    enabled: !!id,
  });

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const approveMutation = useMutation({
    mutationFn: () => adminApi.reviewOpportunity(Number(id), 'approve'),
    onSuccess: () => {
      toast.success('Offre approuvée');
      queryClient.invalidateQueries({ queryKey: ['admin-opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'approbation');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminApi.reviewOpportunity(Number(id), 'reject', rejectionReason),
    onSuccess: () => {
      toast.success('Offre rejetée');
      setShowRejectForm(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors du rejet');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => adminApi.publishOpportunity(Number(id)),
    onSuccess: () => {
      toast.success('Offre publiée');
      queryClient.invalidateQueries({ queryKey: ['admin-opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la publication');
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => adminApi.closeOpportunity(Number(id)),
    onSuccess: () => {
      toast.success('Offre clôturée');
      queryClient.invalidateQueries({ queryKey: ['admin-opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la clôture');
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleCopyLink = () => {
    const url = `${window.location.origin}/jobs/${id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast.success('Lien copié');
    setTimeout(() => setIsCopied(false), 3000);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#14532D]/60 font-medium">Chargement des détails...</p>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-12">
        <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#14532D]">Offre non trouvée</h2>
          <p className="text-xs sm:text-sm text-[#14532D]/60 mt-2">
            L'offre que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mt-6 px-6 sm:px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all text-sm sm:text-base"
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
    <div className="space-y-4 sm:space-y-6">

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="group flex items-center gap-2 rounded-xl border border-[#16A34A]/15 bg-white px-3 sm:px-4 py-2.5 text-sm font-semibold text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#14532D]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Retour</span>
          </button>

          <button
            onClick={() => refetch()}
            className="group p-2.5 rounded-xl border border-[#16A34A]/15 bg-white text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] hover:text-[#16A34A]"
            title="Rafraîchir"
          >
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white border border-[#16A34A]/15 px-3 sm:px-4 py-2.5 text-sm font-semibold text-[#14532D]/70 transition-all hover:border-[#16A34A]/30 hover:text-[#16A34A]"
          >
            {isCopied ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            <span className="hidden xs:inline">
              {isCopied ? 'Copié !' : 'Copier le lien'}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-[#16A34A]/15 px-3 py-1.5 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)]">
            <Crown className="w-3 h-3 text-[#FCD34D]" />
            <span className="text-xs text-[#14532D]/70 font-semibold">Admin Niger</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          EN-TÊTE DE L'OFFRE
      ====================================================== */}

      <div className="bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden">
        {/* Bordure top colorée */}
        <div className="h-1 bg-gradient-to-r from-[#16A34A] via-[#FCD34D] to-[#16A34A]" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex-1 min-w-0">

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-[#16A34A] uppercase font-bold bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#16A34A]/20">
                  {job.opportunity_type || 'Offre'}
                </span>
                <StatusBadge status={job.status} />
                {job.is_urgent && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Urgent
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#14532D] tracking-tight break-words">
                {job.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-sm text-[#14532D]/70 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="truncate font-medium">
                    {job.organization_name || 'Entreprise'}
                  </span>
                </span>
                {job.city && (
                  <span className="text-sm text-[#14532D]/60 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {job.city}{job.country ? `, ${job.country}` : ', Niger'}
                    </span>
                  </span>
                )}
                {job.is_remote && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 flex items-center gap-1 font-semibold">
                    <Globe className="w-3 h-3" />
                    Télétravail
                  </span>
                )}
              </div>

              {/* Dates */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#14532D]/50">
                {job.created_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Créée le{' '}
                    {new Date(job.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {job.published_at && (
                  <span className="flex items-center gap-1.5 text-[#16A34A] font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    Publiée le{' '}
                    {new Date(job.published_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  ID: #{job.id}
                </span>
              </div>

              {/* Motif de rejet */}
              {job.rejection_reason && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-xs text-rose-700 flex items-start gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Motif du rejet : {job.rejection_reason}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Actions admin */}
            <div className="flex flex-col xs:flex-row flex-wrap gap-2 pt-4 border-t border-[#16A34A]/10">
              {job.status === 'pending_review' && (
                <>
                  <ActionButton
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                    isLoading={approveMutation.isPending}
                    icon={Check}
                    label="Approuver"
                    variant="success"
                    className="w-full xs:w-auto"
                  />
                  <ActionButton
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    disabled={false}
                    isLoading={false}
                    icon={X}
                    label="Refuser"
                    variant="danger"
                    className="w-full xs:w-auto"
                  />
                </>
              )}

              {job.status === 'approved' && (
                <ActionButton
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  isLoading={publishMutation.isPending}
                  icon={Sparkles}
                  label="Publier l'offre"
                  variant="amber"
                  className="w-full xs:w-auto"
                />
              )}

              {job.status === 'published' && (
                <ActionButton
                  onClick={() => closeMutation.mutate()}
                  disabled={closeMutation.isPending}
                  isLoading={closeMutation.isPending}
                  icon={X}
                  label="Clôturer"
                  variant="secondary"
                  className="w-full xs:w-auto"
                />
              )}
            </div>
          </div>

          {/* Formulaire de rejet */}
          {showRejectForm && (
            <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-sm text-rose-700 font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Motif du rejet
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi cette offre est rejetée..."
                className="w-full bg-white border border-rose-200 text-[#14532D] p-3.5 rounded-xl text-sm focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all placeholder-[#14532D]/40 resize-none"
                rows={3}
              />
              <div className="flex flex-col xs:flex-row justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 text-sm text-[#14532D]/60 hover:text-[#14532D] transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  className="px-5 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_12px_-2px_rgba(244,63,94,0.4)]"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Confirmer le rejet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Colonne gauche — Description + Compétences */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Description */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-[#16A34A]" />
              Description du poste
            </h2>
            <div className="text-[#14532D]/80 whitespace-pre-wrap leading-relaxed text-sm">
              {job.description || 'Aucune description disponible.'}
            </div>
          </div>

          {/* Compétences */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#16A34A]" />
                Compétences requises
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-[#F0FDF4] border border-[#16A34A]/15 rounded-lg text-sm text-[#14532D] font-medium hover:border-[#16A34A]/40 hover:-translate-y-0.5 transition-all cursor-default"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite — Informations */}
        <div className="space-y-4 sm:space-y-6">

          {/* Informations */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-[#16A34A]" />
              Informations
            </h2>
            <div className="space-y-1">
              <InfoItem
                label="Type"
                value={job.opportunity_type || 'Non spécifié'}
                icon={Briefcase}
                color="text-[#16A34A]"
              />
              {job.contract_type && (
                <InfoItem
                  label="Contrat"
                  value={job.contract_type}
                  icon={FileText}
                  color="text-blue-500"
                />
              )}
              {job.experience_level && (
                <InfoItem
                  label="Expérience"
                  value={job.experience_level}
                  icon={Award}
                  color="text-[#16A34A]"
                />
              )}
              {job.education_level && (
                <InfoItem
                  label="Niveau d'étude"
                  value={job.education_level}
                  icon={GraduationCap}
                  color="text-purple-500"
                />
              )}
              {job.salary_min && job.salary_max && (
                <InfoItem
                  label="Salaire"
                  value={`${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} FCFA`}
                  icon={TrendingUp}
                  color="text-[#16A34A]"
                />
              )}
              {job.is_remote && (
                <InfoItem
                  label="Télétravail"
                  value="Oui"
                  icon={Globe}
                  color="text-[#16A34A]"
                />
              )}
              {job.application_deadline && (
                <InfoItem
                  label="Date limite"
                  value={new Date(job.application_deadline).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  icon={Calendar}
                  color="text-[#FCD34D]"
                />
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#16A34A]" />
              Statistiques
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F0FDF4] p-4 rounded-xl text-center border border-[#16A34A]/10 hover:-translate-y-0.5 transition-transform">
                <p className="text-xs text-[#14532D]/50 font-medium">Candidatures</p>
                <p className="text-2xl font-extrabold text-[#14532D] mt-1">0</p>
              </div>
              <div className="bg-[#F0FDF4] p-4 rounded-xl text-center border border-[#16A34A]/10 hover:-translate-y-0.5 transition-transform">
                <p className="text-xs text-[#14532D]/50 font-medium">Vues</p>
                <p className="text-2xl font-extrabold text-[#14532D] mt-1">0</p>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#FCD34D]" />
              Actions rapides
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAF9] rounded-xl border border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] transition-all text-sm text-[#14532D]/80 hover:text-[#14532D] group font-medium">
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#16A34A]" />
                  Voir l'offre en ligne
                </span>
                <ExternalLink className="w-4 h-4 text-[#14532D]/40 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAF9] rounded-xl border border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] transition-all text-sm text-[#14532D]/80 hover:text-[#14532D] group font-medium">
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#16A34A]" />
                  Partager l'offre
                </span>
                <Share2 className="w-4 h-4 text-[#14532D]/40 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span>
            <span className="text-[#16A34A] font-bold">Offre</span> #{job.id}
          </span>
          <span className="hidden xs:block w-px h-4 bg-[#16A34A]/20" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-[#16A34A]" />
            <span className="text-[#16A34A]/70 font-medium">Sécurisé - Niger</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#FCD34D]" />
            Statut : <span className="font-semibold text-[#14532D]">{job.status}</span>
          </span>
          <span className="w-px h-4 bg-[#16A34A]/20" />
          <span>v1.0.0</span>
        </div>
      </div>

    </div>
  );
};

export default AdminOpportunityDetailPage;