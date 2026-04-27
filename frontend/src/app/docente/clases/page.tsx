'use client';

import { useEffect, useState } from 'react';
import { classApi } from '@/lib/api';

export default function ClasesDocente() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await classApi.create({ name, description, code });
      setShowCreate(false);
      setName('');
      setDescription('');
      setCode('');
      await loadClasses();
    } catch (err: any) {
      setError(err.message || 'Error al crear la clase');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🏫 Mis Clases</h1>
          <p>Gestiona tus clases y estudiantes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Nueva Clase
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Crear Nueva Clase</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nombre de la Clase</label>
                <input
                  className="form-input"
                  placeholder="Ej: Algoritmia 2026-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Código</label>
                <input
                  className="form-input"
                  placeholder="Ej: ALG-2026-1"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Descripción de la clase..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creando...' : 'Crear Clase'}
              </button>
            </form>
          </div>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏫</div>
          <h3>Sin clases</h3>
          <p>Crea tu primera clase para comenzar a gestionar estudiantes.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {classes.map((cls: any) => (
            <a key={cls.id} href={`/docente/clases/${cls.id}`} style={{ textDecoration: 'none' }}>
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
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
