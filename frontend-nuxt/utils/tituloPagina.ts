// Título de la pestaña según la pantalla (WCAG 2.4.2 «Página titulada»). Todas las pantallas decían lo mismo, así que
// quien usa un lector de pantalla o tiene varias pestañas abiertas no sabía dónde estaba.

const TITULOS: Array<[RegExp, string]> = [
  [/^\/auth\/login/, 'Iniciar sesión'],
  [/^\/auth\/register/, 'Crear cuenta'],
  [/^\/auth\/forgot-password/, 'Recuperar contraseña'],
  [/^\/auth\/reset-password/, 'Nueva contraseña'],
  [/^\/estudiante\/clases/, 'Mis clases'],
  [/^\/estudiante\/unidad\//, 'Lección'],
  [/^\/estudiante\/evaluacion\//, 'Ejercicio'],
  [/^\/estudiante\/progreso/, 'Mi progreso'],
  [/^\/estudiante\/repasos/, 'Repasos'],
  [/^\/estudiante\/mensajes/, 'Mensajes'],
  [/^\/estudiante\/perfil/, 'Mi perfil'],
  [/^\/estudiante\/refuerzos\//, 'Refuerzo'],
  [/^\/estudiante\/entregas\//, 'Entrega'],
  [/^\/estudiante\/proyectos\/\d+/, 'Proyecto'],
  [/^\/estudiante\/proyectos/, 'Mis proyectos'],
  [/^\/estudiante\/?$/, 'Inicio'],
  [/^\/docente\/contenidos/, 'Contenidos del curso'],
  [/^\/docente\/ejercicios\/crear/, 'Nuevo ejercicio'],
  [/^\/docente\/rendimiento/, 'Rendimiento del grupo'],
  [/^\/docente\/clase\/\d+\/ajustes/, 'Ajustes de la clase'],
  [/^\/docente\/clase\/\d+\/notas/, 'Notas de la clase'],
  [/^\/docente\/clase\//, 'Hoy en la clase'],
  [/^\/docente\/estudiante\//, 'Detalle del estudiante'],
  [/^\/docente\/refuerzos\/nuevo/, 'Asignar refuerzo o reto'],
  [/^\/docente\/refuerzos/, 'Refuerzos y retos'],
  [/^\/docente\/entregas\/revision\//, 'Revisar entrega'],
  [/^\/docente\/entregas\/\d+/, 'Entrega'],
  [/^\/docente\/entregas/, 'Entregas'],
  [/^\/docente\/mensajes/, 'Mensajes'],
  [/^\/docente\/perfil/, 'Mi perfil'],
  [/^\/docente\/?$/, 'Mis clases'],
  [/^\/admin\/usuarios/, 'Usuarios'],
  [/^\/admin\/sistema/, 'Estado del sistema'],
  [/^\/admin\/sugerencias/, 'Sugerencias'],
  [/^\/admin\/perfil/, 'Mi perfil'],
  [/^\/admin(\/dashboard)?\/?$/, 'Administración'],
]

export const NOMBRE_APP = 'STIRE-Soft'

/** «Mi progreso · STIRE-Soft»; una ruta desconocida lleva solo el nombre de la aplicación. */
export function tituloPagina(ruta: string): string {
  const encontrado = TITULOS.find(([patron]) => patron.test(ruta))
  return encontrado ? `${encontrado[1]} · ${NOMBRE_APP}` : `${NOMBRE_APP} — Sistema Tutor Inteligente`
}
