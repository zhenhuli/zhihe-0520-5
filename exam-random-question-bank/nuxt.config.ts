export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: [
    '@fortawesome/fontawesome-free/css/all.css',
    '~/assets/css/main.scss'
  ]
})
