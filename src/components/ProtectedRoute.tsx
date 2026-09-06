// src/components/ProtectedRoute.tsx
// C:\optimumjobs-frontend\src\components\ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '../api/organization';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: Array<'candidate' | 'organization' | 'admin'>;
}

export const ProtectedRoute = ({ allowedRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as any)) {
    const dashboardMap = {
      admin: '/admin/dashboard',
      organization: '/organization/dashboard',
      candidate: '/candidate/dashboard',
    };
    const redirectPath = dashboardMap[user.role as keyof typeof dashboardMap] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  if (user.role === 'organization') {
    const { data: orgs, isLoading: isOrgLoading } = useQuery({
      queryKey: ['myOrganizations'],
      queryFn: async () => {
        try {
          const response = await organizationApi.getMyOrganizations();
          let organizations = [];
          if (response.data && typeof response.data === 'object') {
            if ('results' in response.data) {
              organizations = response.data.results || [];
            } else if (Array.isArray(response.data)) {
              organizations = response.data;
            }
          }
          return organizations;
        } catch (error) {
          console.error('ProtectedRoute Erreur:', error);
          return [];
        }
      },
      enabled: user.role === 'organization',
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    });

    if (isOrgLoading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      );
    }

    const hasOrganization = orgs && orgs.length > 0;
    const isOnCreatePage = location.pathname === '/organization/create';
    const isOnDashboardPage = location.pathname === '/organization/dashboard';

    if (!hasOrganization && !isOnCreatePage) {
      return <Navigate to="/organization/create" replace />;
    }

    if (hasOrganization && isOnCreatePage) {
      return <Navigate to="/organization/dashboard" replace />;
    }

    return <Outlet />;
  }

  return <Outlet />;
};

export default ProtectedRoute;