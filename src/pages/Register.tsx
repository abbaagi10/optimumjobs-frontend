// src/pages/Register.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';
import { User, Building2, Mail, Lock, Sparkles, CheckCircle2, Eye, EyeOff, Loader2, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

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
      toast.success('Compte créé avec succès ! Connectez-vous.');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center items-center relative overflow-hidden selection:bg-amber-500 selection:text-slate-950 py-6">
      {/* Halo lumineux d'arrière-plan */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[750px] rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden m-4">
        
        {/* Panneau de Gauche : Hero Section */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/60">
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

          {/* En-tête marque */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Optimum<span className="text-amber-400">Jobs+</span>
              </span>
              <span className="px-2 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 rounded-full">
                NIGER
              </span>
            </Link>
          </div>

          {/* Contenu promotionnel */}
          <div className="relative z-10 my-8">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Rejoignez l'élite du <br />
              <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                recrutement au Niger.
              </span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Que vous soyez à la recherche de votre prochain défi ou du talent idéal au Niger, créez votre profil sur-mesure en quelques clics.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'Inscription rapide en moins de 2 minutes',
                'Visibilité auprès des meilleurs recruteurs du Niger',
                'Espace personnalisé selon votre profil'
              ].map((text, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pied de page panneau gauche */}
          <div className="relative z-10 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400/80" />
              <span>Données 100% sécurisées</span>
            </div>
            <span>© 2026</span>
          </div>
        </div>

        {/* Panneau de Droite : Formulaire */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-950/40">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">Créer un compte</h3>
              <p className="text-sm text-slate-400 mt-1">
                Choisissez votre profil et commencez dès aujourd'hui au Niger.
              </p>
            </div>

            {/* Sélecteur de rôle interactif */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Vous êtes :
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                    role === 'candidate'
                      ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <User className={`w-5 h-5 ${role === 'candidate' ? 'text-amber-400' : 'text-slate-500'}`} />
                    {role === 'candidate' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="font-bold text-sm">Candidat</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Je cherche un emploi</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('organization')}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                    role === 'organization'
                      ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Building2 className={`w-5 h-5 ${role === 'organization' ? 'text-amber-400' : 'text-slate-500'}`} />
                    {role === 'organization' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="font-bold text-sm">Recruteur</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Je publie des offres</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Champ Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full bg-slate-900/90 text-white pl-11 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-600 text-sm"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="w-full bg-slate-900/90 text-white pl-11 pr-11 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-600 text-sm"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    aria-label="Afficher ou masquer le mot de passe"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Doit contenir au moins 8 caractères.</p>
              </div>

              {/* Bouton Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Créer mon compte</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Lien de connexion */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Vous avez déjà un compte ?{' '}
                <Link 
                  to="/login" 
                  className="text-amber-400 hover:text-amber-300 font-semibold hover:underline transition-all"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Terms */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="#" className="underline hover:text-slate-400 transition-colors">Conditions d'utilisation</a>{' '}
                et notre{' '}
                <a href="#" className="underline hover:text-slate-400 transition-colors">Politique de confidentialité</a>.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;