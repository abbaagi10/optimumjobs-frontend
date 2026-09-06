// src/pages/OrganizationCreatePage.tsx

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { organizationApi } from '../api/organization';
import { 
  Building2, Save, X, Loader2, ArrowLeft, Home,
  Sparkles, Zap, Shield, Activity, Crown, ChevronRight,
  Globe, MapPin, Phone, Mail, Link2, Info,
  CheckCircle2, AlertCircle, Award, Users, Briefcase,
  TrendingUp, Calendar, Star, Plus, Minus
} from 'lucide-react';
import toast from 'react-hot-toast';
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

// ==========================================================
// COMPOSANTS
// ==========================================================

const FormInput = ({ 
  icon: Icon, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required, 
  error,
  className = ''
}: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      variants={fadeInUp}
      className={`space-y-2 ${className}`}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-amber-400" />}
          {label}
          {required && <span className="text-rose-400">*</span>}
        </label>
        {error && (
          <span className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </span>
        )}
      </div>
      
      <div className="relative group">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          placeholder={placeholder}
          className={`w-full bg-slate-950/80 text-white px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
            error ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500/80'
          }`}
        />
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 transition-all duration-300 pointer-events-none"
          animate={{
            opacity: isFocused ? 0.05 : 0,
          }}
        />
      </div>
    </motion.div>
  );
};

const FormSection = ({ title, icon: Icon, children }: any) => (
  <motion.div
    variants={fadeInUp}
    className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 hover:border-slate-700 transition-all duration-300"
  >
    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
      <div className="p-2 rounded-xl bg-amber-500/10">
        <Icon className="w-5 h-5 text-amber-400" />
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
    </div>
    {children}
  </motion.div>
);

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export const OrganizationCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    city: '',
    country: 'Niger',
    address: '',
    phone: '',
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

  const { data: orgs, isLoading: isCheckingOrg } = useQuery({
    queryKey: ['myOrganizations'],
    queryFn: () => organizationApi.getMyOrganizations().then((res) => res.data),
    retry: 1,
    staleTime: 0,
  });

  // ==========================================================
  // EFFECTS
  // ==========================================================

  useEffect(() => {
    if (!isCheckingOrg && orgs && orgs.length > 0) {
      toast.success('Vous avez déjà une organisation');
      navigate('/organization/dashboard', { replace: true });
    }
  }, [orgs, isCheckingOrg, navigate]);

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => organizationApi.create(data),
    onSuccess: (response) => {
      toast.success('✅ Organisation créée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['myOrganizations'] });
      queryClient.invalidateQueries({ queryKey: ['orgJobs'] });
      setTimeout(() => {
        navigate('/organization/dashboard', { replace: true });
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message ||
                           'Erreur lors de la création';
      toast.error(errorMessage);
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Veuillez renseigner le nom de l\'organisation');
      return;
    }
    createMutation.mutate(formData);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isCheckingOrg) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Vérification de votre organisation...</p>
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
  // REDIRECTION
  // ==========================================================

  if (orgs && orgs.length > 0) {
    return null;
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

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
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
            <span className="text-xs text-slate-500 font-medium">Créer une organisation</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
        </motion.div>

        {/* ======================================================
            EN-TÊTE
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl hover:border-slate-700 transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center shrink-0"
            >
              <Building2 className="w-7 h-7 text-amber-400" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                Créer une Organisation
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 rounded-full"
                >
                  NOUVEAU
                </motion.span>
              </h1>
              <p className="text-sm text-slate-400">
                Remplissez les informations de votre entreprise au Niger
              </p>
            </div>
          </div>
        </motion.div>

        {/* ======================================================
            FORMULAIRE
        ====================================================== */}

        <motion.form
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          onSubmit={handleSubmit}
          className="space-y-6 mt-6"
        >

          {/* Section: Informations générales */}
          <FormSection title="Informations générales" icon={Info}>
            <FormInput
              label="Nom de l'organisation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ex: TechCorp Niger"
              required
              icon={Building2}
            />

            <FormInput
              label="Secteur d'activité"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="ex: Tech, Finance, Santé, Éducation"
              icon={Briefcase}
            />

            <FormInput
              type="textarea"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Présentation de votre organisation..."
              icon={FileText}
            />
          </FormSection>

          {/* Section: Contact et Localisation */}
          <FormSection title="Contact & Localisation" icon={Globe}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Site web"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://monentreprise.ne"
                icon={Link2}
              />

              <FormInput
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+227 XX XX XX XX"
                icon={Phone}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="ex: Niamey, Zinder, Maradi"
                icon={MapPin}
              />

              <FormInput
                label="Pays"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Niger"
                icon={Globe}
              />
            </div>

            <FormInput
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="ex: Rue de l'Uranium, Quartier Plateau"
              icon={MapPin}
            />
          </FormSection>

          {/* ======================================================
              BOUTONS D'ACTION
          ====================================================== */}

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoBack}
              disabled={createMutation.isPending}
              className="px-6 py-3.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Annuler
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Créer l'organisation
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Indicateur d'information */}
          <motion.div 
            variants={fadeInUp}
            className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl"
          >
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Info className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-amber-400">Important</span> — 
                Après la création, vous pourrez publier des offres d'emploi et gérer vos candidatures.
              </p>
            </div>
          </motion.div>

        </motion.form>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-800/50 text-xs text-slate-600"
        >
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              <span className="text-amber-400 font-medium">Création</span> • Organisation
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
              Version 3.0.0
            </span>
            <span className="w-px h-4 bg-slate-800" />
            <span>Création d'organisation</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default OrganizationCreatePage;