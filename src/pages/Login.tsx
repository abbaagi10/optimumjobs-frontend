import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { 
  Eye, EyeOff, Loader2, Mail, Lock, Briefcase, 
  ArrowRight, ShieldCheck, CheckCircle2, Sparkles,
  Zap, Globe, Users, Building2, Rocket, Star,
  ChevronRight, Fingerprint, Key, Shield, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ==========================================================
// ANIMATION VARIANTS
// ==========================================================

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 }
};

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseGlow = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ==========================================================
// COMPONENTS
// ==========================================================

const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-400/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const AnimatedInput = ({ 
  icon: Icon, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  disabled,
  autoComplete,
  required,
  endAdornment 
}: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="space-y-1.5"
      variants={fadeInUp}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
          {label}
        </label>
      </div>
      <div className="relative group">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 rounded-xl transition-all duration-300 pointer-events-none"
          animate={{
            opacity: isFocused ? 0.1 : 0,
          }}
        />
        <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
          isFocused ? 'text-amber-400 scale-110' : 'text-slate-500'
        }`} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-slate-900/90 text-white pl-11 pr-11 py-3.5 rounded-xl border transition-all duration-300 placeholder:text-slate-600 text-sm focus:outline-none"
          style={{
            borderColor: isFocused ? 'rgba(251, 191, 36, 0.5)' : 'rgba(30, 41, 59, 0.8)',
            boxShadow: isFocused ? '0 0 0 3px rgba(251, 191, 36, 0.1)' : 'none',
          }}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
        />
        {endAdornment && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const FeatureItem = ({ icon: Icon, text, delay }: any) => (
  <motion.li
    variants={fadeInUp}
    custom={delay}
    className="flex items-center gap-3 text-xs text-slate-300 group"
  >
    <motion.div
      whileHover={{ scale: 1.2, rotate: 180 }}
      transition={{ duration: 0.3 }}
      className="w-5 h-5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors"
    >
      <Icon className="w-3 h-3 text-amber-400" />
    </motion.div>
    <span className="group-hover:text-white transition-colors">{text}</span>
  </motion.li>
);

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
  const [isHovering, setIsHovering] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePosition({ x, y });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center items-center relative overflow-hidden selection:bg-amber-500 selection:text-slate-950 p-4">
      
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-5" />
      
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: mousePosition.x * 20,
          y: mousePosition.y * 20,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 50 }}
      />
      
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: -mousePosition.x * 15,
          y: -mousePosition.y * 15,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 50 }}
      />

      <FloatingParticles />

      {/* Main Container */}
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 min-h-[700px] rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-2xl shadow-2xl shadow-slate-950/50 overflow-hidden relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        
        {/* ========================================================== */}
        {/* LEFT PANEL - HERO SECTION */}
        {/* ========================================================== */}
        
        <motion.div 
          className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/60"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Background grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          
          {/* Animated glow orb */}
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"
            animate={pulseGlow.animate}
          />

          {/* Brand Header */}
          <div className="relative z-10">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/" className="inline-flex items-center gap-3 group">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-amber-400" />
                  </div>
                </motion.div>
                <span className="text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Optimum<span className="text-amber-400">Jobs+</span>
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="px-2 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 rounded-full"
                >
                  PRO
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              className="mt-2 flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400/70 font-medium">Connexion sécurisée</span>
            </motion.div>
          </div>

          {/* Content */}
          <motion.div 
            className="relative z-10 my-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full mb-4">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-400 tracking-wider">PLATEFORME PREMIUM</span>
              </div>
            </motion.div>

            <motion.h2 
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-extrabold text-white leading-tight"
            >
              Propulsez votre <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                carrière professionnelle.
              </span>
            </motion.h2>

            <motion.p 
              variants={fadeInUp}
              className="mt-4 text-slate-400 text-sm leading-relaxed"
            >
              Accédez aux meilleures opportunités de recrutement et développez votre réseau avec notre écosystème intelligent.
            </motion.p>

            <motion.ul 
              variants={staggerContainer}
              className="mt-6 space-y-3"
            >
              <FeatureItem icon={CheckCircle2} text="Accès exclusif aux offres qualifiées" delay={0.3} />
              <FeatureItem icon={CheckCircle2} text="Gestion de profil simplifiée" delay={0.4} />
              <FeatureItem icon={CheckCircle2} text="Tableau de bord haute performance" delay={0.5} />
            </motion.ul>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="relative z-10 pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400/80" />
              </motion.div>
              <span>Connexion sécurisée SSL</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Afrique
              </span>
              <span>© 2026</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ========================================================== */}
        {/* RIGHT PANEL - LOGIN FORM */}
        {/* ========================================================== */}
        
        <motion.div 
          className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-950/40"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div 
            className="max-w-md w-full mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            
            {/* Header */}
            <motion.div 
              variants={fadeInUp}
              className="mb-8"
            >
              <motion.div
                className="flex items-center gap-2 mb-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400/70 tracking-wider">ESPACE MEMBRE</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Bienvenue sur votre <br />
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  espace sécurisé
                </span>
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Entrez vos identifiants pour accéder à votre tableau de bord.
              </p>
            </motion.div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleLogin} className="space-y-5">
              <AnimatedInput
                icon={Mail}
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                disabled={isLoading}
                autoComplete="email"
                required
              />

              <AnimatedInput
                icon={Lock}
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                autoComplete="current-password"
                required
                endAdornment={
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    aria-label="Afficher ou masquer le mot de passe"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                }
              />

              {/* Forgot password link */}
              <motion.div 
                variants={fadeInUp}
                className="flex justify-end"
              >
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-all hover:underline flex items-center gap-1 group"
                >
                  <Key className="w-3 h-3" />
                  Mot de passe oublié ?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-4 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connexion en cours...</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-4 h-4" />
                        <span>Se connecter</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </button>
              </motion.div>
            </form>

            {/* Register link */}
            <motion.div 
              variants={fadeInUp}
              className="mt-8 text-center"
            >
              <p className="text-sm text-slate-400">
                Vous n'avez pas de compte ?{' '}
                <Link 
                  to="/register" 
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-all hover:underline inline-flex items-center gap-1 group"
                >
                  S'inscrire
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </p>
            </motion.div>

            {/* Terms */}
            <motion.div 
              variants={fadeInUp}
              className="mt-8 pt-6 border-t border-slate-800/80 text-center"
            >
              <p className="text-xs text-slate-500 leading-relaxed">
                En continuant, vous acceptez nos{' '}
                <a href="#" className="text-amber-400/70 hover:text-amber-400 transition-colors hover:underline">
                  Conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-amber-400/70 hover:text-amber-400 transition-colors hover:underline">
                  Politique de confidentialité
                </a>.
              </p>
              <motion.div
                className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Chiffré SSL
                </span>
                <span className="w-px h-3 bg-slate-800" />
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Sécurisé
                </span>
              </motion.div>
            </motion.div>

          </motion.div>
        </motion.div>

      </motion.div>

      {/* Floating decorative elements */}
      <motion.div
        className="fixed bottom-8 right-8 flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 px-4 py-2 rounded-full shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </motion.div>
        <span className="text-xs text-slate-400 font-medium">Système en ligne</span>
        <span className="text-xs text-slate-600">•</span>
        <span className="text-xs text-slate-500">v3.0</span>
      </motion.div>

    </div>
  );
};

export default Login;