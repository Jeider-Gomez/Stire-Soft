import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        /* Paleta Oficial STIRE Soft */
        stire: {
          blue: '#0B3D91',         /* Azul Tecnológico (Institucional / Primario) */
          'blue-dark': '#07275e',    /* Azul Hover / Contraste */
          purple: '#7B2FBF',       /* Morado Innovación (Tutor IA / Rol Docente) */
          'purple-light': '#f3e8ff', /* Púrpura suave para badges */
          teal: '#00C2A8',         /* Turquesa Acción (Éxito / Acentos / CTA) */
          'teal-dark': '#009985',    /* Turquesa Hover */

          /* Semáforo Pedagógico Cognitivo */
          success: '#10B981',      /* Dominio Alto / Aprobado */
          warning: '#F59E0B',      /* Rezago Detectado / Refuerzo Necesario */
          danger: '#EF4444',       /* Alerta Crítica */

          /* Fondos de Superficie */
          canvas: '#F7F9FC',       /* Fondo base Modo Claro (Anti-fatiga) */
          'dark-canvas': '#050C1F',  /* Fondo base Modo Oscuro */
          'dark-card': '#0A1435',    /* Superficie de tarjeta Modo Oscuro */
        },
        base: {
          blanco: '#FFFFFF',
          'bg-primario': '#F7F9FC',
          'bg-secundario': '#EEF2F6',
          'borde-sutil': '#E2E8F0',
          'borde-fuerte': '#CBD5E1',
          'texto-secundario': '#64748B',
          'texto-primario': '#0F172A'
        },
        acento: {
          ambar: '#0B3D91',
          'ambar-fuerte': '#07275e'
        },
        semantico: {
          pasa: '#10B981',
          falla: '#EF4444',
          info: '#0B3D91'
        },
        'estado-unidad': {
          dominado: '#10B981',
          'en-progreso': '#F59E0B',
          'por-iniciar': '#0B3D91',
          bloqueado: '#94A3B8'
        },
        'urgencia-repaso': {
          'al-dia': '#10B981',
          manana: '#F59E0B',
          vencido: '#F97316',
          critico: '#EF4444'
        },
        editor: {
          bg: '#0A1435',
          header: '#050C1F',
          border: '#1E293B',
          line: '#1E293B',
          text: '#F1F5F9',
          muted: '#94A3B8',
          status: '#00C2A8'
        }
      },
      fontFamily: {
        interfaz: ['Inter', 'sans-serif'],
        codigo: ['"JetBrains Mono"', 'monospace']
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        md: '18px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px'
      },
      fontWeight: {
        regular: '400',
        medio: '500',
        semibold: '600',
        bold: '700'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        sidebar: '260px',
        drawer: '400px'
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        full: '999px'
      },
      borderWidth: {
        fino: '1px',
        medio: '2px',
        grueso: '4px'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(11,61,145,0.05)',
        md: '0 4px 8px -2px rgba(11,61,145,0.08)',
        lg: '0 12px 24px -4px rgba(11,61,145,0.12)'
      }
    }
  }
}
