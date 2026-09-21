// src/pages/Register.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';
import {
  User, Building2, Mail, Lock, Sparkles, CheckCircle2,
  Eye, EyeOff, Loader2, Briefcase, ArrowRight, ShieldCheck,
  Users, Rocket, TrendingUp,
} from 'lucide-react';

// ==========================================================
// ICÔNES SOCIALES
// ==========================================================

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#0A66C2" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
  </svg>
);

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'organization'>('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ email, password, role });
      const roleText = role === 'candidate' ? 'candidat' : 'recruteur';
      toast.success(`Compte ${roleText} créé avec succès ! Connectez-vous.`);
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.email?.[0] ||
                           err.response?.data?.password?.[0] ||
                           err.response?.data?.detail ||
                           'Erreur lors de la création du compte.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ==========================================================
          GAUCHE : FORMULAIRE
         ========================================================== */}
      <div className="flex flex-col bg-white">

        {/* Header logo */}
        <header className="px-6 sm:px-12 py-5 border-b border-[#16A34A]/10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)] group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FCD34D] rounded-full border-2 border-white" />
            </div>
            <span className="text-base font-extrabold text-[#14532D] tracking-tight">
              OptimaPlus<span className="text-[#FCD34D]">-Jobs</span>
            </span>
          </Link>
        </header>

        {/* Form centré */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14532D] tracking-tight">
                Créer un compte
              </h1>
              <p className="mt-2 text-sm text-[#14532D]/60">
                Choisissez votre profil et commencez dès aujourd'hui
              </p>
            </div>

            {/* Sélecteur de rôle — GRAND FORMAT */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#14532D] mb-3">
                Je m'inscris en tant que
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">

                {/* Candidat */}
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`group relative flex flex-col items-center text-center gap-3 py-5 px-3 border-2 rounded-2xl transition-all duration-300 ${
                    role === 'candidate'
                      ? 'bg-[#F0FDF4] border-[#16A34A] shadow-[0_8px_24px_-8px_rgba(22,163,74,0.3)]'
                      : 'bg-white border-[#16A34A]/15 hover:border-[#16A34A]/40 hover:bg-[#FAFAF9]'
                  }`}
                >
                  {role === 'candidate' && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    role === 'candidate'
                      ? 'bg-[#16A34A] text-white shadow-[0_4px_12px_-2px_rgba(22,163,74,0.4)]'
                      : 'bg-[#F0FDF4] text-[#16A34A] group-hover:bg-[#16A34A]/10'
                  }`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={`text-sm font-extrabold transition-colors ${
                      role === 'candidate' ? 'text-[#14532D]' : 'text-[#14532D]/80'
                    }`}>
                      Candidat
                    </div>
                    <div className="text-[11px] text-[#14532D]/50 mt-0.5">
                      Je cherche un emploi
                    </div>
                  </div>
                </button>

                {/* Recruteur */}
                <button
                  type="button"
                  onClick={() => setRole('organization')}
                  className={`group relative flex flex-col items-center text-center gap-3 py-5 px-3 border-2 rounded-2xl transition-all duration-300 ${
                    role === 'organization'
                      ? 'bg-[#FEF3C7] border-[#FCD34D] shadow-[0_8px_24px_-8px_rgba(252,211,77,0.4)]'
                      : 'bg-white border-[#16A34A]/15 hover:border-[#FCD34D]/60 hover:bg-[#FEF3C7]/30'
                  }`}
                >
                  {role === 'organization' && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#FCD34D] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#14532D]" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    role === 'organization'
                      ? 'bg-[#FCD34D] text-[#14532D] shadow-[0_4px_12px_-2px_rgba(252,211,77,0.5)]'
                      : 'bg-[#FEF3C7] text-[#B88400] group-hover:bg-[#FCD34D]/30'
                  }`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={`text-sm font-extrabold transition-colors ${
                      role === 'organization' ? 'text-[#14532D]' : 'text-[#14532D]/80'
                    }`}>
                      Recruteur
                    </div>
                    <div className="text-[11px] text-[#14532D]/50 mt-0.5">
                      Je publie des offres
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#14532D]">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14532D]/40 group-focus-within:text-[#16A34A] transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#16A34A]/20 rounded-xl text-sm text-[#14532D] placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#14532D]">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14532D]/40 group-focus-within:text-[#16A34A] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="w-full pl-11 pr-11 py-3 bg-white border border-[#16A34A]/20 rounded-xl text-sm text-[#14532D] placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#14532D]/40 hover:text-[#16A34A] transition-colors p-1"
                    aria-label="Afficher ou masquer le mot de passe"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-[#14532D]/50 mt-1">Doit contenir au moins 8 caractères.</p>
              </div>

              {/* Bouton submit — DYNAMIQUE selon le rôle */}
              <button
                type="submit"
                disabled={loading}
                className={`group w-full mt-2 py-3.5 px-4 text-sm font-bold rounded-xl shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 ${
                  role === 'organization'
                    ? 'bg-[#FCD34D] text-[#14532D] hover:bg-[#EAB308]'
                    : 'bg-[#16A34A] text-white hover:bg-[#15803D]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {role === 'candidate' ? 'Créer mon compte candidat' : 'Créer mon compte recruteur'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#16A34A]/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#14532D]/50 font-medium">
                  ou continuer avec
                </span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center justify-center gap-3">
              <button className="w-12 h-12 border border-[#16A34A]/15 rounded-xl flex items-center justify-center hover:bg-[#F0FDF4] hover:border-[#16A34A]/30 transition-all">
                <GoogleIcon />
              </button>
              <button className="w-12 h-12 border border-[#16A34A]/15 rounded-xl flex items-center justify-center hover:bg-[#F0FDF4] hover:border-[#16A34A]/30 transition-all">
                <LinkedInIcon />
              </button>
            </div>

            {/* Lien connexion */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#14532D]/70">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="text-[#16A34A] hover:underline font-bold">
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Terms */}
            <div className="mt-6 pt-5 border-t border-[#16A34A]/10 text-center">
              <p className="text-xs text-[#14532D]/50 leading-relaxed">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="#" className="underline hover:text-[#16A34A]">Conditions d'utilisation</a>{' '}
                et notre{' '}
                <a href="#" className="underline hover:text-[#16A34A]">Politique de confidentialité</a>.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ==========================================================
          DROITE : PANNEAU VERT DYNAMIQUE SELON LE RÔLE
         ========================================================== */}
      <div className="hidden lg:block relative bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#14532D] overflow-hidden">

        {/* Formes décoratives */}
        <div className="absolute top-20 -right-20 w-80 h-80 rounded-full border-[40px] border-white/5" />
        <div className="absolute bottom-10 -left-20 w-96 h-96 rounded-full border-[30px] border-[#FCD34D]/10" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-2xl bg-[#FCD34D]/10 rotate-45" />
        <div className="absolute top-12 right-1/4 w-3 h-3 rounded-full bg-[#FCD34D]/60" />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

        <div className="relative h-full flex flex-col justify-between p-12 lg:p-16 text-white">

          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#FCD34D]" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-white/80">
              {role === 'organization' ? 'Espace recruteur' : 'Espace candidat'}
            </span>
          </div>

          {/* Contenu central — DYNAMIQUE */}
          <div className="max-w-md">

            {role === 'organization' ? (
              <>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
                  Recrutez les
                  <br />
                  <span className="text-[#FCD34D]">
                    meilleurs
                  </span>
                  <br />
                  talents du Niger.
                </h2>

                <p className="mt-6 text-base text-white/80 leading-relaxed">
                  Publiez vos offres, gérez vos candidatures et trouvez
                  les professionnels qui feront grandir votre entreprise.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    { icon: Building2, text: 'Publiez vos offres gratuitement' },
                    { icon: Users, text: 'Accédez à 2 500+ candidats qualifiés' },
                    { icon: Rocket, text: 'Gérez toutes vos candidatures' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-[#FCD34D]" />
                      </div>
                      <span className="text-sm text-white/85">{item.text}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
                  Trouvez le job
                  <br />
                  <span className="text-[#FCD34D]">
                    qui vous
                  </span>
                  <br />
                  ressemble.
                </h2>

                <p className="mt-6 text-base text-white/80 leading-relaxed">
                  Créez votre profil, postulez en un clic aux meilleures
                  offres et suivez vos candidatures en temps réel.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    { icon: User, text: 'Créez un profil pro en 1 minute' },
                    { icon: ShieldCheck, text: 'Accédez à 2 500+ offres vérifiées' },
                    { icon: Rocket, text: 'Postulez en 1 clic avec votre CV' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-[#FCD34D]" />
                      </div>
                      <span className="text-sm text-white/85">{item.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Citation en bas — DYNAMIQUE */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
            {role === 'organization' ? (
              <>
                <p className="text-sm italic text-white/90 leading-relaxed">
                  "Publier une offre sur OptimaPlus-Jobs nous a permis de recruter en 10 jours."
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=faces&q=80"
                    alt="Fatouma"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FCD34D]/30"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">Fatouma Amadou</p>
                    <p className="text-[11px] text-white/60">DRH • TechCorp Niger</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm italic text-white/90 leading-relaxed">
                  "J'ai trouvé mon emploi en 2 semaines grâce à OptimaPlus-Jobs."
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
                    alt="Ibrahim"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FCD34D]/30"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">Ibrahim Souley</p>
                    <p className="text-[11px] text-white/60">Chef de projet à Zinder</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;