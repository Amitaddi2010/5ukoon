import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";

export function useAdminGuard() {
  const [, setLocation] = useLocation();
  const { data, error, isLoading } = useGetAdminMe();

  useEffect(() => {
    if (!isLoading && error) {
      setLocation("/admin");
    }
  }, [error, isLoading, setLocation]);

  return { isAuthenticated: !!data, isLoading };
}
