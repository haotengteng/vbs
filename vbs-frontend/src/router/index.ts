import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import Dashboard from '@/views/Dashboard.vue';
import SvgTestView from '@/views/SvgTestView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/svg-test',
      name: 'SvgTest',
      component: SvgTestView,
      meta: { public: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (!to.meta.public && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else {
    next();
  }
});

export default router;
