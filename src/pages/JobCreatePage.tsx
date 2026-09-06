// src/pages/JobCreatePage.tsx

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/jobs';
import { organizationApi } from '../api/organization';
import { 
  Briefcase, Save, X, Loader2, ArrowLeft, Home,
  Sparkles, Zap, Shield, Activity, Crown, ChevronRight,
  Building2, MapPin, Globe, Calendar, Users, Award,
  FileText, CheckCircle2, AlertCircle, Star, Eye,
  Mail, Phone, Link2, Plus, Minus, Info,
  TrendingUp, GraduationCap // <-- AJOUT DE TrendingUp ET GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Organization } from '../types';

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
  options,
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
      
      {type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full bg-slate-950/80 text-white px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
            error ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500/80'
          }`}
        >
          <option value="">{placeholder || 'Sélectionner'}</option>
          {options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          required={required}
          rows={4}
          placeholder={placeholder}
          className={`w-full bg-slate-950/80 text-white px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none ${
            error ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500/80'
          }`}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            checked={value}
            onChange={onChange}
            className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition-all duration-300"
          />
          <span className="text-sm text-slate-300">Oui, cette offre est en télétravail</span>
        </div>
      ) : (
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
      )}
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

export const JobCreatePage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization: '',
    opportunity_type: 'job' as 'job' | 'internship' | 'volunteer' | 'training',
    city: '',
    country: 'Niger',
    salary_min: '',
    salary_max: '',
    application_deadline: '',
    is_remote: false,
    requirements: '',
    contract_type: '',
    experience_level: '',
    education_level: '',
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

  const { data: organizations, isLoading: isLoadingOrgs } = useQuery<Organization[]>({
    queryKey: ['myOrganizations'],
    queryFn: () => organizationApi.getMyOrganizations().then((res) => res.data),
  });

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('📤 Envoi des données:', data);
      return jobsApi.create(data);
    },
    onSuccess: () => {
      toast.success('Offre créée en brouillon avec succès !');
      navigate('/organization/dashboard');
    },
    onError: (error: any) => {
      console.error('❌ Erreur création offre:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.message ||
                     'Erreur lors de la création de l\'offre';
      toast.error(message);
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.organization) {
      toast.error('Veuillez sélectionner une organisation');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Veuillez renseigner le titre');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Veuillez renseigner la description');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      organization: parseInt(formData.organization),
      opportunity_type: formData.opportunity_type,
      city: formData.city || undefined,
      country: formData.country || 'Niger',
      is_remote: formData.is_remote,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
      contract_type: formData.contract_type || undefined,
      experience_level: formData.experience_level || undefined,
      education_level: formData.education_level || undefined,
      requirements: formData.requirements.split('\n').filter((r: string) => r.trim()),
      application_deadline: formData.application_deadline || undefined,
      status: 'draft',
    };

    console.log('📤 Payload final:', payload);
    createMutation.mutate(payload);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoadingOrgs) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Chargement de vos organisations...</p>
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
  // NO ORGANIZATION
  // ==========================================================

  const orgsList: Organization[] = organizations || [];

  if (orgsList.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto px-4 py-8"
      >
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-6 backdrop-blur-xl">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20"
          >
            <Briefcase className="w-10 h-10 text-amber-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Aucune organisation</h2>
            <p className="text-slate-400 mt-2">
              Vous devez créer une organisation avant de publier une offre
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/organization/create')}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Créer une organisation
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

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

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
            <span className="text-xs text-slate-500 font-medium">Nouvelle offre</span>
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
              <Briefcase className="w-7 h-7 text-amber-400" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                Publier une offre
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
                Créez une nouvelle opportunité d'emploi pour votre organisation
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
          className="space-y-6"
        >

          {/* Section: Informations générales */}
          <FormSection title="Informations générales" icon={Info}>
            <div className="grid grid-cols-1 gap-5">
              <FormInput
                label="Titre de l'offre"
                value={formData.title}
                onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ex: Développeur Fullstack"
                required
                icon={FileText}
              />

              <FormInput
                type="select"
                label="Organisation"
                value={formData.organization}
                onChange={(e: any) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Sélectionner une organisation"
                required
                icon={Building2}
                options={orgsList.map((org: Organization) => ({
                  value: org.id,
                  label: org.name
                }))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  type="select"
                  label="Type d'opportunité"
                  value={formData.opportunity_type}
                  onChange={(e: any) => setFormData({ ...formData, opportunity_type: e.target.value })}
                  icon={Briefcase}
                  options={[
                    { value: 'job', label: '💼 Emploi' },
                    { value: 'internship', label: '🎓 Stage' },
                    { value: 'volunteer', label: '🤝 Volontariat' },
                    { value: 'training', label: '📚 Formation' },
                  ]}
                />

                <FormInput
                  type="select"
                  label="Type de contrat"
                  value={formData.contract_type}
                  onChange={(e: any) => setFormData({ ...formData, contract_type: e.target.value })}
                  icon={FileText}
                  options={[
                    { value: '', label: 'Sélectionner' },
                    { value: 'cdi', label: 'CDI' },
                    { value: 'cdd', label: 'CDD' },
                    { value: 'freelance', label: 'Freelance' },
                    { value: 'internship', label: 'Stage' },
                  ]}
                />
              </div>
            </div>
          </FormSection>

          {/* Section: Localisation */}
          <FormSection title="Localisation" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Ville"
                value={formData.city}
                onChange={(e: any) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Niamey"
                icon={MapPin}
              />

              <FormInput
                label="Pays"
                value={formData.country}
                onChange={(e: any) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Niger"
                icon={Globe}
              />
            </div>

            <FormInput
              type="checkbox"
              label="Télétravail"
              value={formData.is_remote}
              onChange={(e: any) => setFormData({ ...formData, is_remote: e.target.checked })}
            />
          </FormSection>

          {/* Section: Rémunération et prérequis */}
          <FormSection title="Rémunération & prérequis" icon={Award}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                type="number"
                label="Salaire minimum (FCFA)"
                value={formData.salary_min}
                onChange={(e: any) => setFormData({ ...formData, salary_min: e.target.value })}
                placeholder="500000"
                icon={TrendingUp}
              />

              <FormInput
                type="number"
                label="Salaire maximum (FCFA)"
                value={formData.salary_max}
                onChange={(e: any) => setFormData({ ...formData, salary_max: e.target.value })}
                placeholder="900000"
                icon={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                type="select"
                label="Niveau d'expérience"
                value={formData.experience_level}
                onChange={(e: any) => setFormData({ ...formData, experience_level: e.target.value })}
                icon={Users}
                options={[
                  { value: '', label: 'Sélectionner' },
                  { value: 'entry', label: '🟢 Débutant' },
                  { value: 'junior', label: '🟡 Junior' },
                  { value: 'senior', label: '🟠 Senior' },
                  { value: 'expert', label: '🔴 Expert' },
                ]}
              />

              <FormInput
                type="select"
                label="Niveau d'étude"
                value={formData.education_level}
                onChange={(e: any) => setFormData({ ...formData, education_level: e.target.value })}
                icon={GraduationCap}
                options={[
                  { value: '', label: 'Sélectionner' },
                  { value: 'bachelor', label: '🎓 Licence' },
                  { value: 'master', label: '🎓 Master' },
                  { value: 'phd', label: '🎓 Doctorat' },
                  { value: 'other', label: '📖 Autre' },
                ]}
              />
            </div>
          </FormSection>

          {/* Section: Description */}
          <FormSection title="Description du poste" icon={FileText}>
            <FormInput
              type="textarea"
              label="Description"
              value={formData.description}
              onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée du poste, missions, profil recherché..."
              required
              icon={FileText}
            />

            <FormInput
              type="textarea"
              label="Prérequis (un par ligne)"
              value={formData.requirements}
              onChange={(e: any) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Diplôme en informatique&#10;5 ans d'expérience&#10;Maîtrise de React"
              icon={CheckCircle2}
            />

            <FormInput
              type="date"
              label="Date limite de candidature"
              value={formData.application_deadline}
              onChange={(e: any) => setFormData({ ...formData, application_deadline: e.target.value })}
              icon={Calendar}
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
              onClick={() => navigate('/organization/dashboard')}
              className="px-6 py-3.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2"
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
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Créer en brouillon
            </motion.button>
          </motion.div>

          {/* Indicateur de brouillon */}
          <motion.div 
            variants={fadeInUp}
            className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl"
          >
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Info className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-amber-400">Brouillon</span> — 
                Votre offre sera enregistrée en brouillon. Vous pourrez la modifier et la soumettre à modération ultérieurement.
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
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/50 text-xs text-slate-600"
        >
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              <span className="text-amber-400 font-medium">Nouvelle offre</span> • Création
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
            <span>Création d'offre</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default JobCreatePage;