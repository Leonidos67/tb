import { useQuery } from "@tanstack/react-query";
import { getCurrentUserQueryFn } from "@/lib/api";

const useAuth = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["auth"],
    queryFn: getCurrentUserQueryFn,
    retry: false,
    refetchOnWindowFocus: false,
    // Only fetch if we have a token
    enabled: !!localStorage.getItem('authToken'),
  });

  const logout = () => {
    localStorage.removeItem('authToken');
    // Refetch to clear the user data
    refetch();
  };

  return {
    data,
    isLoading,
    error,
    logout,
    refetch,
    isAuthenticated: !!localStorage.getItem('authToken') && !!data?.user,
  };
};

export default useAuth;
