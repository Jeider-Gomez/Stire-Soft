// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

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
      // Gatea el acceso-rápido de demostración (login.vue, HeaderNav.vue) y el
      // selector de rol. Apagado por defecto: no debe estar en el uso normal
      // de la aplicación ni en el flujo de autenticación de producción.
      // Los botones, cuando están visibles, hacen login real — nunca fabrican
      // un token (ver stores/auth.ts, switchRoleForDemo).
      demoMode: process.env.NUXT_PUBLIC_DEMO_MODE === 'true'
    }
  },

  typescript: {
    strict: true
  }
})

