import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { 
  Menu, 
  X, 
  Briefcase, 
  User, 
  LogOut, 
  Bell,
  Home,
  Search,
  ChevronDown,
  Building2,
  Users,
  Settings,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermeture du dropdown lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermeture des menus lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'candidate':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">Candidat</span>;
      case 'organization':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">Recruteur</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">Admin</span>;
      default:
        return null;
    }
  };

  const navItems = () => {
    const items: { label: string; path: string; icon: React.ReactNode }[] = [];

    if (isAuthenticated) {
      switch (user?.role) {
        case 'candidate':
          items.push(
            { label: 'Accueil', path: '/', icon: <Home size={18} /> },
            { label: 'Offres d\'emploi', path: '/opportunities', icon: <Search size={18} /> },
            { label: 'Mes candidatures', path: '/applications', icon: <FileText size={18} /> },
          );
          break;
        case 'organization':
          items.push(
            { label: 'Tableau de bord', path: '/', icon: <Home size={18} /> },
            { label: 'Nos offres', path: '/organization/opportunities', icon: <Briefcase size={18} /> },
            { label: 'Espace Entreprise', path: '/organization', icon: <Building2 size={18} /> },
          );
          break;
        case 'admin':
          items.push(
            { label: 'Dashboard', path: '/admin', icon: <Settings size={18} /> },
            { label: 'Utilisateurs', path: '/admin/users', icon: <Users size={18} /> },
            { label: 'Organisations', path: '/admin/organizations', icon: <Building2 size={18} /> },
          );
          break;
        default:
          items.push({ label: 'Accueil', path: '/', icon: <Home size={18} /> });
      }
    } else {
      items.push(
        { label: 'Accueil', path: '/', icon: <Home size={18} /> },
        { label: 'Trouver un emploi', path: '/opportunities', icon: <Search size={18} /> },
      );
    }

    return items;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-500 font-black text-base shadow-md group-hover:bg-amber-600 group-hover:text-white transition-all">
            OJ
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-amber-600 transition-colors">
              Optimum<span className="text-amber-600">Jobs</span>+
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase mt-0.5">
              Niger 🇳🇪
            </span>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <div className="hidden md:flex items-center gap-1.5">
          {navItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-amber-700 bg-amber-50/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-amber-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Actions & Profil */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button 
                aria-label="Notifications"
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-600 rounded-full ring-2 ring-white" />
              </button>

              {/* Menu Utilisateur */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden z-50"
                    >
                      <div className="px-3 py-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center justify-between">
                          {getRoleBadge(user?.role)}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to={user?.role === 'candidate' ? '/profile' : '/organization'}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={16} className="text-slate-400" />
                          Mon Profil
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut size={16} />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-slate-700 hover:text-slate-900 font-semibold"
              >
                Connexion
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-sm border-none"
              >
                S'inscrire
              </Button>
            </div>
          )}

          {/* Bouton Menu Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Off-canvas / Dropdown Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {navItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname === item.path
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/login')}
                    className="w-full justify-center border-slate-200 text-slate-700"
                  >
                    Connexion
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    className="w-full justify-center bg-amber-600 hover:bg-amber-700 text-white border-none"
                  >
                    S'inscrire
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};