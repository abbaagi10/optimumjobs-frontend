import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Globe, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-base shadow-md">
                OJ
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Optimum<span className="text-amber-500">Jobs</span>+
              </span>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              La plateforme de référence dédiée à l'emploi, au recrutement et au développement des compétences au Niger et dans la sous-région.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-amber-500 shrink-0" />
                <span>Niamey, Quartier Plateau — Niger 🇳🇪</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-amber-500 shrink-0" />
                <a href="mailto:contact@optimumjobs.ne" className="hover:text-white transition-colors">
                  contact@optimumjobs.ne
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-amber-500 shrink-0" />
                <span>+227 20 00 00 00</span>
              </div>
            </div>
          </div>

          {/* Candidats */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">Candidats</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/opportunities" className="hover:text-amber-400 transition-colors">
                  Offres d'emploi
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-400 transition-colors">
                  Créer un profil
                </Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-amber-400 transition-colors">
                  Suivi des candidatures
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Conseils carrière
                </a>
              </li>
            </ul>
          </div>

          {/* Recruteurs */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">Recruteurs</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register?type=organization" className="hover:text-amber-400 transition-colors">
                  Publier une offre
                </Link>
              </li>
              <li>
                <Link to="/organization" className="hover:text-amber-400 transition-colors">
                  Espace Entreprise
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Base de CVs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Solutions RSE & ONG
                </a>
              </li>
            </ul>
          </div>

          {/* Informations Légales & Liens */}
          <div className="space-y-3">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider">À propos</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">
                  Qui sommes-nous ?
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">
                  Contactez-nous
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} OptimumJobs+ Niger. Tous droits réservés.</p>
          
          <div className="flex items-center gap-1">
            <span>Conçu avec passion à Niamey pour l'Afrique de l'Ouest</span>
          </div>
        </div>
      </div>
    </footer>
  );
};