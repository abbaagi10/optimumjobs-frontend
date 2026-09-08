// src/pages/OrganizationDashboardPage.tsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { organizationApi } from '../api/organization';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Briefcase, Users, MapPin,
  X, CheckCircle, Clock, Trash2, Loader2, Eye,
  Edit2, Save, ArrowLeft, Home, Send, AlertCircle,
  RefreshCw, Sparkles, Crown, Zap, Shield, Activity,
  Award, Star, TrendingUp, Calendar, Globe, Link2,
  Mail, Phone, ChevronRight, LayoutGrid, List,
  Filter, Search, Bell, Settings, HelpCircle
} from 'lucide-react';

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
// COMPOSANTS
// ==========================================================

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
  <motion.div
    variants={statCardVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
    className="relative group bg-slate-900/80 border border-slate-800 p-4 rounded-2xl transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50 cursor-pointer overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${color}-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black text-white tracking-tight">
          {value}
        </span>
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && (
        <div className="mt-0.5 text-[10px] text-slate-500">{subtitle}</div>
      )}
      <div className="mt-2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-${color}-500 to-transparent transition-all duration-700" />
    </div>
  </motion.div>
);

// ==========================================================
// FONCTION getStatusBadge DÉPLACÉE HORS DU COMPOSANT
// ==========================================================

const getStatusBadge = (status: string) => {
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
      icon: <CheckCircle className="w-3 h-3" />,
      label: 'Approuvée',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      dotColor: 'bg-blue-400'
    },
    'published': {
      icon: <Sparkles className="w-3 h-3" />,
      label: 'Publiée',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotColor: 'bg-emerald-400'
    },
    'rejected': {
      icon: <AlertCircle className="w-3 h-3" />,
      label: 'Rejetée',
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotColor: 'bg-rose-400'
    },
    'closed': {
      icon: <X className="w-3 h-3" />,
      label: 'Fermée',
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

  return {
    icon: config.icon,
    label: config.label,
    className: config.className,
    dotColor: config.dotColor
  };
};

