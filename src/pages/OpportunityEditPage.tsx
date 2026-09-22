// src/pages/OpportunityEditPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../api/organization';
import {
  ArrowLeft, Home, Loader2, Save, X, MapPin, Briefcase,
  Shield, Activity, Building2, Globe, Calendar, Users, Award,
  FileText, CheckCircle2, AlertCircle, Edit2, Plus,
  Info, TrendingUp, GraduationCap, Clock, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// ==========================================================
// FORM INPUT
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
  name,
  className = '',
}: any) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-semibold text-[#14532D]/70 flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
        {error && (
          <span className="text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </span>
        )}
      </div>

      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full bg-white text-[#14532D] px-4 py-3 rounded-xl border text-sm transition-all outline-none font-medium cursor-pointer ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
              : 'border-[#16A34A]/20 focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10'
          }`}
        >
          <option value="">{placeholder || 'Sélectionner'}</option>
          {options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={5}
          placeholder={placeholder}
          className={`w-full bg-white text-[#14532D] px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none font-medium placeholder-[#14532D]/30 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
              : 'border-[#16A34A]/20 focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10'
          }`}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            name={name}
            checked={value}
            onChange={onChange}
            className="w-5 h-5 rounded bg-white border-[#16A34A]/30 text-[#16A34A] focus:ring-[#16A34A] focus:ring-offset-0 transition-all shrink-0 accent-[#16A34A]"
          />
          <span className="text-sm text-[#14532D]/80 font-medium">
            Oui, cette offre est en télétravail
          </span>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full bg-white text-[#14532D] px-4 py-3 rounded-xl border text-sm transition-all outline-none font-medium placeholder-[#14532D]/30 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
              : 'border-[#16A34A]/20 focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10'
          }`}
        />
      )}
    </div>
  );
};

// ==========================================================
// FORM SECTION
// ==========================================================

const FormSection = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6 space-y-5">
    <div className="flex items-center gap-3 pb-4 border-b border-[#16A34A]/10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-base font-extrabold text-[#14532D] truncate">{title}</h3>
    </div>
    {children}
  </div>
);

// ==========================================================
// REQUIREMENT TAG
// ==========================================================

const RequirementTag = ({ text, onRemove }: { text: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-lg text-sm text-[#14532D] font-medium hover:bg-[#16A34A]/10 transition-all">
    <span className="truncate max-w-[200px]">{text}</span>
    <button
      type="button"
      onClick={onRemove}
      className="text-[#16A34A] hover:text-rose-500 transition-colors ml-0.5 shrink-0"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </span>
);

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

export const OpportunityEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  // QUERIES
  // ==========================================================

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => organizationApi.getOpportunityDetail(Number(id)).then((res) => res.data),
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
      toast.success('Offre mise à jour');
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      queryClient.invalidateQueries({ queryKey: ['orgJobs'] });
      navigate('/organization/dashboard');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ||
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddRequirement = () => {
    const req = prompt('Ajouter une compétence requise :');
    if (req && req.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, req.trim()],
      }));
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
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
            L'offre que vous cherchez n'existe pas.
          </p>
          <button
            onClick={handleGoBack}
            className="mt-6 px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CHECK IF EDITABLE
  // ==========================================================

  const canEdit = job.status === 'draft' || job.status === 'rejected';

  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-[#FCD34D]/40 rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#FEF3C7] flex items-center justify-center border border-[#FCD34D]/40">
            <AlertCircle className="w-10 h-10 text-[#B88400]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#14532D]">
            Modification non autorisée
          </h2>
          <p className="text-sm text-[#14532D]/60 mt-2">
            Cette offre est en statut <strong className="text-[#B88400]">{job.status}</strong> et ne peut pas être modifiée.
          </p>
          <button
            onClick={handleGoBack}
            className="mt-6 px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="max-w-4xl mx-auto space-y-6">

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
          <span className="text-xs text-[#14532D]/70 font-semibold">Modifier l'offre</span>
        </div>
      </div>

      {/* ======================================================
          EN-TÊTE
      ====================================================== */}

      <div className="bg-white border border-[#16A34A]/10 rounded-3xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#16A34A] via-[#FCD34D] to-[#16A34A]" />

        <div className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shrink-0 shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)]">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#14532D]">
                  Modifier l'offre
                </h1>
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full shrink-0 ${
                    job.status === 'draft'
                      ? 'bg-[#FEF3C7] text-[#B88400] border border-[#FCD34D]/40'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {job.status === 'draft' ? 'Brouillon' : 'Révision'}
                </span>
              </div>
              <p className="text-sm text-[#14532D]/60 mt-1">
                Modifiez les informations de votre offre d'emploi au Niger.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          FORMULAIRE
      ====================================================== */}

      <form onSubmit={handleSubmit} className="space-y-5">

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Section: Rémunération */}
        <FormSection title="Rémunération & prérequis" icon={Award}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                { value: 'entry', label: 'Débutant' },
                { value: 'junior', label: 'Junior' },
                { value: 'senior', label: 'Senior' },
                { value: 'expert', label: 'Expert' },
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
                { value: 'bachelor', label: 'Licence' },
                { value: 'master', label: 'Master' },
                { value: 'phd', label: 'Doctorat' },
                { value: 'other', label: 'Autre' },
              ]}
            />
          </div>
        </FormSection>

        {/* Section: Compétences et Date limite */}
        <FormSection title="Compétences & date limite" icon={Clock}>
          <div>
            <label className="text-xs font-semibold text-[#14532D]/70 flex items-center gap-2 mb-3">
              <Star className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              Compétences requises
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.requirements.map((req, index) => (
                <RequirementTag
                  key={index}
                  text={req}
                  onRemove={() => handleRemoveRequirement(index)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddRequirement}
              className="w-full xs:w-auto px-4 py-2.5 bg-[#16A34A] text-white rounded-xl text-sm font-bold hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter une compétence
            </button>
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

        <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGoBack}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-xl text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-6 py-3.5 bg-[#16A34A] text-white rounded-xl text-sm font-bold hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
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
            </button>
          </div>

          {/* Info */}
          <div className="mt-5 flex items-start gap-3 p-4 bg-[#F0FDF4] border border-[#16A34A]/15 rounded-xl">
            <div className="p-2 rounded-lg bg-white shrink-0">
              <Info className="w-4 h-4 text-[#16A34A]" />
            </div>
            <p className="text-xs text-[#14532D]/70 leading-relaxed">
              <span className="font-bold text-[#16A34A]">Attention</span> — Les modifications seront enregistrées et l'offre restera en statut{' '}
              <span className="font-bold text-[#16A34A]">{job.status}</span>. Vous pourrez la soumettre à nouveau pour validation.
            </p>
          </div>
        </div>

      </form>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span className="truncate max-w-[220px] sm:max-w-none">
            <span className="text-[#16A34A] font-bold">Édition</span> • {job.title}
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
          <span>Modification d'offre</span>
        </div>
      </div>

    </div>
  );
};

export default OpportunityEditPage;