// src/pages/OpportunityApplicationsPage.tsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Application, ApplicationStatus } from '../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Home, Loader2, Eye, FileText, Download,
  User, Briefcase, GraduationCap, MapPin, Mail, Phone,
  CheckCircle, XCircle, Clock, Users, ChevronDown, ChevronUp,
  ExternalLink, Building2, Calendar, DollarSign, Globe,
  Edit2, Trash2, Sparkles, Zap, Shield, Activity, Crown,
  ChevronRight, Award, Star, TrendingUp, Filter,
  Search, Send, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

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

const tableRowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  hover: { backgroundColor: "rgba(255,255,255,0.03)" }
};

// ==========================================================
// COMPOSANTS
// ==========================================================

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
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
      icon: <Users className="w-3 h-3" />,
      label: 'Entretien',
      className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      dotColor: 'bg-indigo-400'
    },
    'accepted': {
      icon: <Award className="w-3 h-3" />,
      label: 'Acceptée',
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.icon}
      {config.label}
    </motion.span>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative group bg-slate-900/80 border border-slate-800 p-4 rounded-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${color}-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-1.5 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">
        {value}
      </div>
      {subtitle && (
        <div className="mt-0.5 text-[10px] text-slate-500">{subtitle}</div>
      )}
      <div className="mt-2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-${color}-500 to-transparent transition-all duration-700" />
    </div>
  </motion.div>
);

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');

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

  const { data: applicationsData, isLoading: isLoadingApps, refetch } = useQuery({
    queryKey: ['opportunityApplications', id, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      const response = await apiClient.get(`/opportunities/${id}/applications/?${params.toString()}`);
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
      toast.success('Statut mis à jour avec succès');
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
      toast.success('Offre supprimée avec succès');
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
      toast.success('Offre publiée avec succès ! 🚀');
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
      toast.success('Offre fermée avec succès');
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
    setExpandedApplication(expandedApplication === applicationId ? null : applicationId);
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
    const name = `${app.candidate_details?.first_name || ''} ${app.candidate_details?.last_name || ''}`.toLowerCase();
    const email = (app.candidate_details?.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a: any) => a.status === 'submitted' || a.status === 'under_review').length,
    shortlisted: applications.filter((a: any) => a.status === 'shortlisted' || a.status === 'interview').length,
    accepted: applications.filter((a: any) => a.status === 'accepted').length,
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoadingOpp || isLoadingApps) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Chargement des candidatures...</p>
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
  // ERROR
  // ==========================================================

  if (oppError || !opportunity) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <div className="bg-slate-900/80 border border-rose-500/20 rounded-3xl p-12 text-center backdrop-blur-xl">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20"
          >
            <Building2 className="w-10 h-10 text-rose-400" />
          </motion.div>
          <p className="text-lg font-semibold text-white">Offre non trouvée</p>
          <p className="text-sm text-slate-400 mt-2">Vous n'avez pas accès à cette offre ou elle n'existe pas.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToDashboard}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            Retour au dashboard
          </motion.button>
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

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ======================================================
            NAVIGATION
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToDashboard}
              className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-4 py-1.5 border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Gestion des candidatures</span>
            <Crown className="w-3 h-3 text-amber-400" />
          </div>
        </motion.div>

        {/* ======================================================
            DÉTAILS DE L'OFFRE
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl hover:border-slate-700 transition-all duration-300 space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-black text-white">{opportunity.title}</h1>
                {opportunity.status === 'active' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </motion.span>
                )}
                {opportunity.status === 'pending_review' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    En attente
                  </motion.span>
                )}
                {opportunity.status === 'closed' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    Fermée
                  </motion.span>
                )}
                {opportunity.is_urgent && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Urgent
                  </motion.span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  {opportunity.organization_name || 'Mon organisation'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {opportunity.city || opportunity.location || 'Non spécifié'}
                </span>
                {opportunity.salary_min && opportunity.salary_max && (
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {opportunity.salary_min.toLocaleString()} - {opportunity.salary_max.toLocaleString()} FCFA
                  </span>
                )}
                {opportunity.is_remote && (
                  <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Globe className="w-3 h-3" />
                    Télétravail
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Publiée le {new Date(opportunity.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Actions sur l'offre */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {opportunity.status === 'pending_review' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePublish}
                  disabled={publishOpportunityMutation.isPending}
                  className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 flex items-center gap-2 disabled:opacity-50"
                >
                  {publishOpportunityMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Publier
                </motion.button>
              )}

              {opportunity.status === 'active' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  disabled={closeOpportunityMutation.isPending}
                  className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-sm font-semibold transition-all duration-300 border border-amber-500/20 hover:border-amber-500/40 flex items-center gap-2 disabled:opacity-50"
                >
                  {closeOpportunityMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Fermer
                </motion.button>
              )}

              <Link
                to={`/organization/opportunities/${opportunity.id}/edit`}
                className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-sm font-semibold transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={deleteOpportunityMutation.isPending}
                className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-semibold transition-all duration-300 border border-rose-500/20 hover:border-rose-500/40 flex items-center gap-2 disabled:opacity-50"
              >
                {deleteOpportunityMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </motion.button>
            </div>
          </div>

          {/* Description */}
          {opportunity.description && (
            <div className="pt-4 border-t border-slate-800">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Description
              </h2>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {opportunity.description}
              </p>
            </div>
          )}

          {/* Prérequis */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Prérequis
              </h2>
              <div className="flex flex-wrap gap-2">
                {opportunity.requirements.map((req: string, index: number) => (
                  <motion.span 
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-3 py-1 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300"
                  >
                    {req}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <StatCard title="Total" value={stats.total} icon={Users} color="amber" />
            <StatCard title="En attente" value={stats.pending} icon={Clock} color="blue" />
            <StatCard title="Présélectionnés" value={stats.shortlisted} icon={Star} color="purple" />
            <StatCard title="Acceptés" value={stats.accepted} icon={Award} color="emerald" />
          </div>
        </motion.div>

        {/* ======================================================
            LISTE DES CANDIDATURES
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Candidatures reçues</h2>
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20"
              >
                {applications.length}
              </motion.span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950/80 text-slate-300 px-4 py-2.5 rounded-xl border border-slate-800 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 cursor-pointer hover:border-slate-700"
              >
                <option value="">📊 Tous les statuts</option>
                <option value="submitted">📩 En attente</option>
                <option value="under_review">🔍 En examen</option>
                <option value="shortlisted">⭐ Présélectionnée</option>
                <option value="interview">📞 Entretien</option>
                <option value="accepted">✅ Acceptée</option>
                <option value="rejected">❌ Refusée</option>
              </select>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative mt-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm placeholder:text-slate-600"
            />
          </div>

          <AnimatePresence mode="wait">
            {filteredApplications.length === 0 ? (
              <motion.div 
                key="empty"
                variants={fadeInScale}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center py-16 text-slate-400"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <Users className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-lg font-semibold text-white">
                  {searchTerm || selectedStatus ? 'Aucun candidat ne correspond à vos filtres' : 'Aucune candidature reçue'}
                </p>
                <p className="text-sm mt-1">
                  {searchTerm || selectedStatus 
                    ? 'Essayez de modifier vos filtres de recherche' 
                    : 'Partagez l\'offre pour attirer des candidats.'}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="mt-4 space-y-3"
              >
                {filteredApplications.map((app: any, index: number) => (
                  <motion.div
                    key={app.id}
                    variants={tableRowVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.03 }}
                    whileHover="hover"
                    className={`bg-slate-950/50 border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 ${
                      expandedApplication === app.id 
                        ? 'border-amber-500/40' 
                        : 'border-slate-800 hover:border-amber-500/20'
                    }`}
                  >
                    {/* En-tête cliquable */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-900/30 transition-colors duration-200"
                      onClick={() => handleToggleExpand(app.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0"
                          >
                            {app.candidate_details?.first_name?.[0] || 'C'}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                                {app.candidate_details?.first_name || 'Candidat'} {app.candidate_details?.last_name || ''}
                              </span>
                              <StatusBadge status={app.status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 shrink-0" />
                                {app.candidate_details?.email || 'Email non disponible'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(app.submitted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <motion.div
                            animate={{ rotate: expandedApplication === app.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Détails étendus */}
                    <AnimatePresence>
                      {expandedApplication === app.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-800 p-4 bg-slate-900/30 overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Colonne de gauche */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-3.5 h-3.5" />
                                Informations
                              </h4>
                              <div className="space-y-1.5 text-sm">
                                {app.candidate_details?.phone && (
                                  <p className="flex items-center gap-2 text-slate-300">
                                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                                    {app.candidate_details.phone}
                                  </p>
                                )}
                                {app.candidate_details?.city && (
                                  <p className="flex items-center gap-2 text-slate-300">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                    {app.candidate_details.city}
                                    {app.candidate_details.country && `, ${app.candidate_details.country}`}
                                  </p>
                                )}
                              </div>

                              {app.cover_note && (
                                <div>
                                  <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    Lettre de motivation
                                  </h5>
                                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 mt-1 leading-relaxed">
                                    {app.cover_note}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Colonne de droite */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" />
                                Compétences & CV
                              </h4>

                              {app.candidate_details?.skills && app.candidate_details.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {app.candidate_details.skills.slice(0, 6).map((skill: any) => (
                                    <span key={skill.id} className="text-[10px] bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                                      {skill.name}
                                    </span>
                                  ))}
                                  {app.candidate_details.skills.length > 6 && (
                                    <span className="text-[10px] text-slate-500">+{app.candidate_details.skills.length - 6}</span>
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
                                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-amber-500/30"
                                    >
                                      <FileText className="w-3 h-3" />
                                      {doc.document_name || 'CV'}
                                      <Download className="w-3 h-3" />
                                    </a>
                                  ))}
                                </div>
                              )}

                              <Link
                                to={`/profile/${app.candidate}`}
                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors group/link"
                              >
                                <ExternalLink className="w-3 h-3 group-hover/link:scale-110 transition-transform" />
                                Voir le profil complet
                                <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Statut :</span>
                              <select
                                value={app.status}
                                onChange={(e) => {
                                  updateStatusMutation.mutate({
                                    applicationId: app.id,
                                    status: e.target.value as ApplicationStatus,
                                  });
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="bg-slate-950/80 text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 disabled:opacity-50 cursor-pointer hover:border-slate-700"
                              >
                                <option value="submitted">📩 En attente</option>
                                <option value="under_review">🔍 En examen</option>
                                <option value="shortlisted">⭐ Présélectionner</option>
                                <option value="interview">📞 Entretien</option>
                                <option value="accepted">✅ Accepter</option>
                                <option value="rejected">❌ Refuser</option>
                              </select>
                            </div>
                            {updateStatusMutation.isPending && (
                              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
              <span className="text-amber-400 font-medium">{opportunity.title}</span> • Gestion des candidatures
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
              V1.0.0
            </span>
            <span className="w-px h-4 bg-slate-800" />
            <span>Gestion des candidatures</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default OpportunityApplicationsPage;