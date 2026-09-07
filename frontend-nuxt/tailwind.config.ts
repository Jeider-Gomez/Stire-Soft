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
        base: {
          blanco: '#FFFFFF',
          'bg-primario': '#F6F3EF',
          'bg-secundario': '#EDE8E1',
          'borde-sutil': '#C9C1B8',
          'borde-fuerte': '#998878',
          'texto-secundario': '#6F6761',
          'texto-primario': '#2B2622'
        },
        acento: {
          ambar: '#C87B1E',
          'ambar-fuerte': '#A76719'
        },
        semantico: {
          pasa: '#2F7D4F',
          falla: '#B3261E',
          info: '#2B5D8A'
        },
        'estado-unidad': {
          dominado: '#2F7D4F',
          'en-progreso': '#A76719',
          'por-iniciar': '#2B5D8A',
          bloqueado: '#6F6761'
        },
        'urgencia-repaso': {
          'al-dia': '#2F7D4F',
          manana: '#A76719',
          vencido: '#A85A1E',
          critico: '#B3261E'
        },
        editor: {
          bg: '#1E1E1E',
          header: '#252526',
          border: '#333333',
          line: '#2D2D2D',
          text: '#D4D4D4',
          muted: '#858585',
          status: '#007ACC'
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
        sm: '0 1px 2px 0 rgba(43,38,34,0.08)',
        md: '0 4px 8px -2px rgba(43,38,34,0.10)',
        lg: '0 12px 24px -4px rgba(43,38,34,0.14)'
      }
    }
  }
}
