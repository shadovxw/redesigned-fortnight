"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('echo_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('echo_token');
    router.push('/login');
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('echo_token');
    return token ? `Bearer ${token}` : '';
  };

  return { isAuthenticated, loading, logout, getAuthHeader };
}
