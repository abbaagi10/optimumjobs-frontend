// src/components/Layout.tsx

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useLogout';
import { useHeartbeat } from '../hooks/useHeartbeat';
import {
  Home, Briefcase, User, LogOut, Building2, ShieldCheck,
  Menu, X, LogIn, UserPlus, FileText, PlusCircle,
  Linkedin, Twitter, Facebook, Instagram, Youtube,
  ChevronDown, Bell, Settings, HelpCircle, Search,
} from 'lucide-react';
import { NetworkErrorHandler } from './NetworkErrorHandler';

// ==========================================================
// TOP BAR
// ==========================================================

const TopBar = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-[#14532D] text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center relative">
        <p className="text-center font-medium text-xs sm:text-sm">
          🎉 <strong className="text-[#FCD34D]">500 nouvelles offres</strong> publiées ce mois-ci.{' '}
          <a href="#" className="underline font-semibold hover:text-[#FCD34D] transition-colors">
            Découvrez-les
          </a>
        </p>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ==========================================================
// NOTIFICATION BELL
// ==========================================================

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#14532D]/70 hover:text-[#16A34A] rounded-lg hover:bg-[#F0FDF4] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FCD34D] rounded-full ring-2 ring-white" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#16A34A]/10 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-[#16A34A]/10">
            <span className="text-sm font-bold text-[#14532D]">Notifications</span>
          </div>
          <div className="p-6 text-center text-sm text-[#14532D]/60">Aucune notification.</div>
        </div>
      )}
    </div>
  );
};

// ==========================================================
// USER MENU
// ==========================================================

