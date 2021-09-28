import Vue from 'vue'
import VueRouter from 'vue-router'
import login from "@/components/login";
import home from "@/components/home";
import welcome from "@/components/welcome";
import users from "@/views/user/users";
import Rights from "@/views/power/Rights";
import roles from "@/views/power/roles";
import Cate from "@/views/goods/Cate";
import params from "@/views/goods/params";
import list from "@/views/goods/list";
import add from "@/views/goods/add";
import order from "@/views/order/order";
import report from "@/views/report/report";

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
            },
            {
                path: '/params',
                name: 'params',
                component: params
            },
            {
                path: '/goods',
                name: 'list',
                component: list
            },
            {
                path: '/goods/add',
                name: 'add',
                component: add
            },
            {
                path: '/orders',
                name: 'order',
                component: order
            },
            {
                path: '/reports',
                name: 'report',
                component: report
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
