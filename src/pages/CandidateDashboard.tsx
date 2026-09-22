// src/pages/CandidateDashboard.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';
import { jobsApi } from '../api/jobs';
import { profileApi } from '../api/profile';
import {
  Briefcase, Clock, XCircle, Search, Building2, FileText,
  Loader2, MapPin, Eye, Bookmark, ArrowRight, Calendar, Users,
  LayoutGrid, List, Award, Zap, Star, Shield, Activity,
  Crown, Globe, Mail, Inbox,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Application, PaginatedResponse, CandidateProfile, JobPosting } from '../types';

// ==========================================================
// STAT CARD
// ==========================================================

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => {
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
    <div className="group relative bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1 cursor-pointer">
      <div className={`h-1 ${c.bar}`} />

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.iconBg} ${c.shadow} group-hover:scale-105 transition-transform shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
              trend >= 0
                ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div className="text-xs font-semibold uppercase tracking-wider text-[#14532D]/50 mb-1 truncate">
          {title}
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#14532D] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-[#14532D]/50 mt-1.5 line-clamp-2">{subtitle}</div>
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
// MAIN COMPONENT
// ==========================================================

export const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'applications' | 'jobs'>('jobs');
  const [jobFilter, setJobFilter] = useState<string>('all');

  // ==========================================================
  // QUERIES (identiques à l'original)
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
    staleTime: 5 * 60 * 1000,
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery<CandidateProfile>({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile().then((res) => res.data),
  });

  // ==========================================================
  // COMPUTED (identiques à l'original)
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
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.organization_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === '' ||
      (job.city || '').toLowerCase().includes(locationFilter.toLowerCase());
    const matchesStatus = jobFilter === 'all' || job.status === jobFilter;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoadingApps || isLoadingJobs || isLoadingProfile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#14532D]/60 font-medium">
          Chargement de votre tableau de bord...
        </p>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ========================================================== */}
      {/* EN-TÊTE */}
      {/* ========================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)]">
              {profile?.first_name?.[0] || profile?.last_name?.[0] || 'C'}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#16A34A] border-2 border-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#14532D] flex flex-wrap items-center gap-2">
              <span className="truncate">Bonjour {profile?.first_name || 'Candidat'} 👋</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#16A34A] text-white rounded-full shrink-0">
                CANDIDAT
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#14532D]/60 mt-1.5">
              {profile?.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span className="truncate">
                    {profile?.city}{profile?.country ? `, ${profile.country}` : ', Niger'}
                  </span>
                </span>
              )}
              {profile?.email && (
                <span className="hidden sm:flex items-center gap-1.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-[#16A34A]" />
                  <span className="truncate max-w-[180px]">{profile.email}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-[#16A34A] font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                </span>
                En ligne
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-full bg-white border border-[#16A34A]/15 px-4 py-1.5 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)]">
            <Crown className="w-3 h-3 text-[#FCD34D]" />
            <span className="text-xs text-[#14532D]/70 font-semibold">Dashboard</span>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* STATISTIQUES */}
      {/* ========================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Candidatures"
          value={stats.totalApplications}
          icon={Briefcase}
          color="green"
          subtitle={`${activeApplications.length} actives au Niger`}
          trend={12}
        />
        <StatCard
          title="En cours"
          value={stats.inReview}
          icon={Clock}
          color="amber"
          subtitle="En attente de réponse"
          trend={-3}
        />
        <StatCard
          title="Entretiens"
          value={stats.interviewsCount}
          icon={Users}
          color="purple"
          subtitle="Présélections au Niger"
          trend={25}
        />
        <StatCard
          title="Acceptées"
          value={stats.acceptedCount}
          icon={Award}
          color="green"
          subtitle="Félicitations ! 🎉"
          trend={8}
        />
      </div>

      {/* ========================================================== */}
      {/* ONGLETS */}
      {/* ========================================================== */}

      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-[#16A34A]/15 w-full shadow-[0_2px_8px_-2px_rgba(22,163,74,0.08)]">
        <button
          onClick={() => setViewMode('jobs')}
          className={`flex-1 px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'jobs'
              ? 'bg-[#16A34A] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]'
              : 'text-[#14532D]/60 hover:text-[#16A34A] hover:bg-[#F0FDF4]'
          }`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" />
          <span className="truncate">Offres</span>
          <span className={`text-xs ${viewMode === 'jobs' ? 'text-white/80' : 'text-[#16A34A]'}`}>
            ({allJobs.length})
          </span>
        </button>
        <button
          onClick={() => setViewMode('applications')}
          className={`flex-1 px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            viewMode === 'applications'
              ? 'bg-[#16A34A] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]'
              : 'text-[#14532D]/60 hover:text-[#16A34A] hover:bg-[#F0FDF4]'
          }`}
        >
          <List className="w-4 h-4 shrink-0" />
          <span className="truncate">Mes candidatures</span>
          <span className={`text-xs ${viewMode === 'applications' ? 'text-white/80' : 'text-[#16A34A]'}`}>
            ({activeApplications.length})
          </span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* VUE 1 : OFFRES */}
      {/* ========================================================== */}

      {viewMode === 'jobs' && (
        <div className="space-y-4">

          {/* Filtres */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-4">
            <div className="flex flex-col gap-3">
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#14532D]/40 group-focus-within:text-[#16A34A] transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un poste, une entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAFAF9] text-[#14532D] text-sm pl-11 pr-4 py-3 rounded-xl border border-[#16A34A]/15 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 focus:bg-white transition-all placeholder-[#14532D]/30 font-medium"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#14532D]/40 group-focus-within:text-[#16A34A] transition-colors" />
                  <input
                    type="text"
                    placeholder="Ville au Niger..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full bg-[#FAFAF9] text-[#14532D] text-sm pl-11 pr-4 py-3 rounded-xl border border-[#16A34A]/15 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 focus:bg-white transition-all placeholder-[#14532D]/30 font-medium"
                  />
                </div>
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="w-full sm:w-48 bg-[#FAFAF9] text-[#14532D] text-sm px-4 py-3 rounded-xl border border-[#16A34A]/15 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 focus:bg-white transition-all cursor-pointer font-semibold"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives</option>
                  <option value="published">Publiées</option>
                  <option value="closed">Fermées</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste */}
          <div className="space-y-3">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="group relative bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1"
                >
                  <div className="h-1 bg-[#16A34A]" />

                  <div className="p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)] group-hover:scale-105 transition-transform">
                          <Building2 className="w-6 h-6" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-extrabold text-[#14532D] group-hover:text-[#16A34A] transition-colors break-words">
                              {job.title}
                            </h3>
                            {job.is_urgent && (
                              <span className="text-[10px] sm:text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Urgent
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-[#14532D]/60 truncate mt-1 font-medium">
                            {job.organization_name || 'Entreprise'}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-[#14532D]/50">
                            {job.city && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                                <span className="truncate">
                                  {job.city}{job.country ? `, ${job.country}` : ', Niger'}
                                </span>
                              </span>
                            )}
                            {job.is_remote && (
                              <span className="px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 flex items-center gap-1 font-semibold">
                                <Globe className="w-3 h-3" />
                                Télétravail
                              </span>
                            )}
                            {job.salary_min && job.salary_max && (
                              <span className="flex items-center gap-1 text-[#16A34A] font-bold">
                                💰 {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} FCFA
                              </span>
                            )}
                            {job.application_deadline && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(job.application_deadline).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 pt-3 border-t border-[#16A34A]/10">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="flex-1 xs:flex-none px-4 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          Voir l'offre
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <button
                          className="flex-1 xs:flex-none p-2.5 text-[#14532D]/40 hover:text-[#16A34A] hover:bg-[#F0FDF4] rounded-xl transition-all border border-[#16A34A]/10 xs:border-transparent"
                          title="Sauvegarder"
                        >
                          <Bookmark className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white border border-[#16A34A]/10 rounded-2xl px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-[#16A34A]/40" />
                </div>
                <p className="text-lg font-extrabold text-[#14532D]">Aucune offre trouvée</p>
                <p className="text-sm text-[#14532D]/60 mt-1">
                  Essayez de modifier vos critères de recherche.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* VUE 2 : MES CANDIDATURES */}
      {/* ========================================================== */}

      {viewMode === 'applications' && (
        <div className="space-y-4">

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#14532D]/60 font-medium">
                <span className="font-extrabold text-[#14532D]">{activeApplications.length}</span> candidature{activeApplications.length > 1 ? 's' : ''} active{activeApplications.length > 1 ? 's' : ''}
                {allApplications.length > activeApplications.length && (
                  <span className="text-[#14532D]/40 ml-2">
                    ({allApplications.length - activeApplications.length} retirée{allApplications.length - activeApplications.length > 1 ? 's' : ''})
                  </span>
                )}
              </span>
              {stats.acceptedCount > 0 && (
                <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#16A34A]/20 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {stats.acceptedCount} acceptée{stats.acceptedCount > 1 ? 's' : ''} 🎉
                </span>
              )}
            </div>
            <Link
              to="/applications"
              className="text-sm text-[#16A34A] hover:text-[#15803D] font-bold flex items-center gap-1 group hover:gap-2 transition-all self-start sm:self-auto"
            >
              Voir toutes
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Liste des candidatures */}
          <div className="space-y-3">
            {activeApplications.length > 0 ? (
              activeApplications.map((app) => (
                <div
                  key={app.id}
                  className="group relative bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/20 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:-translate-y-1"
                >
                  {/* Bordure top selon statut */}
                  <div className={`h-1 ${
                    app.status === 'accepted' ? 'bg-[#16A34A]' :
                    app.status === 'rejected' ? 'bg-rose-500' :
                    app.status === 'submitted' ? 'bg-[#FCD34D]' :
                    app.status === 'under_review' ? 'bg-blue-500' :
                    app.status === 'shortlisted' ? 'bg-purple-500' :
                    app.status === 'interview' ? 'bg-indigo-500' :
                    'bg-[#16A34A]'
                  }`} />

                  <div className="p-5">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-[#14532D] group-hover:text-[#16A34A] transition-colors break-words">
                            {app.job_details?.title || app.opportunity_title || "Offre d'emploi"}
                          </h3>
                          <StatusBadge status={app.status} />
                          {app.status === 'shortlisted' && (
                            <span className="text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Présélection
                            </span>
                          )}
                          {app.status === 'interview' && (
                            <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                              <Users className="w-3 h-3" /> Entretien
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#14532D]/60">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                            <span className="truncate max-w-[200px] font-medium">
                              {app.job_details?.organization_name || app.organization_name || 'Entreprise'}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            Postulé le {new Date(app.submitted_at || app.applied_at || app.created_at || Date.now()).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {app.cover_note && (
                          <p className="text-xs text-[#14532D]/60 bg-[#FAFAF9] p-3 rounded-xl border border-[#16A34A]/10 mt-2 line-clamp-2 leading-relaxed">
                            "{app.cover_note}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-[#16A34A]/10">
                        <Link
                          to={`/jobs/${app.opportunity}`}
                          className="w-full xs:w-auto px-4 py-2.5 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-xl text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all flex items-center justify-center gap-2 group/link"
                        >
                          <Eye className="w-4 h-4 text-[#16A34A] group-hover/link:scale-110 transition-transform" />
                          Voir l'offre
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white border border-[#16A34A]/10 rounded-2xl px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#F0FDF4] border border-[#16A34A]/10 flex items-center justify-center">
                  <Inbox className="w-10 h-10 text-[#16A34A]/40" />
                </div>
                <p className="text-lg font-extrabold text-[#14532D]">Aucune candidature active</p>
                <p className="text-sm text-[#14532D]/60 mt-1">
                  Vous n'avez pas encore postulé à des offres au Niger.
                </p>
                <Link
                  to="/jobs"
                  className="inline-block mt-5 px-6 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all"
                >
                  Commencer à postuler
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* FOOTER */}
      {/* ========================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span>
            <span className="text-[#16A34A] font-bold">{profile?.first_name || 'Candidat'}</span> • Tableau de bord
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
          <span>Dashboard Candidat</span>
        </div>
      </div>

    </div>
  );
};

export default CandidateDashboard;