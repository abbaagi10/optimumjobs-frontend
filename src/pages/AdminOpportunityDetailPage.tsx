// src/pages/AdminOpportunityDetailPage.tsx
// Page de détails d'offre pour l'administrateur - Version Niger

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { 
  ArrowLeft, Home, Loader2, Building2, MapPin, Calendar, 
  Briefcase, Check, X, Clock, AlertCircle, Users,
  FileText, Mail, Phone, Globe, RefreshCw,
  Shield, Award, Sparkles, Zap, TrendingUp, 
  Eye, Heart, Share2, Bookmark, ChevronRight,
  Crown, Star, UserCheck, UserX, Activity,
  Link2, ExternalLink, Send, Copy, CheckCircle2,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
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

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 }
};

// ==========================================================
// COMPONENTS
// ==========================================================

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
      icon: <Sparkles className="w-3 h-3" />,
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

const InfoItem = ({ label, value, icon: Icon, color = 'text-slate-400' }: any) => (
  <motion.div 
    variants={fadeInUp}
    className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0 group hover:bg-slate-800/20 px-3 -mx-3 rounded-lg transition-colors duration-200"
  >
    <span className="text-sm text-slate-400 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      {label}
    </span>
    <span className="text-sm text-white font-medium text-right group-hover:text-amber-400 transition-colors">
      {value}
    </span>
  </motion.div>
);

