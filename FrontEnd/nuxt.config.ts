import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  pages: true,
  css: ['~/assets/main.scss'],
  ssr: true,

  runtimeConfig: {
    public: {
      baseURL: 'http://localhost:3000', // Publiczny URL aplikacji
      apiBase: 'http://localhost:5000/api', // URL API backendu
    },
  },

  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: 'forum-post',
        path: '/forum/:id',
        file: '~/pages/forum/_id.vue',
      });
    },
  },
});
