import { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useLogout';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { 
  Home, 
  Briefcase, 
  User, 
  LogOut, 
  Building2,
  ShieldCheck,
  Menu,
  X,
  LogIn,
  UserPlus,
  FileText,
  PlusCircle,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
  Sparkles,
  Bell,
  Settings,
  HelpCircle,
  Award,
  Star,
  Zap,
  ChevronRight,
  Moon,
  Sun,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NetworkErrorHandler } from './NetworkErrorHandler';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

// ==========================================================
// ANIMATION VARIANTS
// ==========================================================

const fadeInDown = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const menuItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// ==========================================================
// COMPONENTS
// ==========================================================

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: isDark ? 0 : 180 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </motion.button>
  );
};

const NotificationBell = () => {
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300"
      >
        <Bell className="w-4 h-4" />
        {hasNotifications && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-950"
          >
            <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75" />
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Notifications</span>
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-white font-medium">Nouvelle offre publiée</p>
                  <p className="text-xs text-slate-400">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-white font-medium">Candidature acceptée</p>
                  <p className="text-xs text-slate-400">Il y a 5 heures</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-white font-medium">Offre expirée</p>
                  <p className="text-xs text-slate-400">Il y a 1 jour</p>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-800 text-center">
              <button className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Voir toutes les notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserMenu = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: User, label: 'Mon profil', to: '/profile' },
    { icon: Settings, label: 'Paramètres', to: '/settings' },
    { icon: HelpCircle, label: 'Aide', to: '/help' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-xl transition-all duration-300 group"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold group-hover:scale-110 transition-transform">
            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
        </div>
        <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">
          {user?.first_name || user?.email || 'Utilisateur'}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.first_name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || ''}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                </motion.div>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200 group"
                >
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  {item.label}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 ml-auto group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>

            <div className="p-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavLink = ({ to, icon: Icon, label, isActive, onClick }: any) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={to}
        onClick={onClick}
        className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
          isActive
            ? 'text-white bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 shadow-lg shadow-amber-500/5'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'} transition-colors`} />
        {label}
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  );
};

// ==========================================================
// MAIN COMPONENT
// ==========================================================

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuthStore();
  const { handleLogout } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useHeartbeat();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const getNavigationLinks = () => {
    if (!user) return [];

    const links = [];

    switch (user.role) {
      case 'admin':
        links.push(
          { to: '/admin/dashboard', icon: ShieldCheck, label: 'Dashboard' },
          { to: '/admin/profile', icon: User, label: 'Profil' }
        );
        break;

      case 'organization':
        links.push(
          { to: '/organization/dashboard', icon: Building2, label: 'Dashboard' },
          { to: '/jobs/create', icon: PlusCircle, label: 'Publier une offre' }
        );
        break;

      case 'candidate':
        links.push(
          { to: '/candidate/dashboard', icon: Home, label: 'Accueil' },
          { to: '/applications', icon: FileText, label: 'Mes candidatures' },
          { to: '/profile', icon: User, label: 'Mon profil' }
        );
        break;

      default:
        break;
    }

    return links;
  };

  const navigationLinks = getNavigationLinks();

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
    { name: 'X / Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
  ];

  const isActiveLink = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');
  
  // Vérifier si la page actuelle est la page d'accueil
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      <NetworkErrorHandler />

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 z-[100]"
        style={{ scaleX, transformOrigin: "0%" }}
      />

      {/* ========================================================== */}
      {/* NAVIGATION */}
      {/* ========================================================== */}
      
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to="/" 
                className="flex items-center gap-2.5 text-xl font-bold text-amber-400 hover:text-amber-300 transition-colors group"
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors"
                >
                  <Briefcase className="w-5 h-5 text-amber-400" />
                </motion.div>
                <span className="font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  OptimumJobs<span className="text-amber-400">+</span>
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 rounded-full"
                >
                  BETA
                </motion.span>
              </Link>
            </motion.div>

            {/* Links Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  isActive={isActiveLink(link.to)}
                />
              ))}
            </div>

            {/* Auth Actions Desktop */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />

              {user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/login"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 rounded-xl transition-all duration-300"
                    >
                      <LogIn className="w-4 h-4" />
                      Connexion
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        S'inscrire
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </Link>
                  </motion.div>
                </>
              )}

              {/* Mobile Menu Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors relative"
                aria-label="Menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-2xl overflow-hidden"
            >
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="px-4 py-4 space-y-2"
              >
                {user ? (
                  <>
                    <motion.div
                      variants={menuItemVariants}
                      className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl mb-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-bold">
                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.first_name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user?.email || ''}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center"
                      >
                        <Star className="w-3.5 h-3.5 text-emerald-400" />
                      </motion.div>
                    </motion.div>

                    {navigationLinks.map((link) => (
                      <motion.div
                        key={link.to}
                        variants={menuItemVariants}
                      >
                        <Link
                          to={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActiveLink(link.to)
                              ? 'text-white bg-amber-500/10 border border-amber-500/20'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <link.icon className={`w-4 h-4 ${isActiveLink(link.to) ? 'text-amber-400' : 'text-slate-400'}`} />
                          {link.label}
                          {isActiveLink(link.to) && (
                            <motion.div
                              layoutId="activeMobileNav"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}

                    <motion.div variants={menuItemVariants}>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={menuItemVariants}>
                      <Link
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                          location.pathname === '/' 
                            ? 'text-white bg-amber-500/10 border border-amber-500/20'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <Home className="w-4 h-4 text-amber-400" />
                        Accueil
                      </Link>
                    </motion.div>
                    <motion.div variants={menuItemVariants}>
                      <Link
                        to="/jobs"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        Offres
                      </Link>
                    </motion.div>
                    <motion.div variants={menuItemVariants}>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        Connexion
                      </Link>
                    </motion.div>
                    <motion.div variants={menuItemVariants}>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl transition-colors justify-center"
                      >
                        <UserPlus className="w-4 h-4" />
                        S'inscrire
                      </Link>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ========================================================== */}
      {/* MAIN CONTENT */}
      {/* ========================================================== */}
      
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1"
      >
        {children}
      </motion.main>

      {/* ========================================================== */}
      {/* FOOTER - UNIQUEMENT SUR LA PAGE D'ACCUEIL */}
      {/* ========================================================== */}
      
      {isHomePage && (
        <footer className="border-t border-slate-800/80 bg-slate-900/40 py-8 mt-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Brand & Rights */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="font-extrabold text-white">OptimumJobs+</span>
                </div>
                <span className="hidden sm:inline text-slate-700">•</span>
                <p className="text-xs text-slate-400">
                  &copy; {new Date().getFullYear()} OptimumJobs+. Tous droits réservés.
                </p>
                <span className="hidden sm:inline text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400/70">En ligne</span>
                </div>
              </motion.div>

              {/* Social Networks Icons */}
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {socialLinks.map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    whileHover={{ 
                      scale: 1.1, 
                      y: -2,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-slate-800 transition-all duration-300"
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </motion.div>

            </div>

            {/* Footer Links */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
              <span className="text-slate-800">•</span>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <span className="text-slate-800">•</span>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
              <span className="text-slate-800">•</span>
              <span className="text-slate-600">v1.0.0</span>
            </motion.div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;