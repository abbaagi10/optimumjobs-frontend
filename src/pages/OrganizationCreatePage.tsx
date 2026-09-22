// src/pages/OrganizationCreatePage.tsx

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { organizationApi } from '../api/organization';
import {
  Building2, Save, X, Loader2, ArrowLeft, Home,
  Sparkles, Shield, Activity,
  Globe, MapPin, Phone, Link2, Info,
  AlertCircle, Briefcase, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

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
    </div>
  );
};

// ==========================================================
// FORM TEXTAREA
// ==========================================================

const FormTextarea = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  rows = 4,
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

      <textarea
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={`w-full bg-white text-[#14532D] px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none font-medium placeholder-[#14532D]/30 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
            : 'border-[#16A34A]/20 focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10'
        }`}
      />
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

export const OrganizationCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      toast.success('Organisation créée');
      queryClient.invalidateQueries({ queryKey: ['myOrganizations'] });
      queryClient.invalidateQueries({ queryKey: ['orgJobs'] });
      setTimeout(() => {
        navigate('/organization/dashboard', { replace: true });
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
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
      toast.error("Veuillez renseigner le nom de l'organisation");
      return;
    }
    createMutation.mutate(formData);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isCheckingOrg) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
        <p className="text-sm text-[#14532D]/60 font-medium">
          Vérification de votre organisation...
        </p>
      </div>
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
    <div className="max-w-3xl mx-auto space-y-6">

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
          <span className="text-xs text-[#14532D]/70 font-semibold">Créer une organisation</span>
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
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#14532D] flex flex-wrap items-center gap-3">
                Créer une Organisation
                <span className="px-2.5 py-1 text-[10px] font-bold bg-[#FCD34D] text-[#14532D] rounded-full shrink-0">
                  NOUVEAU
                </span>
              </h1>
              <p className="text-sm text-[#14532D]/60 mt-1">
                Remplissez les informations de votre entreprise au Niger.
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

          <FormTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Présentation de votre organisation au Niger..."
            icon={FileText}
            rows={4}
          />
        </FormSection>

        {/* Section: Contact et Localisation */}
        <FormSection title="Contact & Localisation" icon={Globe}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleGoBack}
              disabled={createMutation.isPending}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#16A34A]/20 text-[#14532D] rounded-xl text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            </button>
          </div>

          {/* Info */}
          <div className="mt-5 flex items-start gap-3 p-4 bg-[#F0FDF4] border border-[#16A34A]/15 rounded-xl">
            <div className="p-2 rounded-lg bg-white shrink-0">
              <Info className="w-4 h-4 text-[#16A34A]" />
            </div>
            <p className="text-xs text-[#14532D]/70 leading-relaxed">
              <span className="font-bold text-[#16A34A]">Important</span> — Après la création, vous pourrez publier des offres d'emploi et gérer vos candidatures au Niger.
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
            <span className="text-[#16A34A] font-bold">Création</span> • Organisation
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
          <span>Création d'organisation</span>
        </div>
      </div>

    </div>
  );
};

export default OrganizationCreatePage;