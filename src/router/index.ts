import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '../views/Login.vue'
import store from '@/store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    name: 'Admin',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Admin.vue'),
  },
  {
    path: '/error/:msg',
    name: 'Error',
    component: () => import("../views/error/ErrorView.vue"),
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  next()
})

router.beforeResolve(async (to, from, next) => {
  //目标不是登陆界面的话，判断是否登陆
  // console.log('to', to)
  // console.log('store', store);
  if (to.name === 'Error')
    next();
  else if (to.name !== 'Login' && !store.getters.isLogin)
    next({path: "/error/未登陆"})
  // else if (to.matched.length === 0)
  //   next({path: "/error/无效菜单"});
  else
    next();
})

export default router
