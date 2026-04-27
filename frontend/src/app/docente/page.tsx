'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { classApi } from '@/lib/api';
import Link from 'next/link';

export default function DocenteDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classApi.getMyClasses();
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>¡Bienvenido, {user?.fullName?.split(' ')[0]}! 🎓</h1>
        <p>Panel de gestión docente — Fundamentos de Algoritmia</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-value">{classes.length}</div>
          <div className="stat-label">Mis Clases</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Total Estudiantes</div>
        </div>
      </div>

      <div className="cards-grid" style={{ marginBottom: '2rem' }}>
        <Link href="/docente/clases" style={{ textDecoration: 'none' }}>
          <div className="card card-glow" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏫</div>
            <div className="card-title">Gestionar Clases</div>
            <div className="card-content">
              Crea clases, agrega estudiantes y gestiona tus cursos.
            </div>
          </div>
        </Link>

        <Link href="/docente/unidades" style={{ textDecoration: 'none' }}>
          <div className="card card-glow" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📘</div>
            <div className="card-title">Unidades de Aprendizaje</div>
            <div className="card-content">
              Crea y administra las unidades de aprendizaje para tus estudiantes.
            </div>
          </div>
        </Link>

        <Link href="/docente/mensajes" style={{ textDecoration: 'none' }}>
          <div className="card card-glow" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💬</div>
            <div className="card-title">Mensajes</div>
            <div className="card-content">
              Comunícate con tus estudiantes y brinda apoyo personalizado.
            </div>
          </div>
        </Link>
      </div>

      {/* Classes list */}
      {classes.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            🏫 Mis Clases
          </h2>
          <div className="cards-grid">
            {classes.map((cls: any) => (
              <Link key={cls.id} href={`/docente/clases/${cls.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-glow" style={{ cursor: 'pointer' }}>
                  <div className="card-header">
                    <span className="card-title">{cls.name}</span>
                    <span className="badge badge-primary">{cls.code}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {cls.description || 'Sin descripción'}
                  </p>
                  <div className="card-footer">
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      👥 {cls.students?.length || 0} estudiantes
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
