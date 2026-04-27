'use client';

import { useEffect, useState } from 'react';
import { learningUnitApi, progressApi } from '@/lib/api';

export default function UnidadesEstudiante() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const data = await progressApi.getMyProgress();
      setUnits(data);
    } catch {
      // Si no hay progreso, cargar unidades directamente
      try {
        const allUnits = await learningUnitApi.getAll();
        setUnits(allUnits.map((u: any) => ({
          learningUnit: u,
          state: 'no_visto',
          mastery: 0,
        })));
      } catch (err) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (unitId: number) => {
    try {
      await progressApi.markAsViewed(unitId);
      await loadUnits();
    } catch (err) {
      console.error(err);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const map: Record<string, { text: string; class: string }> = {
      basico: { text: 'Básico', class: 'badge-success' },
      intermedio: { text: 'Intermedio', class: 'badge-warning' },
      avanzado: { text: 'Avanzado', class: 'badge-danger' },
    };
    return map[difficulty] || { text: difficulty, class: 'badge-secondary' };
  };

  const getStateLabel = (state: string) => {
    const labels: Record<string, { text: string; class: string }> = {
      no_visto: { text: 'No visto', class: 'badge-secondary' },
      visto: { text: 'Visto', class: 'badge-warning' },
      en_practica: { text: 'En práctica', class: 'badge-primary' },
      dominado: { text: 'Dominado', class: 'badge-success' },
    };
    return labels[state] || { text: state, class: 'badge-secondary' };
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>📘 Unidades de Aprendizaje</h1>
        <p>Explora los temas de Fundamentos de Algoritmia</p>
      </div>

      {units.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>Sin unidades disponibles</h3>
          <p>Aún no hay unidades de aprendizaje creadas. Tu docente las agregará pronto.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {units.map((item: any) => {
            const unit = item.learningUnit || item;
            const state = item.state || 'no_visto';
            const mastery = item.mastery || 0;
            const stateInfo = getStateLabel(state);
            const diffBadge = getDifficultyBadge(unit.difficulty);

            return (
              <div key={unit.id} className="card card-glow">
                <div className="card-header">
                  <span className="card-title">{unit.title}</span>
                  <span className={`badge ${stateInfo.class}`}>{stateInfo.text}</span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {unit.description || 'Sin descripción'}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className={`badge ${diffBadge.class}`}>{diffBadge.text}</span>
                </div>

                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dominio</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{mastery}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill ${mastery > 70 ? 'high' : mastery >= 40 ? 'medium' : 'low'}`}
                    style={{ width: `${mastery}%` }}
                  />
                </div>

                {state === 'no_visto' && (
                  <div className="card-footer">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleView(unit.id)}
                    >
                      👁️ Marcar como Vista
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
