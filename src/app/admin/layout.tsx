'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import AdminSidebar from '@/components/admin/AdminSidebar';
import Loading from '@/components/Loading';
import { showToast, SUCCESS_TOAST } from '@/components/Toast';
import { getToken } from '@/lib/cookies';
import useAuthStore from '@/stores/useAuthStore';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const login = useAuthStore.useLogin();
  const logout = useAuthStore.useLogout();
  const stopLoading = useAuthStore.useStopLoading();
  const isAuthed = useAuthStore.useIsAuthed();
  const isLoading = useAuthStore.useIsLoading();
  const user = useAuthStore.useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const token = getToken();
    const storedUser = localStorage.getItem('user-jmmi');

    if (storedUser) {
      try {
        login(JSON.parse(storedUser));
      } catch {
        logout();
      }
    } else if (!token) {
      logout();
    }

    stopLoading();
  }, [isClient, login, logout, stopLoading]);

  useEffect(() => {
    if (isClient && !isLoading && !isAuthed) {
      router.replace('/login');
    }
  }, [isAuthed, isClient, isLoading, router]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', SUCCESS_TOAST);
    router.replace('/login');
  };

  if (!isClient || isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className='min-h-screen bg-slate-50 font-primary text-slate-800 lg:flex'>
      <AdminSidebar userName={user?.name} onLogout={handleLogout} />
      <main className='flex-1 px-4 py-8 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full'>{children}</main>
    </div>
  );
}