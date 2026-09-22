// src/pages/JobDetailPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import { applicationsApi } from '../api/applications';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Loader2, Building2, MapPin, Calendar, Briefcase,
  ArrowLeft, Home, Clock, CheckCircle2, Award, Users,
  Globe, FileText, Send, Check, XCircle,
  Sparkles, Zap, Shield, Activity, ChevronRight,
  Star, Heart, Share2, Copy,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ==========================================================
// STATUS BADGE
// ==========================================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { icon: JSX.Element; label: string; className: string; dotColor: string }> = {
    'submitted': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En attente',
      className: 'bg-[#FEF3C7] text-[#B88400] border-[#FCD34D]/40',
      dotColor: 'bg-[#FCD34D] animate-pulse'
    },
    'under_review': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En révision',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500'
    },
    'shortlisted': {
      icon: <Star className="w-3 h-3" />,
      label: 'Présélectionné',
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
      label: 'Accepté',
      className: 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20',
      dotColor: 'bg-[#16A34A]'
    },
    'rejected': {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Refusé',
      className: 'bg-rose-50 text-rose-600 border-rose-200',
      dotColor: 'bg-rose-500'
    },
    'withdrawn': {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Retiré',
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

const InfoItem = ({ icon: Icon, label, value, color = 'text-[#16A34A]' }: any) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-[#16A34A]/10 last:border-0 group hover:bg-[#F0FDF4] px-2 -mx-2 rounded-lg transition-colors">
    <div className="p-1.5 rounded-lg bg-[#F0FDF4] border border-[#16A34A]/10 shrink-0">
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <span className="text-sm text-[#14532D]/70 flex-1 truncate font-medium">{label}</span>
    <span className="text-sm text-[#14532D] font-bold text-right group-hover:text-[#16A34A] transition-colors truncate max-w-[55%]">
      {value}
    </span>
  </div>
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

  // ==========================================================
  // QUERIES
  // ==========================================================

  const { data: job, isLoading: isLoadingJob, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(Number(id)).then((res) => res.data),
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
      toast.success('Candidature envoyée');
      setCoverNote('');
      setIsApplying(false);
      queryClient.invalidateQueries({ queryKey: ['jobApplications', id] });
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
      queryClient.invalidateQueries({ queryKey: ['myApplications', 'all'] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ||
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
    toast.success('Lien copié');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Retiré des favoris' : 'Ajouté aux favoris');
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
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#14532D]/60 font-medium">
          Chargement de l'offre...
        </p>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
            <Briefcase className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#14532D]">Offre non trouvée</h2>
          <p className="text-sm text-[#14532D]/60 mt-2">
            L'offre que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={handleGoHome}
            className="mt-6 px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="max-w-5xl mx-auto space-y-6">

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
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white border border-[#16A34A]/15 px-4 py-1.5 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)] self-start sm:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
          </span>
          <span className="text-xs text-[#14532D]/70 font-semibold">Détail de l'offre</span>
        </div>
      </div>

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Colonne gauche — Détails */}
        <div className="lg:col-span-2 space-y-5">

          {/* En-tête de l'offre */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#16A34A] via-[#FCD34D] to-[#16A34A]" />

            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white shrink-0 shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)]">
                  <Building2 className="w-8 h-8" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#14532D] break-words">
                      {job.title}
                    </h1>
                    {job.is_urgent && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Urgent
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#14532D]/60 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span className="truncate font-medium">
                      {job.organization_name || 'Entreprise'}
                    </span>
                  </p>

                  {hasApplied && existingApplication && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 p-3 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <StatusBadge status={existingApplication.status} />
                      <span className="text-xs text-[#14532D]/60">
                        Candidature envoyée le{' '}
                        {new Date(existingApplication.submitted_at || existingApplication.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-[#16A34A]/10">
                <button
                  onClick={handleSaveJob}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold ${
                    isSaved
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white border border-[#16A34A]/20 text-[#14532D]/70 hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 hover:text-[#16A34A]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isSaved ? 'Sauvegardé' : 'Sauvegarder'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-white border border-[#16A34A]/20 text-[#14532D]/70 hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 hover:text-[#16A34A] transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{isCopied ? 'Copié !' : 'Copier le lien'}</span>
                </button>

                <button className="px-3 py-2 rounded-xl bg-white border border-[#16A34A]/20 text-[#14532D]/70 hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 hover:text-[#16A34A] transition-all flex items-center gap-2 text-xs sm:text-sm font-semibold ml-auto">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden xs:inline">Partager</span>
                </button>
              </div>
            </div>
          </div>

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

          {/* Prérequis */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-[#16A34A]" />
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

        {/* Colonne droite — Infos + Candidature */}
        <div className="space-y-5">

          {/* Informations */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-[#16A34A]" />
              Informations
            </h2>

            <div className="space-y-1">
              {job.city && (
                <InfoItem
                  icon={MapPin}
                  label="Localisation"
                  value={`${job.city}${job.country ? `, ${job.country}` : ', Niger'}`}
                />
              )}

              {job.is_remote && (
                <InfoItem icon={Globe} label="Télétravail" value="Oui" />
              )}

              {job.salary_min && job.salary_max && (
                <InfoItem
                  icon={Briefcase}
                  label="Salaire"
                  value={`${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} FCFA`}
                />
              )}

              {job.contract_type && (
                <InfoItem icon={FileText} label="Contrat" value={job.contract_type} />
              )}

              {job.experience_level && (
                <InfoItem icon={Users} label="Expérience" value={job.experience_level} />
              )}

              {job.application_deadline && (
                <InfoItem
                  icon={Calendar}
                  label="Date limite"
                  value={new Date(job.application_deadline).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
              )}

              {job.created_at && (
                <InfoItem
                  icon={Calendar}
                  label="Publiée le"
                  value={new Date(job.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  color="text-[#14532D]/50"
                />
              )}
            </div>

            {/* Stats */}
            <div className="mt-5 pt-4 border-t border-[#16A34A]/10">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F0FDF4] p-3 rounded-xl text-center border border-[#16A34A]/10 hover:-translate-y-0.5 transition-transform">
                  <p className="text-xs text-[#14532D]/50 font-medium">Candidatures</p>
                  <p className="text-lg font-extrabold text-[#14532D] mt-1">0</p>
                </div>
                <div className="bg-[#F0FDF4] p-3 rounded-xl text-center border border-[#16A34A]/10 hover:-translate-y-0.5 transition-transform">
                  <p className="text-xs text-[#14532D]/50 font-medium">Vues</p>
                  <p className="text-lg font-extrabold text-[#14532D] mt-1">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de candidature */}
          {!hasApplied ? (
            <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Send className="w-4 h-4 text-[#16A34A]" />
                Postuler
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#14532D]/70 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
                    Lettre de motivation{' '}
                    <span className="text-[#14532D]/40 font-normal">(optionnelle)</span>
                  </label>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Décrivez brièvement votre motivation et vos compétences..."
                    className="w-full bg-white text-[#14532D] px-4 py-3 rounded-xl border border-[#16A34A]/20 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all min-h-[120px] resize-none placeholder-[#14532D]/30 text-sm font-medium"
                  />
                </div>

                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full px-6 py-3.5 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm"
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
                </button>

                <p className="text-xs text-[#14532D]/50 text-center flex flex-wrap items-center justify-center gap-2">
                  <Shield className="w-3 h-3 text-[#16A34A] shrink-0" />
                  <span>Informations sécurisées</span>
                  <span className="text-[#16A34A]/30">•</span>
                  <span>Candidature gratuite</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#16A34A]/20">
                  <Check className="w-6 h-6 text-[#16A34A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-[#14532D] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                    Candidature envoyée
                  </h3>
                  <p className="text-xs text-[#14532D]/60 mt-1">
                    Vous avez déjà postulé à cette offre le{' '}
                    {existingApplication
                      ? new Date(existingApplication.submitted_at || existingApplication.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={existingApplication?.status || 'submitted'} />
                  </div>
                  <Link
                    to="/applications"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-[#16A34A] hover:text-[#15803D] font-bold transition-colors group"
                  >
                    Voir mes candidatures
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span className="truncate max-w-[220px] sm:max-w-none">
            <span className="text-[#16A34A] font-bold truncate">{job.title}</span> • Détail
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
          <span>Détail de l'offre</span>
        </div>
      </div>

    </div>
  );
};

export default JobDetailPage;