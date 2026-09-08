// src/pages/OpportunityEditPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../api/organization';
import { 
  ArrowLeft, Home, Loader2, Save, X, MapPin, Briefcase,
  Sparkles, Zap, Shield, Activity, Crown, ChevronRight,
  Building2, Globe, Calendar, Users, Award, FileText,
  CheckCircle2, AlertCircle, Edit2, Trash2, Plus,
  Minus, Info, TrendingUp, GraduationCap, DollarSign,
  Eye, Send, Clock, Star
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
          rows={5}
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

const RequirementTag = ({ text, onRemove }: { text: string; onRemove: () => void }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    exit={{ scale: 0 }}
    whileHover={{ scale: 1.05 }}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400 group hover:bg-amber-500/20 transition-all duration-300"
  >
    {text}
    <button
      type="button"
      onClick={onRemove}
      className="text-amber-400 hover:text-amber-300 transition-colors ml-0.5"
    >
      <X className="w-3 h-3" />
    </button>
  </motion.span>
);

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export const OpportunityEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    country: '',
    is_remote: false,
    salary_min: '',
    salary_max: '',
    contract_type: '',
    experience_level: '',
    education_level: '',
    requirements: [] as string[],
    application_deadline: '',
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

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => organizationApi.getOpportunityDetail(Number(id)).then(res => res.data),
    enabled: !!id,
  });

  // ==========================================================
  // EFFECTS
  // ==========================================================

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || job.city || '',
        city: job.city || '',
        country: job.country || '',
        is_remote: job.is_remote || false,
        salary_min: job.salary_min?.toString() || '',
        salary_max: job.salary_max?.toString() || '',
        contract_type: job.contract_type || '',
        experience_level: job.experience_level || '',
        education_level: job.education_level || '',
        requirements: job.requirements || [],
        application_deadline: job.application_deadline || '',
      });
    }
  }, [job]);

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const updateData = {
        title: data.title,
        description: data.description,
        location: data.location,
        city: data.city,
        country: data.country,
        is_remote: data.is_remote,
        salary_min: data.salary_min ? Number(data.salary_min) : null,
        salary_max: data.salary_max ? Number(data.salary_max) : null,
        contract_type: data.contract_type,
        experience_level: data.experience_level,
        education_level: data.education_level,
        requirements: data.requirements,
        application_deadline: data.application_deadline || null,
      };
      return organizationApi.updateOpportunity(Number(id), updateData);
    },
    onSuccess: () => {
      toast.success('✅ Offre mise à jour avec succès !');
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['orgJobs'] });
      navigate(`/organization/dashboard`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message ||
                     'Erreur lors de la mise à jour';
      toast.error(message);
      setIsSubmitting(false);
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.title.trim()) {
      toast.error('Veuillez renseigner le titre');
      setIsSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Veuillez renseigner la description');
      setIsSubmitting(false);
      return;
    }
    
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddRequirement = () => {
    const req = prompt('Ajouter une compétence requise:');
    if (req && req.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, req.trim()]
      }));
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  // ==========================================================
  // LOADING & ERROR
  // ==========================================================

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center min-h-[60vh] space-y-4"
      >
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="text-sm text-slate-400">Chargement de l'offre...</p>
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

  if (error || !job) {
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
            <Briefcase className="w-10 h-10 text-rose-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Offre non trouvée</h2>
          <p className="text-sm text-slate-400 mt-2">L'offre que vous cherchez n'existe pas.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            Retour
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Vérifier si l'offre peut être modifiée (DRAFT ou REJECTED)
  const canEdit = job.status === 'draft' || job.status === 'rejected';

  if (!canEdit) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-3xl p-12 text-center backdrop-blur-xl">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20"
          >
            <AlertCircle className="w-10 h-10 text-amber-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Modification non autorisée</h2>
          <p className="text-sm text-slate-400 mt-2">
            Cette offre est en statut <strong className="text-amber-400">{job.status}</strong> et ne peut pas être modifiée.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
          >
            Retour
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
            <span className="text-xs text-slate-500 font-medium">Modifier l'offre</span>
            <Edit2 className="w-3 h-3 text-amber-400" />
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
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white">Modifier l'offre</h1>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20"
                >
                  {job.status === 'draft' ? '📝 Brouillon' : '🔄 Révision'}
                </motion.span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Modifiez les informations de votre offre d'emploi au Niger
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
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="ex: Développeur Fullstack"
                required
                icon={FileText}
              />

              <FormInput
                type="textarea"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description détaillée du poste, missions, profil recherché..."
                required
                icon={FileText}
              />
            </div>
          </FormSection>

          {/* Section: Localisation */}
          <FormSection title="Localisation" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Ville"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Niamey"
                icon={MapPin}
              />

              <FormInput
                label="Pays"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Niger"
                icon={Globe}
              />
            </div>

            <FormInput
              type="checkbox"
              label="Télétravail"
              name="is_remote"
              value={formData.is_remote}
              onChange={handleChange}
            />
          </FormSection>

          {/* Section: Rémunération et prérequis */}
          <FormSection title="Rémunération & prérequis" icon={Award}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                type="number"
                label="Salaire minimum (FCFA)"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                placeholder="500000"
                icon={TrendingUp}
              />

              <FormInput
                type="number"
                label="Salaire maximum (FCFA)"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                placeholder="900000"
                icon={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                type="select"
                label="Type de contrat"
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                icon={Briefcase}
                options={[
                  { value: '', label: 'Sélectionner' },
                  { value: 'cdi', label: 'CDI' },
                  { value: 'cdd', label: 'CDD' },
                  { value: 'freelance', label: 'Freelance' },
                  { value: 'internship', label: 'Stage' },
                ]}
              />

              <FormInput
                type="select"
                label="Niveau d'expérience"
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
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
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
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

          {/* Section: Compétences et Date limite */}
          <FormSection title="Compétences & date limite" icon={Clock}>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Compétences requises
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                <AnimatePresence>
                  {formData.requirements.map((req, index) => (
                    <RequirementTag
                      key={index}
                      text={req}
                      onRemove={() => handleRemoveRequirement(index)}
                    />
                  ))}
                </AnimatePresence>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAddRequirement}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter une compétence
              </motion.button>
            </div>

            <FormInput
              type="date"
              label="Date limite de candidature"
              name="application_deadline"
              value={formData.application_deadline}
              onChange={handleChange}
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
              onClick={handleGoBack}
              disabled={isSubmitting}
              className="px-6 py-3.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Annuler
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer les modifications
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
                <span className="font-semibold text-amber-400">Attention</span> — 
                Les modifications seront enregistrées et l'offre restera en statut <span className="text-amber-400 font-medium">{job.status}</span>.
                Vous pourrez la soumettre à nouveau pour validation.
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
              <span className="text-amber-400 font-medium">Édition</span> • {job.title}
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
              Niger v1.0.0
            </span>
            <span className="w-px h-4 bg-slate-800" />
            <span>Modification d'offre</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default OpportunityEditPage;