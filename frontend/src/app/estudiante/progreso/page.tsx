'use client';

import { useEffect, useState } from 'react';
import { progressApi } from '@/lib/api';

export default function ProgresoEstudiante() {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await progressApi.getMyProgress();
      setProgress(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  const totalMastery = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.mastery, 0) / progress.length)
    : 0;

  const dominated = progress.filter((p) => p.state === 'dominado').length;
  const inPractice = progress.filter((p) => p.state === 'en_practica').length;

  return (
    <div>
      <div className="page-header">
        <h1>📈 Mi Progreso</h1>
        <p>Visualiza tu avance en cada unidad de aprendizaje</p>
      </div>

      {/* Overall stats */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-value">{totalMastery}%</div>
          <div className="stat-label">Dominio Promedio</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{dominated}/{progress.length}</div>
          <div className="stat-label">Unidades Dominadas</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-value">{inPractice}</div>
          <div className="stat-label">En Práctica</div>
        </div>
      </div>

      {/* Progress table */}
      {progress.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Dificultad</th>
                <th>Estado</th>
                <th>Dominio</th>
                <th>Revisiones</th>
                <th>Última Revisión</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((item: any) => {
                const unit = item.learningUnit;
                const stateLabels: Record<string, { text: string; class: string }> = {
                  no_visto: { text: 'No visto', class: 'badge-secondary' },
                  visto: { text: 'Visto', class: 'badge-warning' },
                  en_practica: { text: 'En práctica', class: 'badge-primary' },
                  dominado: { text: 'Dominado', class: 'badge-success' },
                };
                const stateInfo = stateLabels[item.state] || { text: item.state, class: 'badge-secondary' };

                return (
                  <tr key={unit?.id || item.id}>
                    <td style={{ fontWeight: 600 }}>{unit?.title || 'Sin título'}</td>
                    <td>
                      <span className={`badge ${
                        unit?.difficulty === 'basico' ? 'badge-success' :
                        unit?.difficulty === 'intermedio' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {unit?.difficulty || '-'}
                      </span>
                    </td>
                    <td><span className={`badge ${stateInfo.class}`}>{stateInfo.text}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="progress-bar" style={{ width: '100px' }}>
                          <div
                            className={`progress-bar-fill ${item.mastery > 70 ? 'high' : item.mastery >= 40 ? 'medium' : 'low'}`}
                            style={{ width: `${item.mastery}%` }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.mastery}%</span>
                      </div>
                    </td>
                    <td>{item.reviewCount}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {item.lastReview
                        ? new Date(item.lastReview).toLocaleDateString('es-CO')
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>Sin progreso aún</h3>
          <p>Comienza a explorar las unidades de aprendizaje para ver tu progreso aquí.</p>
        </div>
      )}
    </div>
  );
}
