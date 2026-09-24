// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  // Aplicación de una sola página: no hay rutas de servidor ni useFetch, la sesión vive en una
  // cookie leída en el navegador y todas las peticiones salen del cliente. Sin SSR se publica
  // como archivos estáticos (`nuxi generate`) en cualquier hosting gratuito con ancho de banda
  // ilimitado, sin funciones serverless ni desajustes de hidratación entre servidor y cliente.
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      title: 'STIRE-Soft — Sistema Tutor Inteligente',
      htmlAttrs: {
        lang: 'es'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistema Tutor Inteligente con Repetición Espaciada y Evaluación Automática' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      // Gatea el acceso-rápido de demostración en login.vue. Apagado por
      // defecto: no debe estar en el flujo de autenticación de producción.
      // Los botones, cuando están visibles, hacen login real — nunca fabrican
      // un token (ver stores/auth.ts, switchRoleForDemo). Defensa en
      // profundidad: aunque NUXT_PUBLIC_DEMO_MODE quede en "true" por error en
      // un despliegue real, NODE_ENV=production lo anula igual.
      demoMode: process.env.NUXT_PUBLIC_DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production'
    }
  },

  typescript: {
    strict: true
  }
})

