// src/pages/HomePage.tsx

import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  ArrowRight, Sparkles, ShieldCheck, Users, Zap,
  Star, TrendingUp, Building2, CheckCircle2, Briefcase,
  Rocket, Target, BarChart3, Award,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ==========================================================
// AVATARS TÉMOIGNAGES
// ==========================================================

const TESTIMONIALS = [
  {
    name: 'Amina Diallo',
    role: 'Développeuse Full-Stack',
    city: 'Niamey',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces&q=80',
    text: "J'ai trouvé un poste en 2 semaines. La plateforme est intuitive et les offres sont vraiment sérieuses.",
  },
  {
    name: 'Ibrahim Souley',
    role: 'Chef de projet',
    city: 'Zinder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&q=80',
    text: "Grâce à OptimaPlus-Jobs, je suis passé d'un petit boulot à un vrai poste de responsable.",
  },
  {
    name: 'Fatouma Amadou',
    role: 'Comptable',
    city: 'Maradi',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces&q=80',
    text: "Un service client réactif. J'ai été accompagnée à chaque étape de ma candidature.",
  },
];

const PARTNERS = ['TechCorp', 'Sahel Group', 'Niamey Digital', 'Africa Bank', 'Niger Telecom'];

// ==========================================================
// COMPOSANT — COMPTEUR ANIMÉ
// ==========================================================

const AnimatedCounter = ({ value, label, icon: Icon, duration = 2000 }: any) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const target = parseInt(value.replace(/\s/g, ''));
    let start = 0;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  const formatted = count.toLocaleString('fr-FR').replace(/,/g, ' ');

  return (
    <div ref={ref} className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(22,163,74,0.15)]">
        <Icon className="w-6 h-6 text-[#16A34A]" />
      </div>
      <div className="min-w-0">
        <div className="text-3xl sm:text-4xl font-extrabold text-[#14532D] tracking-tight leading-none tabular-nums">
          {formatted}
        </div>
        <div className="text-xs text-[#14532D]/60 mt-1.5 uppercase tracking-wider font-semibold">
          {label}
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// COMPOSANT — HERO DÉCORATION GÉOMÉTRIQUE
// ==========================================================

