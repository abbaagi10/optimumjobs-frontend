// src/pages/Login.tsx

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import {
  Eye, EyeOff, Loader2, Mail, Lock, Briefcase,
  ArrowRight, ShieldCheck, CheckCircle2, Sparkles,
  Users, Rocket, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const data = response.data;

      if (data.access) {
        queryClient.clear();
        queryClient.resetQueries();

        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const userResponse = await authApi.getMe();
        const userData = userResponse.data;

        setUser(userData);
        setAuthenticated(true);

        toast.success('Connexion réussie 🎉');

        const redirectMap = {
          admin: '/admin/dashboard',
          organization: '/organization/dashboard',
          candidate: '/candidate/dashboard',
        };

        const redirectPath = redirectMap[userData.role as keyof typeof redirectMap] || '/';
        navigate(redirectPath, { replace: true });
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || 'Email ou mot de passe incorrect';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
                Bon retour 👋
              </h1>
              <p className="mt-2 text-sm text-[#14532D]/60">
                Connectez-vous à votre compte OptimaPlus-Jobs
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

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
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[#14532D]">
                    Mot de passe
                  </label>
                  <Link to="/forgot-password" className="text-xs text-[#16A34A] hover:underline font-semibold">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14532D]/40 group-focus-within:text-[#16A34A] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full pl-11 pr-11 py-3 bg-white border border-[#16A34A]/20 rounded-xl text-sm text-[#14532D] placeholder-[#14532D]/30 focus:outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 transition-all"
                    disabled={isLoading}
                    autoComplete="current-password"
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
              </div>

              {/* Bouton submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full mt-2 py-3.5 px-4 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm rounded-xl shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#14532D]/70">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-[#16A34A] hover:underline font-bold">
                  S'inscrire
                </Link>
              </p>
            </div>

            {/* Terms */}
            <div className="mt-8 pt-6 border-t border-[#16A34A]/10 text-center">
              <p className="text-xs text-[#14532D]/50 leading-relaxed">
                En continuant, vous acceptez nos{' '}
                <a href="#" className="underline hover:text-[#16A34A]">Conditions d'utilisation</a>{' '}
                et notre{' '}
                <a href="#" className="underline hover:text-[#16A34A]">Politique de confidentialité</a>.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ==========================================================
          DROITE : PANNEAU VERT + FORMES ABSTRAITES + CITATION
         ========================================================== */}
      <div className="hidden lg:block relative bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#14532D] overflow-hidden">

        {/* Formes décoratives */}
        <div className="absolute top-20 -right-20 w-80 h-80 rounded-full border-[40px] border-white/5" />
        <div className="absolute bottom-10 -left-20 w-96 h-96 rounded-full border-[30px] border-[#FCD34D]/10" />
        <div className="absolute top-1/3 left-20 w-24 h-24 rounded-2xl bg-[#FCD34D]/10 rotate-45" />
        <div className="absolute top-12 left-1/4 w-3 h-3 rounded-full bg-[#FCD34D]/60" />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-white/40" />
        <div className="absolute top-2/3 right-12 w-4 h-4 rounded-full bg-[#FCD34D]/40" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

        {/* Contenu */}
        <div className="relative h-full flex flex-col justify-between p-12 lg:p-16 text-white">

          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#FCD34D]" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-white/80">
              Bienvenue à nouveau
            </span>
          </div>

          {/* Contenu central */}
          <div className="max-w-md">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
              Votre prochaine
              <br />
              <span className="text-[#FCD34D]">
                opportunité
              </span>
              {" "}commence
              <br />
              ici.
            </h2>

            <p className="mt-6 text-base text-white/80 leading-relaxed">
              Retrouvez toutes vos candidatures, vos offres favorites et
              votre profil en un seul endroit.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: ShieldCheck, text: 'Connexion sécurisée SSL' },
                { icon: Users, text: '2 500+ candidats actifs au Niger' },
                { icon: TrendingUp, text: 'Suivi en temps réel de vos candidatures' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-[#FCD34D]" />
                  </div>
                  <span className="text-sm text-white/85">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Citation */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
            <p className="text-sm italic text-white/90 leading-relaxed">
              "Chaque grande carrière commence par une seule candidature."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80"
                alt="Amina"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FCD34D]/30"
              />
              <div>
                <p className="text-xs font-bold text-white">Amina Diallo</p>
                <p className="text-[11px] text-white/60">Développeuse à Niamey</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;