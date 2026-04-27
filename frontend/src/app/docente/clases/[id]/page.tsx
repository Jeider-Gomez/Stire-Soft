'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { classApi, progressApi } from '@/lib/api';

export default function ClaseDetalle() {
  const params = useParams();
  const classId = Number(params.id);
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    loadClass();
  }, [classId]);

  const loadClass = async () => {
    try {
      const data = await classApi.getOne(classId);
      setClassData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingStudent(true);
    setError('');
    try {
      await classApi.addStudent(classId, parseInt(studentId));
      setStudentId('');
      await loadClass();
    } catch (err: any) {
      setError(err.message || 'Error al agregar estudiante');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (sid: number) => {
    if (!confirm('¿Estás seguro de remover este estudiante?')) return;
    try {
      await classApi.removeStudent(classId, sid);
      await loadClass();
    } catch (err) {
      console.error(err);
    }
  };

  const viewStudentProgress = async (student: any) => {
    setSelectedStudent(student);
    setProgressLoading(true);
    try {
      const data = await progressApi.getStudentProgress(student.id);
      setStudentProgress(data);
    } catch (err) {
      console.error(err);
    } finally {
      setProgressLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  if (!classData) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <h3>Clase no encontrada</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>🏫 {classData.name}</h1>
        <p>Código: {classData.code} · {classData.students?.length || 0} estudiantes</p>
      </div>

      {/* Add student */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Agregar Estudiante</h3>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            className="form-input"
            type="number"
            placeholder="ID del estudiante"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            style={{ maxWidth: '250px' }}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={addingStudent}>
            {addingStudent ? 'Agregando...' : '+ Agregar'}
          </button>
        </form>
      </div>

      {/* Student progress modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Progreso de {selectedStudent.fullName}</h3>
              <button className="modal-close" onClick={() => setSelectedStudent(null)}>×</button>
            </div>
            {progressLoading ? (
              <div className="loading-container"><div className="loading-spinner" /></div>
            ) : studentProgress.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Sin progreso registrado.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Unidad</th><th>Estado</th><th>Dominio</th></tr>
                  </thead>
                  <tbody>
                    {studentProgress.map((p: any) => (
                      <tr key={p.learningUnit?.id || p.id}>
                        <td>{p.learningUnit?.title || 'Sin título'}</td>
                        <td>
                          <span className={`badge ${
                            p.state === 'dominado' ? 'badge-success' :
                            p.state === 'en_practica' ? 'badge-primary' :
                            p.state === 'visto' ? 'badge-warning' : 'badge-secondary'
                          }`}>{p.state}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="progress-bar" style={{ width: '80px' }}>
                              <div
                                className={`progress-bar-fill ${p.mastery > 70 ? 'high' : p.mastery >= 40 ? 'medium' : 'low'}`}
                                style={{ width: `${p.mastery}%` }}
                              />
                            </div>
                            <span style={{ fontSize: '0.85rem' }}>{p.mastery}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students list */}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
        👥 Estudiantes Inscritos
      </h3>

      {(!classData.students || classData.students.length === 0) ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>Sin estudiantes</h3>
          <p>Agrega estudiantes usando su ID</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {classData.students.map((student: any) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td style={{ fontWeight: 600 }}>{student.fullName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => viewStudentProgress(student)}
                      >
                        📊 Progreso
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveStudent(student.id)}
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
      )}
    </div>
  );
}
