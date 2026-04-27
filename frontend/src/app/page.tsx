'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Redirigir según rol
    switch (user.role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'docente':
        router.push('/docente');
        break;
      case 'estudiante':
        router.push('/estudiante');
        break;
      default:
        router.push('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="loading-container" style={{ minHeight: '100vh' }}>
      <div className="loading-spinner" />
    </div>
  );
}
