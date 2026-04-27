'use client';

import { useEffect, useState } from 'react';
import { learningUnitApi } from '@/lib/api';

export default function UnidadesDocente() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('basico');
  const [order, setOrder] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const data = await learningUnitApi.getAllAdmin();
      setUnits(data);
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
      await learningUnitApi.create({ title, description, difficulty, order });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setDifficulty('basico');
      setOrder(0);
      await loadUnits();
    } catch (err: any) {
      setError(err.message || 'Error al crear unidad');
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
          <h1>📘 Unidades de Aprendizaje</h1>
          <p>Gestiona los temas del curso</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Nueva Unidad
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Crear Unidad de Aprendizaje</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input
                  className="form-input"
                  placeholder="Ej: Estructuras Condicionales IF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Descripción del tema..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dificultad</label>
                <select
                  className="form-input form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Orden</label>
                <input
                  className="form-input"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creando...' : 'Crear Unidad'}
              </button>
            </form>
          </div>
        </div>
      )}

      {units.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📘</div>
          <h3>Sin unidades</h3>
          <p>Crea tu primera unidad de aprendizaje.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Dificultad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit: any) => (
                <tr key={unit.id}>
                  <td>{unit.order}</td>
                  <td style={{ fontWeight: 600 }}>{unit.title}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                    {unit.description ? (unit.description.length > 80 ? unit.description.slice(0, 80) + '...' : unit.description) : '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      unit.difficulty === 'basico' ? 'badge-success' :
                      unit.difficulty === 'intermedio' ? 'badge-warning' : 'badge-danger'
                    }`}>{unit.difficulty}</span>
                  </td>
                  <td>
                    <span className={`badge ${unit.isActive ? 'badge-success' : 'badge-secondary'}`}>
                      {unit.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
