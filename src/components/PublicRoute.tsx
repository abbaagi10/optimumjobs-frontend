// src/components/PublicRoute.tsx


import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

export const PublicRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const dashboardMap = {
      admin: '/admin/dashboard',
      organization: '/organization/dashboard',
      candidate: '/candidate/dashboard',
    };
    const redirectPath = dashboardMap[user.role as keyof typeof dashboardMap] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;