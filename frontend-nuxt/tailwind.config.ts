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
        'stire-blue': '#0B3D91',
        'stire-blue-dark': '#082A66',
        'stire-purple': '#7B2FBF',
        'stire-purple-light': '#F3E8FF',
        'stire-teal': '#00C2A8',
        'stire-teal-dark': '#009985',
        'stire-success': '#10B981',
        'stire-warning': '#F59E0B',
        'stire-danger': '#EF4444',
        'stire-canvas': '#F7F9FC',
        'stire-dark-canvas': '#050C1F',
        'stire-dark-card': '#0A1435',
        // Tokens semánticos con la paleta de la identidad de José (prototipo STIRE-FRONEND, 28/09). Los nombres
        // «acento-ambar» se conservan porque los usan cientos de clases; sus valores ya son los azules de la guía.
        // Todos los colores de texto pasan WCAG AA (4.5:1) sobre blanco y sobre stire-canvas.
        base: {
          blanco: '#FFFFFF',
          'bg-primario': '#F7F9FC',
          'bg-secundario': '#F1F5F9',
          'borde-sutil': '#E2E8F0',
          'borde-fuerte': '#CBD5E1',
          'texto-secundario': '#64748B',
          'texto-primario': '#1E293B'
        },
        acento: {
          // Antes ámbar. «ambar-fuerte» es el azul tecnológico (botones, enlaces); «ambar» su tono de hover.
          ambar: '#082A66',
          'ambar-fuerte': '#0B3D91'
        },
        semantico: {
          pasa: '#047857',
          falla: '#B91C1C',
          info: '#0B3D91'
        },
        'estado-unidad': {
          dominado: '#047857',
          'en-progreso': '#7B2FBF',
          'por-iniciar': '#0B3D91',
          bloqueado: '#64748B'
        },
        'urgencia-repaso': {
          'al-dia': '#047857',
          manana: '#7B2FBF',
          vencido: '#B45309',
          critico: '#B91C1C'
        },
        // Editor de código con los colores del prototipo: fondo pizarra, palabras clave moradas, números ámbar.
        editor: {
          bg: '#0F172A',
          header: '#111C33',
          border: '#1E293B',
          line: '#16213A',
          text: '#E2E8F0',
          muted: '#94A3B8',
          status: '#00C2A8'
        }
      },
      fontFamily: {
        interfaz: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
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
        sm: '0 1px 2px 0 rgba(43,38,34,0.08)',
        md: '0 4px 8px -2px rgba(43,38,34,0.10)',
        lg: '0 12px 24px -4px rgba(43,38,34,0.14)'
      }
    }
  }
}
