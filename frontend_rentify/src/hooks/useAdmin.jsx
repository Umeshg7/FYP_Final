// useAdmin.js
import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { 
    data: isAdmin = false, 
    isLoading: isAdminLoading,
    error
  } = useQuery({
    queryKey: ['adminStatus', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return false;
      try {
        const res = await axiosSecure.get(`/users/${user.uid}/admin`);
        return res.data?.isAdmin || false;
      } catch (err) {
        console.error('Admin check failed:', err);
        return false;
      }
    },
    enabled: !!user?.uid && !authLoading
  });

  return [isAdmin, isAdminLoading || authLoading, error];
};

export default useAdmin;