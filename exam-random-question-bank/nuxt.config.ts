export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2026-05-29',
  modules: ['@pinia/nuxt'],
  css: [
    '@fortawesome/fontawesome-free/css/all.css',
    '~/assets/css/main.scss'
  ]
})
