// src/pages/AdminProfilePage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit2,
  Save,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  LayoutDashboard,
  Crown,
  Activity,
  Fingerprint,
  Shield,
  Zap,
  Copy,
  Check,
  Camera,
  Lock,
  Bell,
  HelpCircle,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { profileApi } from '../api/profile';
import { useAuthStore } from '../store/authStore';
import { CandidateProfile } from '../types';

// ==========================================================
// TYPES
// ==========================================================

interface AdminProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  country: string;
  bio: string;
}

interface ApiErrorResponse {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

const emptyForm: AdminProfileForm = {
  first_name: '',
  last_name: '',
  phone: '',
  city: '',
  country: '',
  bio: '',
};

// ==========================================================
// COMPOSANTS
// ==========================================================

const ProfileDisplayValue: React.FC<{
  value?: string | null;
  icon?: React.ReactNode;
}> = ({ value, icon }) => (
  <div className="flex items-center gap-3 px-4 h-[46px] rounded-xl bg-[#FAFAF9] border border-[#16A34A]/15 overflow-hidden w-full group hover:border-[#16A34A]/30 transition-all">
    {icon && (
      <span className="text-[#14532D]/40 group-hover:text-[#16A34A] transition-colors shrink-0">
        {icon}
      </span>
    )}
    <span className="text-sm text-[#14532D] font-medium truncate min-w-0 flex-1">
      {value || 'Non renseigné'}
    </span>
  </div>
);

const InfoCard = ({ icon: Icon, label, value, color = 'green' }: any) => {
  const colors: any = {
    green: 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20',
    amber: 'bg-[#FEF3C7] text-[#B88400] border-[#FCD34D]/40',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    emerald: 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20',
  };
  const c = colors[color] || colors.green;

  return (
    <div className="p-3 rounded-xl bg-[#FAFAF9] border border-[#16A34A]/10 hover:border-[#16A34A]/30 transition-all group">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[#14532D]/50 font-medium">{label}</span>
        <div className={`p-1.5 rounded-lg ${c} group-hover:scale-110 transition-transform shrink-0`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-sm font-bold text-[#14532D] mt-2 break-words">{value}</p>
    </div>
  );
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminProfileForm>(emptyForm);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // ==========================================================
  // QUERY
  // ==========================================================

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery<CandidateProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileApi.getProfile();
      return response.data;
    },
  });

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const getInitialFormData = (profData?: CandidateProfile | null): AdminProfileForm => ({
    first_name: profData?.first_name || user?.first_name || '',
    last_name: profData?.last_name || user?.last_name || '',
    phone: profData?.phone || user?.phone || '',
    city: profData?.city || user?.city || '',
    country: profData?.country || user?.country || 'Niger',
    bio: profData?.bio || '',
  });

  useEffect(() => {
    if (profile) {
      setForm(getInitialFormData(profile));
    }
  }, [profile, user]);

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const updateProfileMutation = useMutation({
    mutationFn: (data: AdminProfileForm) => profileApi.updateProfile(data),

    onSuccess: async () => {
      toast.success('Profil mis à jour');
      setIsEditing(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
      ]);
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error('Erreur mise à jour profil admin:', error);
      const backendError = error?.response?.data;
      let message = 'Impossible de mettre à jour le profil.';

      if (backendError?.detail) {
        message = backendError.detail;
      } else if (backendError && typeof backendError === 'object') {
        const firstError = Object.values(backendError)[0];
        if (Array.isArray(firstError)) {
          message = String(firstError[0]);
        } else if (firstError) {
          message = String(firstError);
        }
      }

      toast.error(message);
    },
  });

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(form);
  };

  const handleCancel = () => {
    setForm(getInitialFormData(profile));
    setIsEditing(false);
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setIsCopied(true);
      toast.success('Email copié');
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  // ==========================================================
  // COMPUTED
  // ==========================================================

  const firstName = profile?.first_name || user?.first_name || '';
  const lastName = profile?.last_name || user?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Compte Administrateur';

  const initials =
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    'A';

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#16A34A]" />
          <p className="text-sm text-[#14532D]/60 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-10">
        <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#14532D]">
            Impossible de charger le profil
          </h2>
          <p className="text-xs sm:text-sm text-[#14532D]/60 mt-2">
            Une erreur est survenue lors de la récupération de votre profil.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-6 px-6 sm:px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] transition-all text-sm sm:text-base"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">

      {/* ======================================================
          BOUTON RETOUR
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#16A34A]/15 text-[#14532D]/70 text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/30 hover:text-[#14532D] transition-all group w-full xs:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-[#16A34A] group-hover:-translate-x-1 transition-transform" />
          <LayoutDashboard className="w-4 h-4 text-[#16A34A]" />
          <span>Retour au Tableau de Bord</span>
        </button>

        <div className="flex items-center gap-2 rounded-full bg-white border border-[#16A34A]/15 px-4 py-1.5 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)] self-start xs:self-auto">
          <Crown className="w-3 h-3 text-[#FCD34D]" />
          <span className="text-xs text-[#14532D]/70 font-semibold">Admin Niger</span>
        </div>
      </div>

      {/* ======================================================
          HEADER DE PROFIL
      ====================================================== */}

      <div className="bg-white border border-[#16A34A]/10 rounded-2xl overflow-hidden">
        {/* Bordure top gradient */}
        <div className="h-1 bg-gradient-to-r from-[#16A34A] via-[#FCD34D] to-[#16A34A]" />

        <div className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

              {/* Avatar */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setIsHoveringAvatar(true)}
                onMouseLeave={() => setIsHoveringAvatar(false)}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] flex items-center justify-center relative overflow-hidden">
                  <span className="text-2xl font-extrabold text-white">
                    {initials}
                  </span>
                  {isHoveringAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#16A34A] border-2 border-white" />
              </div>

              {/* Titres et infos */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#14532D] truncate">
                    {fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#16A34A]/20 text-[#16A34A] text-xs font-bold shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Administrateur
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#14532D]/60">
                  {user?.email && (
                    <span
                      className="inline-flex items-center gap-1.5 max-w-full cursor-pointer group"
                      onClick={handleCopyEmail}
                    >
                      <Mail className="w-4 h-4 shrink-0 text-[#16A34A]" />
                      <span className="truncate group-hover:text-[#14532D] transition-colors">
                        {user.email}
                      </span>
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#14532D]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </span>
                  )}

                  {(profile?.city || profile?.country) && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 text-[#16A34A]" />
                      <span>
                        {[profile?.city, profile?.country || 'Niger']
                          .filter(Boolean)
                          .join(', ')}
                      </span>
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

            {/* Boutons d'action */}
            <div className="flex flex-col xs:flex-row gap-2 pt-4 border-t border-[#16A34A]/10">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-bold hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full xs:w-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier le profil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                    className="px-5 py-2.5 rounded-xl bg-white border border-[#16A34A]/20 text-[#14532D] text-sm font-semibold hover:bg-[#F0FDF4] hover:border-[#16A34A]/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full xs:w-auto"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="px-5 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-bold hover:bg-[#15803D] shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_8px_16px_-4px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full xs:w-auto"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Enregistrer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          CONTENU PRINCIPAL
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Colonne gauche — Infos personnelles */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">

            <div className="flex items-center gap-3 pb-5 border-b border-[#16A34A]/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-[#14532D]">
                  Informations personnelles
                </h2>
                <p className="text-xs text-[#14532D]/50">
                  Gérez les informations de votre compte administrateur.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">

              {/* Prénom */}
              <div>
                <label className="block text-xs font-semibold text-[#14532D]/70 mb-2">
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    className="w-full px-4 h-[46px] rounded-xl bg-white text-[#14532D] border border-[#16A34A]/20 placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all text-sm font-medium"
                  />
                ) : (
                  <ProfileDisplayValue value={profile?.first_name} />
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-[#14532D]/70 mb-2">
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="w-full px-4 h-[46px] rounded-xl bg-white text-[#14532D] border border-[#16A34A]/20 placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all text-sm font-medium"
                  />
                ) : (
                  <ProfileDisplayValue value={profile?.last_name} />
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#14532D]/70 mb-2">
                  Adresse email
                </label>
                <ProfileDisplayValue
                  icon={<Mail className="w-4 h-4 shrink-0" />}
                  value={user?.email}
                />
                <p className="text-xs text-[#14532D]/40 mt-1.5">
                  L'adresse email est gérée par le compte utilisateur.
                </p>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-semibold text-[#14532D]/70 mb-2">
                  Téléphone
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#16A34A] pointer-events-none" />
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Ex : +227 XX XX XX XX"
                      className="w-full pl-11 pr-4 h-[46px] rounded-xl bg-white text-[#14532D] border border-[#16A34A]/20 placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all text-sm font-medium"
                    />
                  </div>
                ) : (
                  <ProfileDisplayValue
                    icon={<Phone className="w-4 h-4 shrink-0" />}
                    value={profile?.phone}
                  />
                )}
              </div>

              {/* Ville */}
              <div>
                <label className="block text-xs font-semibold text-[#14532D]/70 mb-2">
                  Ville
                </label>
                {isEditing ? (
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#16A34A] pointer-events-none" />
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Votre ville"
                      className="w-full pl-11 pr-4 h-[46px] rounded-xl bg-white text-[#14532D] border border-[#16A34A]/20 placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all text-sm font-medium"
                    />
                  </div>
                ) : (
                  <ProfileDisplayValue
                    icon={<MapPin className="w-4 h-4 shrink-0" />}
                    value={profile?.city}
                  />
                )}
              </div>

              {/* Pays */}
              <div>
                <label className="block text-xs font-semibold text-[#14532D]/70 mb-2">
                  Pays
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#16A34A] pointer-events-none" />
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Votre pays"
                      className="w-full pl-11 pr-4 h-[46px] rounded-xl bg-white text-[#14532D] border border-[#16A34A]/20 placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all text-sm font-medium"
                    />
                  </div>
                ) : (
                  <ProfileDisplayValue
                    icon={<Globe className="w-4 h-4 shrink-0" />}
                    value={profile?.country || 'Niger'}
                  />
                )}
              </div>
            </div>

            {/* Biographie */}
            <div className="mt-5">
              <label className="block text-xs font-semibold text-[#14532D]/70 mb-2">
                Biographie / Présentation
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Présentez-vous brièvement..."
                  className="w-full px-4 py-3 rounded-xl bg-white text-[#14532D] border border-[#16A34A]/20 placeholder-[#14532D]/30 resize-none focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all text-sm font-medium"
                />
              ) : (
                <div className="min-h-[110px] px-4 py-3 rounded-xl bg-[#FAFAF9] border border-[#16A34A]/15 text-sm text-[#14532D]/80 leading-relaxed break-words">
                  {profile?.bio || 'Aucune présentation renseignée.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite — Compte & Actions */}
        <div className="space-y-4 sm:space-y-6">

          {/* Informations du compte */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3 pb-5 border-b border-[#16A34A]/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-[#14532D]">Compte</h2>
                <p className="text-xs text-[#14532D]/50">Informations de sécurité</p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <InfoCard
                icon={ShieldCheck}
                label="Rôle"
                value="Administrateur"
                color="amber"
              />
              <InfoCard
                icon={CheckCircle2}
                label="Statut"
                value={user?.is_active ? 'Actif' : 'Inactif'}
                color="emerald"
              />
              <InfoCard
                icon={Mail}
                label="Email du compte"
                value={user?.email || 'Non disponible'}
                color="blue"
              />
              <InfoCard
                icon={Fingerprint}
                label="ID Utilisateur"
                value={`#${user?.id || 'N/A'}`}
                color="purple"
              />
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-xs font-bold text-[#14532D]/50 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#FCD34D]" />
              Actions rapides
            </h2>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAF9] rounded-xl border border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] transition-all text-sm text-[#14532D]/80 hover:text-[#14532D] group font-medium"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#16A34A]" />
                  Changer le mot de passe
                </span>
                <ChevronRight className="w-4 h-4 text-[#14532D]/40 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAF9] rounded-xl border border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] transition-all text-sm text-[#14532D]/80 hover:text-[#14532D] group font-medium"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#16A34A]" />
                  Notifications
                </span>
                <ChevronRight className="w-4 h-4 text-[#14532D]/40 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAF9] rounded-xl border border-[#16A34A]/10 hover:border-[#16A34A]/30 hover:bg-[#F0FDF4] transition-all text-sm text-[#14532D]/80 hover:text-[#14532D] group font-medium"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#16A34A]" />
                  Aide & Support
                </span>
                <ChevronRight className="w-4 h-4 text-[#14532D]/40 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Session */}
          <div className="bg-white border border-[#16A34A]/10 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#14532D]/60">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                </span>
                <span className="font-medium text-[#16A34A]">Session active</span>
              </span>
              <span className="w-px h-4 bg-[#16A34A]/20" />
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-6 border-t border-[#16A34A]/10 text-xs text-[#14532D]/50">
        <div className="flex flex-wrap items-center justify-center xs:justify-start gap-4">
          <span>
            <span className="text-[#16A34A] font-bold">Admin</span> • Profil
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
          <span>Profil Admin</span>
        </div>
      </div>

    </form>
  );
};

export default AdminProfilePage;