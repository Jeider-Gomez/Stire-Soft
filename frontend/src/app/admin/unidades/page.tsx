'use client';

import { useEffect, useState } from 'react';
import { learningUnitApi } from '@/lib/api';

export default function UnidadesAdmin() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('basico');
  const [order, setOrder] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const data = await learningUnitApi.getAllAdmin();
      setUnits(data);
    } catch {
      try {
        const data = await learningUnitApi.getAll();
        setUnits(data);
      } catch (err) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await learningUnitApi.create({ title, description, difficulty, order });
      setShowCreate(false);
      setTitle(''); setDescription(''); setDifficulty('basico'); setOrder(0);
      await loadUnits();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta unidad?')) return;
    try {
      await learningUnitApi.remove(id);
      await loadUnits();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>📘 Unidades de Aprendizaje</h1>
          <p>Administración completa</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Nueva Unidad</button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Crear Unidad</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dificultad</label>
                <select className="form-input form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Orden</label>
                <input className="form-input" type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}

      {units.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📘</div>
          <h3>Sin unidades</h3>
          <p>Crea la primera unidad de aprendizaje.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>#</th><th>Título</th><th>Dificultad</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {units.map((u: any) => (
                <tr key={u.id}>
                  <td>{u.order}</td>
                  <td style={{ fontWeight: 600 }}>{u.title}</td>
                  <td><span className={`badge ${u.difficulty === 'basico' ? 'badge-success' : u.difficulty === 'intermedio' ? 'badge-warning' : 'badge-danger'}`}>{u.difficulty}</span></td>
                  <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-secondary'}`}>{u.isActive ? 'Activa' : 'Inactiva'}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
