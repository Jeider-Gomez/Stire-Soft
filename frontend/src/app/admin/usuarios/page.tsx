'use client';

import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api';

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await userApi.remove(id);
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRole = async (id: number, currentRole: string) => {
    const roles = ['estudiante', 'docente', 'admin'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    try {
      await userApi.update(id, { role: nextRole });
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  const admins = users.filter((u) => u.role === 'admin');
  const docentes = users.filter((u) => u.role === 'docente');
  const estudiantes = users.filter((u) => u.role === 'estudiante');

  return (
    <div>
      <div className="page-header">
        <h1>👥 Gestión de Usuarios</h1>
        <p>Administra todos los usuarios del sistema</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Usuarios</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-value">{docentes.length}</div>
          <div className="stat-label">Docentes</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{estudiantes.length}</div>
          <div className="stat-label">Estudiantes</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-value">{admins.length}</div>
          <div className="stat-label">Administradores</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td style={{ fontWeight: 600 }}>{user.fullName}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                <td>
                  <span className={`badge ${
                    user.role === 'admin' ? 'badge-danger' :
                    user.role === 'docente' ? 'badge-primary' : 'badge-success'
                  }`}>{user.role}</span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-secondary'}`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      title="Cambiar rol"
                    >
                      🔄 Rol
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
