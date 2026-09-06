import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Briefcase, Building2, Users, ChevronRight, Sparkles, 
  ShieldCheck, Clock, ArrowUpRight, Search,
  Rocket, Zap, Star, Award, Globe, 
  TrendingUp, Target, ArrowRight, CheckCircle2,
  MapPin, Mail, ExternalLink, CircleDollarSign
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

// ==========================================================
// ANIMATION VARIANTS
// ==========================================================

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ==========================================================
// COMPONENTS
// ==========================================================

const FloatingParticles = () => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
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
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.2, 0.6, 0.2],
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

const AnimatedCounter = ({ value, label, icon: Icon, delay = 0 }: any) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const target = parseInt(value.replace('+', ''));
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.floor(target / (duration / 16)));

    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
      className="group bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1"
    >
      <div className="flex items-center gap-3 text-4xl font-black text-white">
        <Icon className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
        <span>{count}+</span>
      </div>
      <div className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-wider">{label}</div>
      <div className="mt-3 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-amber-500 to-transparent transition-all duration-700" />
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, index }: any) => (
  <motion.div
    variants={fadeInUp}
    custom={index}
    className="group relative bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 backdrop-blur-xl overflow-hidden"
  >
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:via-amber-500/10 group-hover:to-amber-500/5 transition-all duration-500" />
    
    {/* Glow orb */}
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />

    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/20">
        <Icon className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
        {desc}
      </p>

      <motion.div
        className="mt-6 pt-4 border-t border-slate-800/50 flex items-center gap-2 text-xs font-semibold text-amber-400"
        initial={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span>En savoir plus</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </motion.div>
    </div>
  </motion.div>
);

const RotatingBadge = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="inline-flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/5 backdrop-blur-xl hover:border-amber-500/50 transition-all cursor-default"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: 0.1 }}
        className="w-4 h-4"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
      </motion.div>
      <span className="text-xs font-semibold text-amber-300 tracking-wide">
        Plateforme de recrutement #1 en Afrique
      </span>
    </motion.div>
  );
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const HomePage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Scroll animations
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const featuresY = useTransform(scrollYProgress, [0.2, 0.5], [50, 0]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardMap = {
        admin: '/admin/dashboard',
        organization: '/organization/dashboard',
        candidate: '/candidate/dashboard',
      };
      const redirectPath = dashboardMap[user.role as keyof typeof dashboardMap] || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'organization': return '/organization/dashboard';
      case 'candidate': return '/candidate/dashboard';
      default: return '/';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePosition({ x, y });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* ========================================================== */}
      {/* HERO SECTION */}
      {/* ========================================================== */}
      
      <motion.section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
        className="relative pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Decorative lights with parallax */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: isHoveringHero ? 1.1 : 1,
            opacity: isHoveringHero ? 0.8 : 0.5,
          }}
          transition={{ duration: 0.5 }}
        />
        
        <motion.div
          className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />
        
        <motion.div
          className="absolute bottom-10 -left-40 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: -mousePosition.x * 15,
            y: -mousePosition.y * 15,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 50 }}
        />

        <FloatingParticles />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Badge Premium avec rotation */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="flex justify-center"
            >
              <RotatingBadge />
            </motion.div>

            {/* Titre Principal avec effet de texte */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]"
            >
              Trouvez l'opportunité qui{" "}
              <br className="hidden sm:inline" />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  transforme
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />
              </span>{" "}
              votre carrière
            </motion.h1>

            {/* Sous-titre avec apparition */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Connectez-vous aux meilleures entreprises et talents d'Afrique. Des milliers d'offres d'emploi, de stages et d'opportunités n'attendent que vous.
            </motion.p>

            {/* Boutons d'action */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/jobs"
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    <span>Voir les offres</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </Link>
              </motion.div>

              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    to={getDashboardLink()}
                    className="group w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all duration-300 border border-slate-800 hover:border-slate-700 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Accéder au dashboard
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/5"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    to="/register"
                    className="group w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-2xl transition-all duration-300 border border-slate-800 hover:border-slate-700 backdrop-blur-xl active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Créer un compte
                      <Rocket className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/5"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Statistiques clés animées */}
            <motion.div
              variants={fadeInUp}
              className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <AnimatedCounter value="10K+" label="Offres publiées" icon={Briefcase} delay={0.1} />
              <AnimatedCounter value="5K+" label="Candidats actifs" icon={Users} delay={0.2} />
              <AnimatedCounter value="1K+" label="Entreprises partenaires" icon={Building2} delay={0.3} />
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Offres vérifiées
              </span>
              <span className="w-px h-4 bg-slate-800" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Confiance & sécurité
              </span>
              <span className="w-px h-4 bg-slate-800" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Support 24/7
              </span>
            </motion.div>

          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================== */}
      {/* FEATURES SECTION */}
      {/* ========================================================== */}
      
      <motion.section 
        className="py-24 border-t border-slate-800/80 bg-slate-900/30 relative overflow-hidden"
        style={{ y: featuresY }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div 
              variants={fadeInUp}
              className="text-center max-w-2xl mx-auto space-y-3 mb-16"
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full"
                whileHover={{ scale: 1.02 }}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-400 tracking-wide">Pourquoi nous choisir</span>
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Pourquoi choisir{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                    OptimumJobs+
                  </span>
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    viewport={{ once: true }}
                  />
                </span>
                {" "}?
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Une écosystème sur-mesure conçu pour propulser les talents et simplifier les recrutements.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={ShieldCheck}
                title="Offres vérifiées"
                desc="Toutes nos annonces sont minutieusement modérées par nos équipes pour garantir des opportunités authentiques et de qualité."
                index={0}
              />
              <FeatureCard
                icon={Users}
                title="Réseau de talents"
                desc="Rejoignez un réseau dynamique de professionnels et d'entreprises leaders à travers tout le continent africain."
                index={1}
              />
              <FeatureCard
                icon={Clock}
                title="Suivi en temps réel"
                desc="Suivez facilement l'état de vos candidatures et recevez des notifications instantanées à chaque étape de votre processus."
                index={2}
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================== */}
      {/* CTA SECTION */}
      {/* ========================================================== */}
      
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 text-center relative z-10"
        >
          <motion.div
            className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 backdrop-blur-xl hover:border-amber-500/30 transition-all duration-500 shadow-2xl shadow-amber-500/5"
            whileHover={{ y: -4 }}
          >
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
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-2xl flex items-center justify-center border border-amber-500/30"
            >
              <Rocket className="w-8 h-8 text-amber-400" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Prêt à {""}
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                décoller
              </span>
              {" "}?
            </h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Rejoignez des milliers de professionnels qui ont déjà fait le choix d'OptimumJobs+.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                to={isAuthenticated ? getDashboardLink() : "/register"}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {isAuthenticated ? "Accéder au dashboard" : "Commencer maintenant"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </Link>
            </motion.div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Inscription gratuite
              </span>
              <span className="w-px h-4 bg-slate-800 hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Sans engagement
              </span>
              <span className="w-px h-4 bg-slate-800 hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Accès immédiat
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========================================================== */}
      {/* QUICK LINKS SECTION */}
      {/* ========================================================== */}
      
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-12 border-t border-slate-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Briefcase, label: "Toutes les offres", href: "/jobs" },
              { icon: Users, label: "Candidats", href: "/candidates" },
              { icon: Building2, label: "Entreprises", href: "/companies" },
              { icon: Target, label: "Carrières", href: "/careers" },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.href}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:border-amber-500/30 transition-all duration-300 group"
                >
                  <item.icon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

    </div>
  );
};

export default HomePage;