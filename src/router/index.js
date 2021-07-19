import Vue from 'vue'
import VueRouter from 'vue-router'
import login from "@/components/login";
import home from "@/components/home";
import welcome from "@/components/welcome";
import users from "@/components/user/users";
import Rights from "@/views/power/Rights";
import roles from "@/views/power/roles";
import Cate from "@/views/goods/Cate";

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
        component: home,
        redirect: '/welcome',
        children: [
            {
                path:'/welcome',
                name:'welcome',
                component:welcome
            },
            {
                path:'/users',
                name:'users',
                component:users
            },
            {
                path: '/rights',
                name: 'rights',
                component: Rights
            },
            {
                path: '/roles',
                name:'roles',
                component: roles
            },
            {
                path: '/categories',
                name: 'categories',
                component: Cate
            }
        ]
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
