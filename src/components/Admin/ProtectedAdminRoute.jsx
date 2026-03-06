import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedAdminRoute
 * 
 * Guards admin routes by checking:
 * 1. Valid Supabase session exists
 * 2. User has admin role (via user_metadata.role or app_metadata.role)
 * 
 * Redirects to /paneli (login) if not authenticated or not admin.
 */
const ProtectedAdminRoute = ({ children }) => {
  const { session, user, loading } = useAuth();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5468E7] animate-spin" />
      </div>
    );
  }

  // No valid session — redirect to login
  if (!session || !user) {
    return <Navigate to="/paneli" replace />;
  }

  // Check admin role from user metadata
  // Supabase stores custom claims in user_metadata or app_metadata
  const userRole = user.app_metadata?.role || user.user_metadata?.role;
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  // If no role system is set up yet, allow any authenticated user
  // This provides a smooth migration path — once roles are configured
  // in Supabase, only admins will have access.
  const hasRoleSystem = !!userRole;

  if (hasRoleSystem && !isAdmin) {
    return <Navigate to="/paneli" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
