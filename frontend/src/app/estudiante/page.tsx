'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { progressApi, learningUnitApi } from '@/lib/api';
import Link from 'next/link';

export default function EstudianteDashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const recs = await progressApi.getRecommendations();
      setRecommendations(recs);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  const getStateLabel = (state: string) => {
    const labels: Record<string, { text: string; class: string }> = {
      no_visto: { text: 'No visto', class: 'badge-secondary' },
      visto: { text: 'Visto', class: 'badge-warning' },
      en_practica: { text: 'En práctica', class: 'badge-primary' },
      dominado: { text: 'Dominado', class: 'badge-success' },
    };
    return labels[state] || { text: state, class: 'badge-secondary' };
  };

  const getMasteryClass = (mastery: number) => {
    if (mastery > 70) return 'high';
    if (mastery >= 40) return 'medium';
    return 'low';
  };

  return (
    <div>
      <div className="page-header">
        <h1>¡Hola, {user?.fullName?.split(' ')[0]}! 👋</h1>
        <p>Aquí tienes un resumen de tu progreso en Fundamentos de Algoritmia</p>
      </div>

      {/* Stats */}
      {recommendations && (
        <div className="stats-grid">
          <div className="stat-card purple">
            <div className="stat-value">{recommendations.totalUnits}</div>
            <div className="stat-label">Total Unidades</div>
          </div>
          <div className="stat-card green">
            <div className="stat-value">{recommendations.dominated}</div>
            <div className="stat-label">Dominados</div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-value">{recommendations.inProgress}</div>
            <div className="stat-label">En Práctica</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-value">{recommendations.notViewed}</div>
            <div className="stat-label">Por Estudiar</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="cards-grid" style={{ marginBottom: '2rem' }}>
        <Link href="/tutor" style={{ textDecoration: 'none' }}>
          <div className="card card-glow" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🤖</div>
            <div className="card-title">Tutor Inteligente</div>
            <div className="card-content">
              Conversa con tu tutor IA. Pregunta dudas, recibe explicaciones
              y recomendaciones personalizadas.
            </div>
          </div>
        </Link>

        <Link href="/estudiante/progreso" style={{ textDecoration: 'none' }}>
          <div className="card card-glow" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📈</div>
            <div className="card-title">Mi Progreso</div>
            <div className="card-content">
              Revisa tu avance en cada unidad de aprendizaje y mira qué
              temas necesitas reforzar.
            </div>
          </div>
        </Link>

        <Link href="/estudiante/mensajes" style={{ textDecoration: 'none' }}>
          <div className="card card-glow" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💬</div>
            <div className="card-title">Mensajes</div>
            <div className="card-content">
              Comunícate con tu docente. Envía y recibe mensajes directos
              sobre tu aprendizaje.
            </div>
          </div>
        </Link>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.recommendations.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            📋 Recomendaciones de Estudio
          </h2>
          <div className="cards-grid">
            {recommendations.recommendations.map((rec: any, index: number) => {
              const stateInfo = getStateLabel(rec.state);
              return (
                <div key={index} className="card">
                  <div className="card-header">
                    <span className="card-title">{rec.learningUnit.title}</span>
                    <span className={`badge ${stateInfo.class}`}>{stateInfo.text}</span>
                  </div>
                  <p className="card-subtitle" style={{ marginBottom: '1rem' }}>
                    {rec.learningUnit.description || 'Sin descripción'}
                  </p>
                  <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dominio</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{rec.mastery}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${getMasteryClass(rec.mastery)}`}
                      style={{ width: `${rec.mastery}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recommendations && recommendations.recommendations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <h3>¡Excelente!</h3>
          <p>Has dominado todas las unidades de aprendizaje disponibles.</p>
        </div>
      )}
    </div>
  );
}
