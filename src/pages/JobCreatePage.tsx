// src/pages/JobCreatePage.tsx

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/jobs';
import { organizationApi } from '../api/organization';
import {
  Briefcase, Save, X, Loader2, ArrowLeft, Home,
  Sparkles, Shield, Activity,
  Building2, MapPin, Globe, Calendar, Users, Award,
  FileText, CheckCircle2, AlertCircle, Plus, Info,
  TrendingUp, GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Organization } from '../types';

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
          value={value}
          onChange={onChange}
          required={required}
          rows={4}
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
// COMPOSANT PRINCIPAL
// ==========================================================

export const JobCreatePage = () => {
  const navigate = useNavigate();
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
      toast.success('Offre créée en brouillon');
      navigate('/organization/dashboard');
    },
    onError: (error: any) => {
      console.error('❌ Erreur création offre:', error);
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Erreur lors de la création de l'offre";
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
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#14532D]/60 font-medium">
          Chargement de vos organisations...
        </p>
      </div>
    );
  }

  // ==========================================================
  // NO ORGANIZATION
  // ==========================================================

  const orgsList: Organization[] = organizations || [];

  if (orgsList.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-[#16A34A]/10 rounded-3xl p-6 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)]">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#14532D]">
              Aucune organisation
            </h2>
            <p className="text-sm text-[#14532D]/60 mt-2">
              Vous devez créer une organisation avant de publier une offre.
            </p>
          </div>
          <button
            onClick={() => navigate('/organization/create')}
            className="px-8 py-3.5 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Créer une organisation
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
          <span className="text-xs text-[#14532D]/70 font-semibold">Nouvelle offre</span>
          <Sparkles className="w-3 h-3 text-[#FCD34D]" />
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
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#14532D] flex flex-wrap items-center gap-3">
                Publier une offre
                <span className="px-2.5 py-1 text-[10px] font-bold bg-[#FCD34D] text-[#14532D] rounded-full shrink-0">
                  NOUVEAU
                </span>
              </h1>
              <p className="text-sm text-[#14532D]/60 mt-1">
                Créez une nouvelle opportunité d'emploi pour votre organisation au Niger.
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
                label: org.name,
              }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                type="select"
                label="Type d'opportunité"
                value={formData.opportunity_type}
                onChange={(e: any) =>
                  setFormData({ ...formData, opportunity_type: e.target.value })
                }
                icon={Briefcase}
                options={[
                  { value: 'job', label: 'Emploi' },
                  { value: 'internship', label: 'Stage' },
                  { value: 'volunteer', label: 'Volontariat' },
                  { value: 'training', label: 'Formation' },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Section: Rémunération */}
        <FormSection title="Rémunération & prérequis" icon={Award}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              type="select"
              label="Niveau d'expérience"
              value={formData.experience_level}
              onChange={(e: any) =>
                setFormData({ ...formData, experience_level: e.target.value })
              }
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
              value={formData.education_level}
              onChange={(e: any) =>
                setFormData({ ...formData, education_level: e.target.value })
              }
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
            placeholder={'Diplôme en informatique\n5 ans d\'expérience\nMaîtrise de React'}
            icon={CheckCircle2}
          />

          <FormInput
            type="date"
            label="Date limite de candidature"
            value={formData.application_deadline}
            onChange={(e: any) =>
              setFormData({ ...formData, application_deadline: e.target.value })
            }
            icon={Calendar}
          />
        </FormSection>

        {/* ======================================================
            BOUTONS D'ACTION
        ====================================================== */}

        <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/organization/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-xl text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:flex-1 px-6 py-3.5 bg-[#16A34A] text-white rounded-xl text-sm font-bold hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Créer en brouillon
            </button>
          </div>

          {/* Indicateur brouillon */}
          <div className="mt-5 flex items-start gap-3 p-4 bg-[#F0FDF4] border border-[#16A34A]/15 rounded-xl">
            <div className="p-2 rounded-lg bg-white shrink-0">
              <Info className="w-4 h-4 text-[#16A34A]" />
            </div>
            <p className="text-xs text-[#14532D]/70 leading-relaxed">
              <span className="font-bold text-[#16A34A]">Brouillon</span> — Votre offre sera
              enregistrée en brouillon. Vous pourrez la modifier et la soumettre à modération
              ultérieurement.
            </p>
          </div>
        </div>

      </form>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span>
            <span className="text-[#16A34A] font-bold">Nouvelle offre</span> • Création
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
          <span>Création d'offre</span>
        </div>
      </div>

    </div>
  );
};

export default JobCreatePage;