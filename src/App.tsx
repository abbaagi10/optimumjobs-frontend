// src/App.tsx
// C:\optimumjobs-frontend\src\App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';

// Layouts & Guards
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

// Pages Publiques
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import JobListingsPage from './pages/JobListingsPage';
import { HomePage } from './pages/HomePage';
import JobDetailPage from './pages/JobDetailPage';

// Pages Candidat
import { CandidateDashboard } from './pages/CandidateDashboard';
import { CandidateApplicationsPage } from './pages/CandidateApplicationsPage';
import { CandidateProfilePage } from './pages/CandidateProfilePage';

// Pages Organisation
import { OrganizationDashboardPage } from './pages/OrganizationDashboardPage';
import { OrganizationCreatePage } from './pages/OrganizationCreatePage';
import { JobCreatePage } from './pages/JobCreatePage';
import OpportunityApplicationsPage from './pages/OpportunityApplicationsPage';
import OpportunityEditPage from './pages/OpportunityEditPage';

// Pages Admin
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProfilePage } from './pages/AdminProfilePage';
import AdminOpportunityDetailPage from './pages/AdminOpportunityDetailPage';

// Page Profil Public
import PublicProfilePage from './pages/PublicProfilePage';

export default function App() {
  const { checkAuth, isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      checkAuth();
      setIsInitialized(true);
    };
    initAuth();
  }, [checkAuth]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #1e293b',
          },
        }}
      />

      <Routes>
        {/* ==========================================================
            ROUTES PUBLIQUES - Accessibles à tous (connectés ou non)
        ========================================================== */}
        
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        
        <Route path="/jobs" element={
          <Layout>
            <JobListingsPage />
          </Layout>
        } />
        
        <Route path="/jobs/:id" element={
          <Layout>
            <JobDetailPage />
          </Layout>
        } />

        <Route path="/profile/:id" element={
          <Layout>
            <PublicProfilePage />
          </Layout>
        } />

        {/* ==========================================================
            ROUTES D'AUTHENTIFICATION - Redirigent vers dashboard si connecté
        ========================================================== */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ==========================================================
            ESPACE CANDIDAT
        ========================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
          <Route path="/candidate/dashboard" element={
            <Layout>
              <CandidateDashboard />
            </Layout>
          } />
          <Route path="/applications" element={
            <Layout>
              <CandidateApplicationsPage />
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout>
              <CandidateProfilePage />
            </Layout>
          } />
        </Route>

        {/* ==========================================================
            ESPACE ORGANISATION
        ========================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['organization']} />}>
          <Route path="/organization/dashboard" element={
            <Layout>
              <OrganizationDashboardPage />
            </Layout>
          } />
          <Route path="/organization/create" element={
            <Layout>
              <OrganizationCreatePage />
            </Layout>
          } />
          <Route path="/jobs/create" element={
            <Layout>
              <JobCreatePage />
            </Layout>
          } />
          <Route path="/organization/opportunities/:id" element={
            <Layout>
              <OpportunityApplicationsPage />
            </Layout>
          } />
          <Route path="/organization/opportunities/:id/edit" element={
            <Layout>
              <OpportunityEditPage />
            </Layout>
          } />
        </Route>

        {/* ==========================================================
            ESPACE ADMIN
        ========================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={
            <Layout>
              <AdminDashboardPage />
            </Layout>
          } />
          <Route path="/admin/profile" element={
            <Layout>
              <AdminProfilePage />
            </Layout>
          } />
          <Route path="/admin/opportunities/:id" element={
            <Layout>
              <AdminOpportunityDetailPage />
            </Layout>
          } />
        </Route>

        {/* ==========================================================
            REDIRECTION 404
        ========================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}