const GeometricDecoration = () => (
  <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">

    {/* Cercle plein vert clair en arrière-plan */}
    <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-[#16A34A]/5" />

    {/* 3 cercles concentriques */}
    <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full border-2 border-[#16A34A]/20 animate-[spin_40s_linear_infinite]" />
    <div className="absolute w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] rounded-full border-2 border-dashed border-[#FCD34D]/60 animate-[spin_30s_linear_infinite_reverse]" />
    <div className="absolute w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] rounded-full border-2 border-[#16A34A]/30" />

    {/* Hexagone ambre central */}
    <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center animate-float">
      <div
        className="w-full h-full bg-gradient-to-br from-[#16A34A] to-[#15803D] shadow-[0_20px_40px_-10px_rgba(22,163,74,0.4)]"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-white" strokeWidth={2} />
        </div>
      </div>
    </div>

    {/* Badge flottant — Note */}
    <div className="absolute top-8 right-4 sm:top-12 sm:right-12 bg-white rounded-xl p-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.1)] border border-[#16A34A]/10 flex items-center gap-2 z-20 animate-float" style={{ animationDelay: '0.5s' }}>
      <div className="w-9 h-9 rounded-lg bg-[#FCD34D] flex items-center justify-center shrink-0">
        <Star className="w-4 h-4 text-[#14532D] fill-current" />
      </div>
      <div>
        <p className="text-xs font-extrabold text-[#14532D] leading-none">4.9/5</p>
        <p className="text-[10px] text-[#14532D]/60 leading-none mt-1">2 500 avis</p>
      </div>
    </div>

    {/* Badge flottant — Candidats */}
    <div className="absolute bottom-12 left-4 sm:bottom-20 sm:left-8 bg-white rounded-xl p-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.1)] border border-[#16A34A]/10 flex items-center gap-2 z-20 animate-float" style={{ animationDelay: '1s' }}>
      <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0">
        <Users className="w-4 h-4 text-[#16A34A]" />
      </div>
      <div>
        <p className="text-xs font-extrabold text-[#14532D] leading-none">+2500</p>
        <p className="text-[10px] text-[#14532D]/60 leading-none mt-1">Candidats</p>
      </div>
    </div>

    {/* Badge flottant — Entreprises */}
    <div className="absolute top-1/2 -right-2 sm:-right-4 bg-white rounded-xl p-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.1)] border border-[#16A34A]/10 flex items-center gap-2 z-20 animate-float" style={{ animationDelay: '1.5s' }}>
      <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0">
        <Building2 className="w-4 h-4 text-[#16A34A]" />
      </div>
      <div>
        <p className="text-xs font-extrabold text-[#14532D] leading-none">+500</p>
        <p className="text-[10px] text-[#14532D]/60 leading-none mt-1">Entreprises</p>
      </div>
    </div>

    {/* Petits points décoratifs */}
    <div className="absolute top-16 left-8 w-3 h-3 rounded-full bg-[#FCD34D]/60" />
    <div className="absolute bottom-24 right-16 w-2 h-2 rounded-full bg-[#16A34A]/40" />
    <div className="absolute top-1/3 left-4 w-2 h-2 rounded-full bg-[#FCD34D]/40" />
  </div>
);

// ==========================================================
// MAIN COMPONENT
// ==========================================================

export const HomePage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const map = {
        admin: '/admin/dashboard',
        organization: '/organization/dashboard',
        candidate: '/candidate/dashboard',
      };
      navigate(map[user.role as keyof typeof map] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div>

      {/* ==========================================================
          SECTION 1 — HERO ABSTRAIT
         ========================================================== */}

      <section className="bg-[#F0FDF4] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-soft opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#FCD34D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Texte gauche — 55% */}
            <div className="lg:col-span-7">
              {/* Badge discret */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#16A34A]/15 rounded-full mb-6 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                </span>
                <span className="text-xs font-bold text-[#14532D]">
                  500+ nouvelles offres ce mois-ci
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#14532D] leading-[1.05] tracking-tight">
                Trouvez votre
                <br />
                prochaine opportunité
                <br />
                <span className="relative inline-block">
                  <span className="text-[#16A34A]">
                    au Niger.
                  </span>
                  <span className="absolute bottom-1 left-0 right-0 h-2 bg-[#FCD34D] -z-10 rounded-sm" />
                </span>
              </h1>

              <p className="mt-7 text-base sm:text-lg text-[#14532D]/70 leading-relaxed max-w-xl">
                La plateforme qui connecte les meilleurs talents
                aux entreprises qui recrutent, partout au Niger.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={isAuthenticated ? '/candidate/dashboard' : '/register'}
                  className="group inline-flex items-center gap-2 px-6 py-4 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#15803D] shadow-[0_8px_24px_-6px_rgba(22,163,74,0.4)] hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.5)] hover:-translate-y-1 transition-all duration-300"
                >
                  {isAuthenticated ? 'Mon espace' : "S'inscrire gratuitement"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 px-6 py-4 text-[#16A34A] text-sm font-bold rounded-xl bg-white border-2 border-[#16A34A]/20 hover:border-[#16A34A] hover:bg-[#F0FDF4] transition-all duration-200"
                >
                  Voir les offres
                </Link>
              </div>

              {/* Trust inline */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#14532D]/70">
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  </div>
                  Offres vérifiées
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  </div>
                  Inscription gratuite
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  </div>
                  Support 24/7
                </span>
              </div>
            </div>

            {/* Décoration abstraite droite — 45% */}
            <div className="lg:col-span-5 hidden lg:block">
              <GeometricDecoration />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 2 — PARTENAIRES
         ========================================================== */}

      <section className="py-14 bg-white border-b border-[#16A34A]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-[#14532D]/40 uppercase tracking-wider mb-8">
            Ils nous font confiance
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {PARTNERS.map((p) => (
              <div key={p} className="text-[#14532D] text-base sm:text-lg font-bold tracking-tight hover:opacity-100 transition-opacity">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 3 — 3 CARTES FEATURES SIGNATURE
         ========================================================== */}

      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14532D] tracking-tight leading-tight">
              Gérez toute votre carrière
              <br />
              <span className="text-[#14532D]/50">sur une seule plateforme</span>
            </h2>
            <p className="mt-5 text-base text-[#14532D]/60 max-w-xl mx-auto">
              Une solution complète pour les candidats et les recruteurs au Niger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Carte 1 — Candidats */}
            <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#16A34A]/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:border-[#16A34A]/20">
              <div className="h-1 bg-[#16A34A]" />
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center mb-5 shadow-[0_8px_16px_-4px_rgba(22,163,74,0.3)] group-hover:scale-105 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-[#14532D] mb-3">
                  Candidats
                </h3>
                <p className="text-sm text-[#14532D]/60 leading-relaxed mb-6">
                  Créez votre profil, trouvez les offres qui vous correspondent
                  et postulez en un clic.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] group-hover:gap-3 transition-all"
                >
                  Créer mon profil
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Carte 2 — Entreprises (Populaire) */}
            <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#FCD34D]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(252,211,77,0.25)]">
              <div className="h-1 bg-[#FCD34D]" />
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-[#FCD34D] text-[#14532D] text-[10px] font-bold rounded-full">
                POPULAIRE
              </div>
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FCD34D] to-[#EAB308] flex items-center justify-center mb-5 shadow-[0_8px_16px_-4px_rgba(252,211,77,0.4)] group-hover:scale-105 transition-transform">
                  <Building2 className="w-7 h-7 text-[#14532D]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#14532D] mb-3">
                  Entreprises
                </h3>
                <p className="text-sm text-[#14532D]/60 leading-relaxed mb-6">
                  Publiez vos offres, gérez vos candidatures et trouvez
                  les talents qui feront grandir votre équipe.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#14532D] group-hover:gap-3 transition-all"
                >
                  Espace recruteur
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Carte 3 — Statistiques */}
            <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#16A34A]/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:border-[#16A34A]/20">
              <div className="h-1 bg-[#16A34A]" />
              <div className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center mb-5 shadow-[0_8px_16px_-4px_rgba(22,163,74,0.3)] group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-[#14532D] mb-3">
                  Statistiques
                </h3>
                <p className="text-sm text-[#14532D]/60 leading-relaxed mb-6">
                  Suivez en temps réel l'état de vos candidatures et recevez
                  des notifications à chaque étape.
                </p>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] group-hover:gap-3 transition-all"
                >
                  Voir les offres
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 4 — COMMENT ÇA MARCHE (3 étapes)
         ========================================================== */}

      <section className="py-20 sm:py-28 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16A34A]/10 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                Simple et rapide
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14532D] tracking-tight">
              Comment ça marche ?
            </h2>
            <p className="mt-5 text-base text-[#14532D]/60">
              3 étapes suffisent pour décrocher votre prochain emploi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

            {[
              { num: '01', icon: Users, title: 'Créez votre profil', desc: 'Inscription gratuite en moins de 2 minutes.' },
              { num: '02', icon: Target, title: 'Trouvez les offres', desc: 'Filtrez par ville, secteur et type de contrat.' },
              { num: '03', icon: Rocket, title: 'Postulez et décrochez', desc: 'Suivez vos candidatures et recevez des réponses.' },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                {/* Ligne de connexion (desktop) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#16A34A]/30 to-[#16A34A]/5" />
                )}

                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#16A34A]/15 flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(22,163,74,0.2)] relative z-10">
                    <step.icon className="w-8 h-8 text-[#16A34A]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#FCD34D] flex items-center justify-center text-xs font-extrabold text-[#14532D] border-2 border-white shadow-md z-20">
                    {step.num}
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-[#14532D] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#14532D]/60 max-w-xs mx-auto leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 5 — STATS XXL avec compteurs animés
         ========================================================== */}

      <section className="py-20 sm:py-28 bg-[#F0FDF4] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-soft opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#16A34A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14532D] tracking-tight">
              OptimaPlus-Jobs en chiffres
            </h2>
            <p className="mt-4 text-base text-[#14532D]/60">
              La plateforme de référence pour l'emploi au Niger.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">

            <AnimatedCounter value="2245341" label="Membres actifs" icon={Users} />
            <AnimatedCounter value="46328" label="Entreprises" icon={Building2} />
            <AnimatedCounter value="845341" label="Candidatures" icon={Briefcase} />
            <AnimatedCounter value="1926436" label="Recrutements" icon={Award} />
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 6 — TÉMOIGNAGES
         ========================================================== */}

      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FCD34D]/20 rounded-full mb-4">
              <Star className="w-3.5 h-3.5 text-[#B88400] fill-current" />
              <span className="text-xs font-bold text-[#7A5800] uppercase tracking-wider">
                Témoignages
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14532D] tracking-tight">
              Ils ont trouvé leur job
            </h2>
            <p className="mt-5 text-base text-[#14532D]/60">
              Des milliers de professionnels nous font confiance au Niger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl border border-[#16A34A]/10 p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] hover:border-[#16A34A]/20"
              >
                {/* Bordure gauche verte */}
                <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#16A34A] rounded-r" />

                {/* Étoiles */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, k) => (
                    <Star key={k} className="w-4 h-4 text-[#FCD34D] fill-current" />
                  ))}
                </div>

                {/* Texte */}
                <p className="text-sm text-[#14532D]/75 leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>

                {/* Auteur */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#16A34A]/10">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-[#16A34A]/10"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#14532D] truncate">{t.name}</p>
                    <p className="text-xs text-[#14532D]/60 truncate">
                      {t.role} • {t.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 7 — CTA FINAL (gradient vert + formes abstraites)
         ========================================================== */}

      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#14532D] overflow-hidden px-8 sm:px-12 lg:px-20 py-16 sm:py-20 text-center">

            {/* Formes abstraites */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FCD34D]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute top-8 left-12 w-16 h-16 rounded-2xl border-2 border-white/10 rotate-45" />
            <div className="absolute bottom-12 right-16 w-12 h-12 rounded-full border-2 border-[#FCD34D]/30" />
            <div className="absolute top-1/2 left-8 w-3 h-3 rounded-full bg-[#FCD34D]/60" />
            <div className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-white/40" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur rounded-full mb-6 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-[#FCD34D]" />
                <span className="text-xs font-bold text-white">
                  Rejoignez-nous
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
                Prêt à décoller ?
              </h2>
              <p className="mt-5 text-base sm:text-lg text-white/80 max-w-lg mx-auto">
                Rejoignez des milliers de professionnels qui ont déjà fait
                le choix d'OptimaPlus-Jobs au Niger.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to={isAuthenticated ? '/candidate/dashboard' : '/register'}
                  className="group inline-flex items-center gap-2 px-7 py-4 bg-white text-[#14532D] text-sm font-bold rounded-xl hover:bg-[#FCD34D] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300"
                >
                  {isAuthenticated ? 'Accéder à mon espace' : 'Démarrer maintenant'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 px-7 py-4 text-white text-sm font-bold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all duration-200"
                >
                  Voir les offres
                </Link>
              </div>

              {/* Trust */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FCD34D]" />
                  Inscription gratuite
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FCD34D]" />
                  Sans engagement
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FCD34D]" />
                  Accès immédiat
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;