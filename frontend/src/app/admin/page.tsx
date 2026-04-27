'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Panel de Administración</h1>
        <p>Bienvenido, {user?.fullName}. Gestiona el sistema STIRE desde aquí.</p>
      </div>

      <div className="cards-grid">
        <Link href="/admin/usuarios" style={{ textDecoration: 'none' }}>
          <div className="card card-glow" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
            <div className="card-title">Gestionar Usuarios</div>
            <div className="card-content">
              Ver, crear y administrar usuarios del sistema (docentes, estudiantes, admins).
            </div>
          </div>
        </Link>

        <Link href="/admin/unidades" style={{ textDecoration: 'none' }}>
          <div className="card card-glow" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📘</div>
            <div className="card-title">Unidades de Aprendizaje</div>
            <div className="card-content">
              Administrar todas las unidades de aprendizaje del sistema.
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