const UserMenu = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const items = [
    { icon: User, label: 'Mon profil', to: '/profile' },
    { icon: Settings, label: 'Paramètres', to: '/settings' },
    { icon: HelpCircle, label: 'Aide', to: '/help' },
  ];

  const initials = (user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-[#F0FDF4] transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <ChevronDown className="w-4 h-4 text-[#14532D]/60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-[#16A34A]/10 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b border-[#16A34A]/10">
            <p className="text-sm font-bold text-[#14532D] truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Utilisateur'}
            </p>
            <p className="text-xs text-[#14532D]/60 truncate mt-0.5">{user?.email}</p>
          </div>
          <div className="py-1">
            {items.map((it) => (
              <Link
                key={it.label}
                to={it.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#14532D]/80 hover:bg-[#F0FDF4] transition-colors"
              >
                <it.icon className="w-4 h-4 text-[#16A34A]" />
                {it.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-[#16A34A]/10 py-1">
            <button
              onClick={() => { setIsOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#14532D]/80 hover:bg-[#F0FDF4] transition-colors"
            >
              <LogOut className="w-4 h-4 text-[#16A34A]" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================================
// FOOTER
// ==========================================================

const Footer = () => {
  const socials = [
    { icon: Linkedin, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Facebook, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Youtube, href: '#' },
  ];

  return (
    <footer className="bg-[#14532D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#FCD34D] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#14532D]" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-white tracking-tight">
                OptimaPlus-Jobs
              </span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              La plateforme qui connecte les talents aux entreprises qui recrutent au Niger.
            </p>
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} OptimaPlus-Jobs.
              <br />Tous droits réservés.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-5">Candidats</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-white/70 hover:text-[#FCD34D] transition-colors">Rechercher un emploi</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-[#FCD34D] transition-colors">Créer mon profil</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-[#FCD34D] transition-colors">Mes candidatures</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-[#FCD34D] transition-colors">Conseils carrière</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-5">Recruteurs</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-white/70 hover:text-[#FCD34D] transition-colors">Publier une offre</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-[#FCD34D] transition-colors">Gérer mes annonces</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-[#FCD34D] transition-colors">Consulter les candidats</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-[#FCD34D] transition-colors">Solutions entreprise</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-5">Restez informé</h4>
            <div className="flex items-center bg-white/10 rounded-lg p-1 focus-within:ring-2 focus-within:ring-[#FCD34D]/50 transition-all">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none"
              />
              <button className="bg-[#FCD34D] text-[#14532D] text-xs font-bold px-4 py-2 rounded-md transition-colors hover:bg-white">
                OK
              </button>
            </div>

            <div className="flex items-center gap-2 mt-5">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FCD34D] hover:text-[#14532D] flex items-center justify-center transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ==========================================================
// MAIN LAYOUT
// ==========================================================

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuthStore();
  const { handleLogout } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  useHeartbeat();

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const navLinks = () => {
    if (!user) return [];
    const links = [];
    if (user.role === 'admin') {
      links.push(
        { to: '/admin/dashboard', icon: ShieldCheck, label: 'Dashboard' },
        { to: '/admin/profile', icon: User, label: 'Profil' }
      );
    } else if (user.role === 'organization') {
      links.push(
        { to: '/organization/dashboard', icon: Building2, label: 'Dashboard' },
        { to: '/jobs/create', icon: PlusCircle, label: 'Publier' }
      );
    } else if (user.role === 'candidate') {
      links.push(
        { to: '/candidate/dashboard', icon: Home, label: 'Accueil' },
        { to: '/applications', icon: FileText, label: 'Candidatures' },
        { to: '/profile', icon: User, label: 'Profil' }
      );
    }
    return links;
  };

  const navigation = navLinks();
  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col overflow-x-hidden">
      <NetworkErrorHandler />

      <TopBar />

      {/* HEADER v3 — avec indicateur actif + logo retravaillé */}
      <header
        className={`sticky top-0 z-50 bg-white/90 backdrop-blur-lg transition-all duration-300 ${
          isScrolled ? 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_-8px_rgba(22,163,74,0.08)] border-b border-[#16A34A]/5' : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo avec badge vert */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)] group-hover:scale-105 group-hover:shadow-[0_6px_16px_-2px_rgba(22,163,74,0.4)] transition-all duration-300">
                  <Briefcase className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FCD34D] rounded-full border-2 border-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-extrabold text-[#14532D] tracking-tight">
                  OptimaPlus<span className="text-[#FCD34D]">-Jobs</span>
                </span>
                <span className="text-[9px] font-semibold text-[#16A34A] tracking-wider uppercase mt-0.5">
                  Niger
                </span>
              </div>
            </Link>

            {/* Navigation desktop */}
            <nav className="hidden md:flex items-center gap-0.5 ml-6">
              {navigation.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive(link.to)
                      ? 'text-[#16A34A] bg-[#F0FDF4]'
                      : 'text-[#14532D]/70 hover:text-[#16A34A] hover:bg-[#F0FDF4]'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#16A34A] rounded-full" />
                  )}
                </Link>
              ))}

              {!user && (
                <>
                  <Link
                    to="/jobs"
                    className="relative flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#14532D]/70 hover:text-[#16A34A] hover:bg-[#F0FDF4] rounded-lg transition-all duration-200"
                  >
                    Offres
                  </Link>
                  <Link
                    to="/companies"
                    className="relative flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#14532D]/70 hover:text-[#16A34A] hover:bg-[#F0FDF4] rounded-lg transition-all duration-200"
                  >
                    Entreprises
                  </Link>
                </>
              )}
            </nav>

            {/* Actions droite */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  <NotificationBell />
                  <UserMenu user={user} onLogout={handleLogout} />
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-[#14532D]/80 hover:text-[#16A34A] transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold bg-[#16A34A] text-white rounded-lg hover:bg-[#15803D] shadow-[0_2px_8px_-2px_rgba(22,163,74,0.4)] hover:shadow-[0_4px_12px_-2px_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    S'inscrire
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </Link>
                </>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[#14532D]/70 hover:text-[#16A34A] rounded-lg hover:bg-[#F0FDF4] transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#16A34A]/10 bg-white">
            <div className="px-4 py-3 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 border-b border-[#16A34A]/10 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-sm font-bold">
                      {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#14532D] truncate">
                        {user?.first_name || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-[#14532D]/60 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {navigation.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                        isActive(link.to)
                          ? 'text-[#16A34A] bg-[#F0FDF4]'
                          : 'text-[#14532D]/70 hover:bg-[#F0FDF4]'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#14532D]/70 hover:bg-[#F0FDF4] rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-[#16A34A]" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/jobs" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#14532D]/70 hover:bg-[#F0FDF4] rounded-lg">
                    <Briefcase className="w-4 h-4" />
                    Offres
                  </Link>
                  <Link to="/companies" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#14532D]/70 hover:bg-[#F0FDF4] rounded-lg">
                    <Building2 className="w-4 h-4" />
                    Entreprises
                  </Link>
                  <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#14532D]/70 hover:bg-[#F0FDF4] rounded-lg">
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold bg-[#16A34A] text-white rounded-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      {isHomePage && <Footer />}
    </div>
  );
};

export default Layout;