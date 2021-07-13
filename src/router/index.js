import Vue from 'vue'
import VueRouter from 'vue-router'
import login from "@/components/login";
import home from "@/components/home";

Vue.use(VueRouter)

const routes = [
    {
        path: '/login',
        name: 'login',
        component: login
    },
    {
        path: '/home',
        name: 'home',
        component: home
    }
]

const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    if (to.name === "login") return next();
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})


export default router
