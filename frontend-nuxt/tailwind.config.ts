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
        // Fondo de la página: cambia con el tema (assets/css/temas.css).
        'stire-canvas': 'rgb(var(--c-stire-canvas) / <alpha-value>)',
        'stire-dark-canvas': '#050C1F',
        'stire-dark-card': '#0A1435',
        // Tokens semánticos con la paleta de la identidad de José (prototipo STIRE-FRONEND, 28/09). Los nombres
        // «acento-ambar» se conservan porque los usan cientos de clases; sus valores ya son los azules de la guía.
        // Todos los colores de texto pasan WCAG AA (4.5:1) sobre blanco y sobre stire-canvas.
        // Desde el 04/10 leen variables (assets/css/temas.css): el tema claro conserva estos mismos valores
        // (#FFFFFF, #F7F9FC, …) y el oscuro y el alto contraste los cambian sin tocar las pantallas.
        base: {
          blanco: 'rgb(var(--c-base-blanco) / <alpha-value>)',
          'bg-primario': 'rgb(var(--c-base-bg-primario) / <alpha-value>)',
          'bg-secundario': 'rgb(var(--c-base-bg-secundario) / <alpha-value>)',
          'borde-sutil': 'rgb(var(--c-base-borde-sutil) / <alpha-value>)',
          'borde-fuerte': 'rgb(var(--c-base-borde-fuerte) / <alpha-value>)',
          'texto-secundario': 'rgb(var(--c-base-texto-secundario) / <alpha-value>)',
          'texto-primario': 'rgb(var(--c-base-texto-primario) / <alpha-value>)'
        },
        acento: {
          // Antes ámbar. «ambar-fuerte» es el azul tecnológico (botones, enlaces); «ambar» su tono de hover.
          ambar: 'rgb(var(--c-acento-ambar) / <alpha-value>)',
          'ambar-fuerte': 'rgb(var(--c-acento-ambar-fuerte) / <alpha-value>)'
        },
        semantico: {
          pasa: 'rgb(var(--c-semantico-pasa) / <alpha-value>)',
          falla: 'rgb(var(--c-semantico-falla) / <alpha-value>)',
          info: 'rgb(var(--c-semantico-info) / <alpha-value>)'
        },
        'estado-unidad': {
          dominado: 'rgb(var(--c-unidad-dominado) / <alpha-value>)',
          'en-progreso': 'rgb(var(--c-unidad-en-progreso) / <alpha-value>)',
          'por-iniciar': 'rgb(var(--c-unidad-por-iniciar) / <alpha-value>)',
          bloqueado: 'rgb(var(--c-unidad-bloqueado) / <alpha-value>)'
        },
        'urgencia-repaso': {
          'al-dia': 'rgb(var(--c-repaso-al-dia) / <alpha-value>)',
          manana: 'rgb(var(--c-repaso-manana) / <alpha-value>)',
          vencido: 'rgb(var(--c-repaso-vencido) / <alpha-value>)',
          critico: 'rgb(var(--c-repaso-critico) / <alpha-value>)'
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
      // En rem (los mismos 12, 14, 16… px con el tamaño normal), para que «Texto grande» los agrande (utils/apariencia.ts).
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        md: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem'
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