const StatusBadgeComponent = ({ status }: { status: string }) => {
  const config = getStatusBadge(status);
  
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

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export const OrganizationDashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orgForm, setOrgForm] = useState({
    name: '',
    description: '',
    website: '',
    city: '',
    country: '',
  });
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    employment_type: 'full_time' as 'full_time' | 'part_time' | 'contract' | 'internship',
    salary_range: '',
    is_remote: false,
  });

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

  const { data: orgsData, isLoading: isOrgLoading, refetch: refetchOrgs } = useQuery({
    queryKey: ['myOrganizations'],
    queryFn: async () => {
      try {
        const response = await organizationApi.getMyOrganizations();
        const data = response.data;
        if (data && typeof data === 'object' && 'results' in data) {
          return data.results || [];
        }
        if (Array.isArray(data)) {
          return data;
        }
        return [];
      } catch (error) {
        console.error('Erreur chargement organisations:', error);
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const orgs = orgsData || [];
  const org = orgs.length > 0 ? orgs[0] : null;
  const orgId = org?.id;

  const { data: jobsData, isLoading: isJobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['orgJobs', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      try {
        const response = await organizationApi.getOpportunities(orgId);
        const data = response.data;
        if (data && typeof data === 'object' && 'results' in data) {
          return data.results || [];
        }
        if (Array.isArray(data)) {
          return data;
        }
        return [];
      } catch (error) {
        console.error('Erreur chargement offres:', error);
        return [];
      }
    },
    enabled: !!orgId,
    retry: 1,
  });

  const jobs = jobsData || [];

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const updateOrgMutation = useMutation({
    mutationFn: async (data: typeof orgForm) => {
      if (!orgId) throw new Error('Aucune organisation');
      const cleanData = {
        name: data.name,
        description: data.description,
        website: data.website,
        city: data.city,
        country: data.country,
      };
      const response = await organizationApi.update(orgId, cleanData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Organisation mise à jour avec succès !');
      setIsEditingOrg(false);
      if (org) Object.assign(org, data);
      queryClient.invalidateQueries({ queryKey: ['myOrganizations'] });
      queryClient.invalidateQueries({ queryKey: ['orgJobs', orgId] });
      setTimeout(() => { refetchOrgs(); refetchJobs(); }, 100);
      if (data) {
        setOrgForm({
          name: data.name || '',
          description: data.description || '',
          website: data.website || '',
          city: data.city || '',
          country: data.country || '',
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Erreur:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: typeof jobForm) => {
      if (!orgId) throw new Error('Aucune organisation');
      const response = await apiClient.post(`/organizations/${orgId}/opportunities/`, {
        ...data,
        opportunity_type: 'job',
        status: 'draft',
        requirements: [],
        is_remote: data.is_remote || false,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Offre créée en brouillon avec succès !');
      setIsModalOpen(false);
      setJobForm({
        title: '',
        description: '',
        location: '',
        employment_type: 'full_time',
        salary_range: '',
        is_remote: false,
      });
      refetchJobs();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: (id: number) => organizationApi.submitForReview(id),
    onSuccess: () => {
      toast.success('Offre soumise pour révision avec succès !');
      refetchJobs();
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message ||
                     'Erreur lors de la soumission';
      toast.error(message);
    },
  });

  const publishJobMutation = useMutation({
    mutationFn: (id: number) => organizationApi.publishOpportunity(id),
    onSuccess: () => {
      toast.success('Offre publiée avec succès !');
      refetchJobs();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la publication');
    },
  });

  const closeJobMutation = useMutation({
    mutationFn: (id: number) => organizationApi.closeOpportunity(id),
    onSuccess: () => {
      toast.success('Offre clôturée avec succès');
      refetchJobs();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la clôture');
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/opportunities/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Offre supprimée avec succès');
      refetchJobs();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim()) {
      toast.error('Veuillez renseigner le titre du poste');
      return;
    }
    if (!jobForm.description.trim()) {
      toast.error('Veuillez renseigner la description');
      return;
    }
    if (!jobForm.location.trim()) {
      toast.error('Veuillez renseigner le lieu');
      return;
    }
    createJobMutation.mutate(jobForm);
  };

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const jobList = jobs || [];
  
  const filteredJobs = jobList.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalJobs: jobList.length,
    draftJobs: jobList.filter((j: any) => j.status === 'draft').length,
    pendingJobs: jobList.filter((j: any) => j.status === 'pending_review').length,
    approvedJobs: jobList.filter((j: any) => j.status === 'approved').length,
    publishedJobs: jobList.filter((j: any) => j.status === 'published' || j.status === 'active').length,
    rejectedJobs: jobList.filter((j: any) => j.status === 'rejected').length,
    closedJobs: jobList.filter((j: any) => j.status === 'closed').length,
  };

  // ==========================================================
  // REDIRECTION
  // ==========================================================

  useEffect(() => {
    if (!isOrgLoading && (!orgs || orgs.length === 0)) {
      navigate('/organization/create', { replace: true });
    }
  }, [isOrgLoading, orgs, navigate]);

  if (!isOrgLoading && (!orgs || orgs.length === 0)) {
    return null;
  }

  if (isOrgLoading || !org) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Chargement de votre organisation...</p>
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

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

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
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-4 py-1.5 border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Dashboard</span>
            <Crown className="w-3 h-3 text-amber-400" />
          </div>
        </motion.div>

        {/* ======================================================
            EN-TÊTE ORGANISATION
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-800 p-6 md:p-8 rounded-3xl backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-center text-2xl font-bold text-amber-400 shadow-lg shadow-amber-500/10"
              >
                {org.name?.[0] || 'O'}
              </motion.div>
              <div className="flex-1 min-w-0">
                {isEditingOrg ? (
                  <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-3"
                  >
                    <motion.input
                      variants={fadeInUp}
                      type="text"
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm"
                      placeholder="Nom de l'organisation"
                    />
                    <motion.input
                      variants={fadeInUp}
                      type="text"
                      value={orgForm.description}
                      onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                      className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm"
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <motion.input
                        variants={fadeInUp}
                        type="text"
                        value={orgForm.website}
                        onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                        className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm"
                        placeholder="Site web"
                      />
                      <motion.input
                        variants={fadeInUp}
                        type="text"
                        value={orgForm.city}
                        onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                        className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm"
                        placeholder="Ville"
                      />
                      <motion.input
                        variants={fadeInUp}
                        type="text"
                        value={orgForm.country}
                        onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })}
                        className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm"
                        placeholder="Pays"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
                      {org.name}
                      {org.is_verified && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Vérifiée
                        </span>
                      )}
                    </h1>
                    {org.description && (
                      <p className="text-sm text-slate-400 mt-1">{org.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                      {org.city && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-400" />
                          {org.city}{org.country ? `, ${org.country}` : ', Niger'}
                        </span>
                      )}
                      {org.website && (
                        <a 
                          href={org.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <Link2 className="w-4 h-4" />
                          {org.website}
                        </a>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <Activity className="w-3.5 h-3.5" />
                        En ligne
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {isEditingOrg ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditingOrg(false);
                      if (org) {
                        setOrgForm({
                          name: org.name || '',
                          description: org.description || '',
                          website: org.website || '',
                          city: org.city || '',
                          country: org.country || '',
                        });
                      }
                    }}
                    className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all duration-300"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateOrgMutation.mutate(orgForm)}
                    disabled={updateOrgMutation.isPending}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    {updateOrgMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Enregistrer
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingOrg(true)}
                  className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ======================================================
            STATISTIQUES
        ====================================================== */}

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3"
        >
          <StatCard title="Total" value={stats.totalJobs} icon={Briefcase} color="amber" />
          <StatCard title="Brouillons" value={stats.draftJobs} icon={Clock} color="slate" />
          <StatCard title="En attente" value={stats.pendingJobs} icon={Clock} color="amber" subtitle={stats.pendingJobs > 0 ? '⏳ En validation' : ''} />
          <StatCard title="Approuvées" value={stats.approvedJobs} icon={CheckCircle} color="blue" />
          <StatCard title="Publiées" value={stats.publishedJobs} icon={Sparkles} color="emerald" />
          <StatCard title="Rejetées" value={stats.rejectedJobs} icon={AlertCircle} color="rose" />
          <StatCard title="Clôturées" value={stats.closedJobs} icon={X} color="slate" />
        </motion.div>

        {/* ======================================================
            LISTE DES OFFRES
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              Vos offres d'emploi
              <span className="text-xs text-slate-500 font-normal">({jobList.length})</span>
            </h2>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refetchJobs()}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300"
                title="Rafraîchir"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle offre
              </motion.button>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher une offre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/80 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm placeholder:text-slate-600"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/80 text-slate-300 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm cursor-pointer hover:border-slate-700"
            >
              <option value="all">📊 Tous les statuts</option>
              <option value="draft">📝 Brouillons</option>
              <option value="pending_review">⏳ En attente</option>
              <option value="approved">✅ Approuvées</option>
              <option value="published">🚀 Publiées</option>
              <option value="rejected">❌ Rejetées</option>
              <option value="closed">🔒 Clôturées</option>
            </select>
            <div className="flex gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-1">
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
                <LayoutGrid className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Contenu */}
          <AnimatePresence mode="wait">
            {isJobsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <motion.div 
                variants={fadeInScale}
                className="text-center py-12 space-y-3"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucune offre ne correspond à vos filtres' 
                    : 'Vous n\'avez publié aucune offre pour le moment.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Créer votre première annonce
                  </motion.button>
                )}
              </motion.div>
            ) : viewMode === 'list' ? (
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-3 mt-4"
              >
                {filteredJobs.map((job: any, index: number) => {
                  const statusBadge = getStatusBadge(job.status);
                  return (
                    <motion.div
                      key={job.id}
                      variants={tableRowVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.03 }}
                      whileHover="hover"
                      className="group p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                              {job.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge.className}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                              {statusBadge.icon}
                              {statusBadge.label}
                            </span>
                            {job.is_remote && (
                              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                Télétravail
                              </span>
                            )}
                            {job.is_urgent && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location || job.city || 'Non spécifié'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {job.status === 'pending_review' && (
                              <span className="text-amber-400/70 text-[10px] flex items-center gap-1 animate-pulse">
                                <Clock className="w-3 h-3" />
                                En attente de validation
                              </span>
                            )}
                            {job.status === 'rejected' && job.rejection_reason && (
                              <span className="text-rose-400/70 text-[10px] flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Motif: {job.rejection_reason}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {job.status === 'draft' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (window.confirm('Soumettre cette offre pour révision par l\'administrateur ?')) {
                                    submitForReviewMutation.mutate(job.id);
                                  }
                                }}
                                disabled={submitForReviewMutation.isPending}
                                className="px-3 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {submitForReviewMutation.isPending ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                Soumettre
                              </motion.button>
                              <Link
                                to={`/organization/opportunities/${job.id}/edit`}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  if (confirm('Supprimer cette offre ?')) {
                                    deleteJobMutation.mutate(job.id);
                                  }
                                }}
                                disabled={deleteJobMutation.isPending}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all duration-300 disabled:opacity-50"
                                title="Supprimer"
                              >
                                {deleteJobMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </motion.button>
                            </>
                          )}

                          {job.status === 'pending_review' && (
                            <>
                              <span className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-medium flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                                En validation...
                              </span>
                              <Link
                                to={`/organization/opportunities/${job.id}`}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </>
                          )}

                          {job.status === 'approved' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (window.confirm('Publier cette offre ?')) {
                                    publishJobMutation.mutate(job.id);
                                  }
                                }}
                                disabled={publishJobMutation.isPending}
                                className="px-3 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {publishJobMutation.isPending ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                                Publier
                              </motion.button>
                              <Link
                                to={`/organization/opportunities/${job.id}`}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </>
                          )}

                          {job.status === 'published' && (
                            <>
                              <Link
                                to={`/organization/opportunities/${job.id}`}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300"
                                title="Voir les détails"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  if (window.confirm('Clôturer cette offre ?')) {
                                    closeJobMutation.mutate(job.id);
                                  }
                                }}
                                disabled={closeJobMutation.isPending}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all duration-300"
                                title="Clôturer"
                              >
                                {closeJobMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </motion.button>
                            </>
                          )}

                          {(job.status === 'rejected' || job.status === 'closed') && (
                            <Link
                              to={`/organization/opportunities/${job.id}`}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
              >
                {filteredJobs.map((job: any, index: number) => {
                  const statusBadge = getStatusBadge(job.status);
                  return (
                    <motion.div
                      key={job.id}
                      variants={tableRowVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, borderColor: 'rgba(251, 191, 36, 0.3)' }}
                      className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white text-sm">{job.title}</h4>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                          {statusBadge.icon}
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        {job.location || job.city || 'Non spécifié'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                        <Link
                          to={`/organization/opportunities/${job.id}`}
                          className="flex-1 text-center px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                        >
                          Voir
                        </Link>
                        {job.status === 'draft' && (
                          <Link
                            to={`/organization/opportunities/${job.id}/edit`}
                            className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ======================================================
            MODAL DE CRÉATION
        ====================================================== */}

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900/95 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                      <Plus className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Nouvelle offre d'emploi</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmitJob} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      Titre du poste <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      placeholder="ex: Développeur Fullstack"
                      className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      Lieu <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      placeholder="ex: Niamey / Télétravail"
                      className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      Description <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      placeholder="Détaillez les missions, compétences recherchées..."
                      className="w-full bg-slate-950/80 text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm mt-1 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_remote"
                      checked={jobForm.is_remote}
                      onChange={(e) => setJobForm({ ...jobForm, is_remote: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition-all duration-300"
                    />
                    <label htmlFor="is_remote" className="text-sm text-slate-300 cursor-pointer flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-amber-400" />
                      Télétravail
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={createJobMutation.isPending}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 flex items-center gap-2"
                    >
                      {createJobMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Créer en brouillon
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
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
              <span className="text-amber-400 font-medium">{org.name}</span> • Dashboard
            </span>
            <span className="w-px h-4 bg-slate-800" />
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400/70">Sécurisé - Niger</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              v1.0.0
            </span>
            <span className="w-px h-4 bg-slate-800" />
            <span>Dashboard Organisation</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default OrganizationDashboardPage;