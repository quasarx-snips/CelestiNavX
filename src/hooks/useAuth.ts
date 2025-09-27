// Authentication hook for CelestiNav - React adaptation of Replit Auth integration
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: 'include' // Include cookies for session
      });
      
      if (response.status === 401) {
        // User is not authenticated, return null
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Authentication check failed: ${response.status}`);
      }
      
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
    // Convenience methods
    login: () => {
      window.location.href = '/api/login';
    },
    logout: () => {
      window.location.href = '/api/logout';
    }
  };
}