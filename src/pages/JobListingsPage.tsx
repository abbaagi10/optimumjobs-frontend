// src/pages/JobListingsPage.tsx

import { useState } from 'react';
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
  X, Loader2, ArrowLeft, Home,
  Sparkles, Zap, Shield, Activity, ChevronRight,
  Globe, Calendar, TrendingUp, Heart,
  Grid3x3, List, Eye, CheckCircle2,
  RefreshCw, FileText, Inbox,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ==========================================================
// STATUS BADGE
// ==========================================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { icon: JSX.Element; label: string; className: string; dotColor: string }> = {
    'active': {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Active',
      className: 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20',
      dotColor: 'bg-[#16A34A] animate-pulse'
    },
    'pending_review': {
      icon: <Clock className="w-3 h-3" />,
      label: 'En attente',
      className: 'bg-[#FEF3C7] text-[#B88400] border-[#FCD34D]/40',
      dotColor: 'bg-[#FCD34D]'
    },
    'closed': {
      icon: <X className="w-3 h-3" />,
      label: 'Fermée',
      className: 'bg-slate-100 text-slate-500 border-slate-200',
      dotColor: 'bg-slate-400'
    },
    'published': {
      icon: <Sparkles className="w-3 h-3" />,
      label: 'Publiée',
      className: 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20',
      dotColor: 'bg-[#16A34A]'
    }
  };

  const config = statusMap[status] || {
    icon: null,
    label: status,
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    dotColor: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.icon}
      {config.label}
    </span>
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
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

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
      toast.success('Candidature envoyée');
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
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
    toast.success(
      savedJobs.includes(jobId) ? 'Retiré des favoris' : 'Ajouté aux favoris'
    );
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
      return (b.salary_max || 0) - (a.salary_max || 0);
    }
    if (sortBy === 'deadline') {
      if (!a.application_deadline) return 1;
      if (!b.application_deadline) return -1;
      return (
        new Date(a.application_deadline).getTime() -
        new Date(b.application_deadline).getTime()
      );
    }
    return 0;
  });

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

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
          <span className="text-xs text-[#14532D]/70 font-semibold">Offres d'emploi</span>
        </div>
      </div>

      {/* ======================================================
          BARRE DE RECHERCHE
      ====================================================== */}

      <div className="bg-white border border-[#16A34A]/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#14532D] flex flex-wrap items-center gap-2">
              <span>Trouvez votre prochaine opportunité</span>
              <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#16A34A]/20 shrink-0">
                {jobs.length} offre{jobs.length > 1 ? 's' : ''}
              </span>
            </h1>
            <p className="text-sm text-[#14532D]/60 mt-1">
              Découvrez les meilleures offres d'emploi au Niger
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#14532D]/40 group-focus-within:text-[#16A34A] transition-colors" />
            <input
              type="text"
              placeholder="Titre du poste, mots-clés..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FAFAF9] text-[#14532D] pl-11 pr-4 py-3 rounded-xl border border-[#16A34A]/15 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 focus:bg-white transition-all placeholder-[#14532D]/30 font-medium"
            />
          </div>

          <div className="relative group">
            <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#14532D]/40 group-focus-within:text-[#16A34A] transition-colors" />
            <input
              type="text"
              placeholder="Ville au Niger, ou Télétravail..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#FAFAF9] text-[#14532D] pl-11 pr-4 py-3 rounded-xl border border-[#16A34A]/15 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 focus:bg-white transition-all placeholder-[#14532D]/30 font-medium"
            />
          </div>

          <button
            type="submit"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4" />
            <span>Rechercher</span>
          </button>
        </form>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-[#16A34A]/10">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAFAF9] text-[#14532D] px-3 py-2 rounded-xl border border-[#16A34A]/15 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all text-xs cursor-pointer font-semibold"
            >
              <option value="recent">Plus récentes</option>
              <option value="salary">Salaire élevé</option>
              <option value="deadline">Date limite</option>
            </select>

            {(search || location) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#16A34A] hover:text-[#15803D] font-bold flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="flex gap-1 bg-[#FAFAF9] border border-[#16A34A]/15 rounded-xl p-1 self-end sm:self-auto">
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
          LISTE DES OFFRES
      ====================================================== */}

      {isJobsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
          <p className="text-sm text-[#14532D]/60 font-medium">
            Chargement des offres au Niger...
          </p>
        </div>
      ) : sortedJobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#16A34A]/10 rounded-2xl px-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
            <Inbox className="w-10 h-10 text-[#16A34A]/40" />
          </div>
          <p className="text-lg font-extrabold text-[#14532D]">
            Aucune offre ne correspond à vos critères
          </p>
          <p className="text-sm text-[#14532D]/60 mt-1">
            Essayez de modifier vos filtres de recherche.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-2 text-[#16A34A] hover:text-[#15803D] text-sm font-bold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser les filtres
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {sortedJobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1"
            >
              <div className="h-1 bg-[#16A34A]" />

              <div className="p-5">
                <div className="flex flex-col gap-4">
                  <Link to={`/jobs/${job.id}`} className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-extrabold text-[#14532D] group-hover:text-[#16A34A] transition-colors break-words">
                        {job.title}
                      </h2>
                      <StatusBadge status={job.status} />
                      {job.is_urgent && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Urgent
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#14532D]/60">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span className="truncate max-w-[180px] font-medium">
                          {job.organization_name || 'Entreprise'}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {job.city || job.location || 'Non spécifié'}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#14532D]/40 shrink-0" />
                        {new Date(job.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {job.salary_min && job.salary_max && (
                        <span className="flex items-center gap-1.5 text-[#16A34A] font-bold">
                          <TrendingUp className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} FCFA
                          </span>
                        </span>
                      )}
                      {job.is_remote && (
                        <span className="flex items-center gap-1 text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#16A34A]/20 font-semibold">
                          <Globe className="w-3 h-3" />
                          Télétravail
                        </span>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-sm text-[#14532D]/60 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </Link>

                  <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 pt-4 border-t border-[#16A34A]/10">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="flex-1 xs:flex-none px-5 py-2.5 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-xl text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all flex items-center justify-center gap-2 group/link"
                    >
                      <Eye className="w-4 h-4 text-[#16A34A] group-hover/link:scale-110 transition-transform" />
                      Voir l'offre
                    </Link>

                    <button
                      onClick={() => handleSaveJob(job.id)}
                      className={`p-2.5 rounded-xl transition-all shrink-0 border ${
                        savedJobs.includes(job.id)
                          ? 'text-rose-500 bg-rose-50 border-rose-200'
                          : 'text-[#14532D]/40 bg-white border-[#16A34A]/15 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200'
                      }`}
                      title={
                        savedJobs.includes(job.id)
                          ? 'Retirer des favoris'
                          : 'Ajouter aux favoris'
                      }
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          savedJobs.includes(job.id) ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>

                    {job.status === 'active' && (
                      <button
                        onClick={() => handleApply(job)}
                        className="flex-1 xs:flex-none px-5 py-2.5 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Postuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedJobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white border border-[#16A34A]/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1 flex flex-col"
            >
              <div className="h-1 bg-[#16A34A]" />

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-extrabold text-[#14532D] text-sm line-clamp-2 flex-1 min-w-0 group-hover:text-[#16A34A] transition-colors">
                    {job.title}
                  </h4>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-xs text-[#14532D]/60 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 shrink-0 text-[#16A34A]" />
                  <span className="truncate font-medium">
                    {job.organization_name || 'Entreprise'}
                  </span>
                </p>
                <p className="text-xs text-[#14532D]/50 mt-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {job.city || job.location || 'Non spécifié'}
                  </span>
                </p>
                {job.salary_min && job.salary_max && (
                  <p className="text-xs text-[#16A34A] mt-2 font-bold truncate">
                    {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} FCFA
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#16A34A]/10 mt-auto">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex-1 text-center px-3 py-2 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-lg text-xs font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all"
                  >
                    Voir
                  </Link>
                  {job.status === 'active' && (
                    <button
                      onClick={() => handleApply(job)}
                      className="px-3 py-2 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#15803D] shadow-[0_2px_8px_-2px_rgba(22,163,74,0.4)] transition-all"
                    >
                      Postuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================
          MODAL DE CANDIDATURE
      ====================================================== */}

      {isApplyModalOpen && selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setIsApplyModalOpen(false);
            setSelectedJob(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#16A34A]/10 pb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-[#14532D] flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#16A34A] shrink-0" />
                  Postuler à l'offre
                </h3>
                <p className="text-sm font-bold text-[#16A34A] mt-1 break-words">
                  {selectedJob.title}
                </p>
                <p className="text-xs text-[#14532D]/60 truncate">
                  {selectedJob.organization_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setSelectedJob(null);
                }}
                className="text-[#14532D]/40 hover:text-rose-500 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
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
                <label className="text-xs font-semibold text-[#14532D]/70 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  CV / Document
                </label>
                {isDocsLoading ? (
                  <div className="flex items-center gap-2 text-[#14532D]/60">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Chargement de vos documents...</span>
                  </div>
                ) : documents && documents.length > 0 ? (
                  <select
                    value={selectedDocId || ''}
                    onChange={(e) => setSelectedDocId(Number(e.target.value))}
                    className="w-full bg-white text-[#14532D] px-4 py-3 rounded-xl border border-[#16A34A]/20 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-medium"
                  >
                    <option value="">Sélectionner un document...</option>
                    {documents.map((doc: any) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.original_filename} ({doc.document_type})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-[#FEF3C7] border border-[#FCD34D]/40 rounded-xl p-3">
                    <p className="text-xs text-[#B88400] font-medium">
                      Aucun CV trouvé. Téléversez-en un depuis votre profil.
                    </p>
                    <Link
                      to="/profile"
                      className="inline-block mt-2 text-xs text-[#16A34A] hover:text-[#15803D] font-bold transition-colors"
                    >
                      Aller au profil →
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#14532D]/70 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  Lettre de motivation
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Présentez brièvement votre profil et vos motivations..."
                  className="w-full bg-white text-[#14532D] px-4 py-3 rounded-xl border border-[#16A34A]/20 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all resize-none placeholder-[#14532D]/30 font-medium"
                />
                <p className="text-xs text-[#14532D]/40 mt-1.5">
                  Optionnel — Laissez vide si vous n'avez pas de lettre.
                </p>
              </div>

              <div className="flex flex-col xs:flex-row justify-end gap-3 pt-3 border-t border-[#16A34A]/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsApplyModalOpen(false);
                    setSelectedJob(null);
                  }}
                  className="px-4 py-2.5 text-sm text-[#14532D]/60 hover:text-[#14532D] transition-colors rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="px-5 py-2.5 bg-[#16A34A] text-white font-bold rounded-xl text-sm hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span>
            <span className="text-[#16A34A] font-bold">{jobs.length}</span> offre
            {jobs.length > 1 ? 's' : ''} disponible{jobs.length > 1 ? 's' : ''}
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
          <span>Liste des offres</span>
        </div>
      </div>

    </div>
  );
};

export default JobListingsPage;