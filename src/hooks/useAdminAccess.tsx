import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useAdminAuth } from './useAdminAuth';
import { toast } from 'sonner';

export const useAdminAccess = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminAuth();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        // Not logged in, redirect to auth page
        toast.info('Please log in to access this page.');
        navigate('/auth');
      } else if (!isAdmin) {
        // Logged in but not admin, redirect to home
        toast.error('Access denied. You need administrator privileges to access this page.');
        navigate('/');
      }
    }
  }, [authLoading, roleLoading, user, isAdmin, navigate]);

  return { user, isAdmin, loading: authLoading || roleLoading };
};