const ActionButton = ({ 
  onClick, 
  disabled, 
  isLoading, 
  icon: Icon, 
  label, 
  variant = 'primary' 
}: any) => {
  const variants = {
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40',
    danger: 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </motion.button>
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
  // RÉCUPÉRATION DES DONNÉES
  // ==========================================================

  const { data: job, isLoading, refetch } = useQuery({
    queryKey: ['admin-opportunity', id],
    queryFn: () => adminApi.getAdminOpportunityDetail(Number(id)).then(res => res.data),
    enabled: !!id,
  });

  // ==========================================================
  // MUTATIONS - ACTIONS ADMIN
  // ==========================================================

  const approveMutation = useMutation({
    mutationFn: () => adminApi.reviewOpportunity(Number(id), 'approve'),
    onSuccess: () => {
      toast.success('✅ Offre approuvée avec succès');
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
      toast.success('✅ Offre publiée avec succès');
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
    toast.success('Lien copié !');
    setTimeout(() => setIsCopied(false), 3000);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Chargement des détails...</p>
        <div className="flex gap-1 mt-2">
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
  // ERREUR
  // ==========================================================

  if (!job) {
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
            <AlertCircle className="w-10 h-10 text-rose-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Offre non trouvée</h2>
          <p className="text-sm text-slate-400 mt-2">L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/dashboard')}
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
      className="space-y-6 relative"
    >
      {/* Background decoration with parallax */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0f] overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 15,
            y: -mousePosition.y * 15,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
      </div>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/dashboard')}
            className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Retour</span>
          </motion.button>

          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => refetch()}
            className="group flex items-center gap-2 rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:border-slate-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            <span className="hidden sm:inline">Rafraîchir</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:border-amber-500/30 hover:text-amber-400"
          >
            {isCopied ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isCopied ? 'Copié !' : 'Copier le lien'}</span>
          </motion.button>

          <div className="flex items-center gap-2 rounded-full bg-slate-900/50 px-4 py-1.5 border border-slate-800">
            <Crown className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-slate-500 font-medium">Admin Niger</span>
          </div>
        </div>
      </motion.div>

      {/* ======================================================
          EN-TÊTE DE L'OFFRE
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 hover:border-slate-700"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs text-amber-400 uppercase font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20"
              >
                {job.opportunity_type || 'Offre'}
              </motion.span>
              <StatusBadge status={job.status} />
              {job.is_urgent && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Urgent
                </motion.span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-sm text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                {job.organization_name || 'Entreprise'}
              </span>
              {job.city && (
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.city}{job.country ? `, ${job.country}` : ', Niger'}
                </span>
              )}
              {job.is_remote && (
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Télétravail
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              {job.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Créée le {new Date(job.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
              {job.published_at && (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  Publiée le {new Date(job.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-slate-600">
                <Activity className="w-3.5 h-3.5" />
                ID: #{job.id}
              </span>
            </div>
            {job.rejection_reason && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                <p className="text-xs text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Motif du rejet: {job.rejection_reason}</span>
                </p>
              </motion.div>
            )}
          </div>

          {/* Actions Admin */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {job.status === 'pending_review' && (
              <>
                <ActionButton
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  isLoading={approveMutation.isPending}
                  icon={Check}
                  label="Approuver"
                  variant="success"
                />
                <ActionButton
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  disabled={false}
                  isLoading={false}
                  icon={X}
                  label="Refuser"
                  variant="danger"
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
                variant="primary"
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
              />
            )}

            {job.status === 'rejected' && (
              <ActionButton
                onClick={() => navigate('/admin/dashboard')}
                disabled={false}
                isLoading={false}
                icon={ArrowLeft}
                label="Retour"
                variant="secondary"
              />
            )}
          </div>
        </div>

        {/* Formulaire de rejet */}
        <AnimatePresence>
          {showRejectForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-slate-950/60 border border-rose-500/20 rounded-xl overflow-hidden"
            >
              <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Motif du rejet :
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi cette offre est rejetée..."
                className="w-full bg-slate-950 border border-slate-800 text-white p-3.5 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-300 placeholder:text-slate-600"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  className="px-6 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-500 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 hover:shadow-lg hover:shadow-rose-500/25"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Confirmer le rejet
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-amber-400" />
              Description du poste
            </h2>
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
              {job.description || 'Aucune description disponible.'}
            </div>
          </motion.div>

          {/* Compétences requises */}
          {job.requirements && job.requirements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
            >
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-amber-400" />
                Compétences requises
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req, index) => (
                  <motion.span 
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-300 hover:border-amber-500/30 hover:text-amber-400 transition-all duration-300"
                  >
                    {req}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Colonne de droite - Informations */}
        <div className="space-y-6">
          {/* Informations générales */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-amber-400" />
              Informations
            </h2>
            <div className="space-y-1">
              <InfoItem 
                label="Type" 
                value={job.opportunity_type || 'Non spécifié'} 
                icon={Briefcase}
                color="text-amber-400"
              />
              {job.contract_type && (
                <InfoItem 
                  label="Contrat" 
                  value={job.contract_type} 
                  icon={FileText}
                  color="text-blue-400"
                />
              )}
              {job.experience_level && (
                <InfoItem 
                  label="Expérience" 
                  value={job.experience_level} 
                  icon={Award}
                  color="text-emerald-400"
                />
              )}
              {job.education_level && (
                <InfoItem 
                  label="Niveau d'étude" 
                  value={job.education_level} 
                  icon={GraduationCap}
                  color="text-purple-400"
                />
              )}
              {job.salary_min && job.salary_max && (
                <InfoItem 
                  label="Salaire" 
                  value={`${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} FCFA`} 
                  icon={TrendingUp}
                  color="text-amber-400"
                />
              )}
              {job.is_remote && (
                <InfoItem 
                  label="Télétravail" 
                  value="✅ Oui" 
                  icon={Globe}
                  color="text-emerald-400"
                />
              )}
              {job.application_deadline && (
                <InfoItem 
                  label="Date limite" 
                  value={new Date(job.application_deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })} 
                  icon={Calendar}
                  color="text-amber-400"
                />
              )}
            </div>
          </motion.div>

          {/* Statistiques de l'offre */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-amber-400" />
              Statistiques
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-slate-950/60 p-4 rounded-xl text-center border border-slate-800 hover:border-amber-500/30 transition-all duration-300"
              >
                <p className="text-xs text-slate-500">Candidatures</p>
                <p className="text-2xl font-bold text-white">0</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-slate-950/60 p-4 rounded-xl text-center border border-slate-800 hover:border-amber-500/30 transition-all duration-300"
              >
                <p className="text-xs text-slate-500">Vues</p>
                <p className="text-2xl font-bold text-white">0</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              Actions rapides
            </h2>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 text-sm text-slate-300 hover:text-white group"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  Voir l'offre en ligne
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 text-sm text-slate-300 hover:text-white group"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  Partager l'offre
                </span>
                <Share2 className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================
          FOOTER DE PAGE
      ====================================================== */}

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/50 text-xs text-slate-600"
      >
        <div className="flex items-center gap-4">
          <span className="text-slate-500">
            <span className="text-amber-400 font-medium">{job.id}</span> • Offre #{job.id}
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
            Statut: {job.status}
          </span>
          <span className="w-px h-4 bg-slate-800" />
          <span>v1.0.0</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminOpportunityDetailPage;