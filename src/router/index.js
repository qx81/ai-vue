import {createRouter, createWebHistory} from 'vue-router'
import BackendLayout from "@/components/BackendLayout.vue";
import FrontendLayout from "@/components/FrontendLayout.vue";

//后台路由配置
const backendRoutes = [
    {
        path: '/back',
        name: 'back',
        component: BackendLayout,
        redirect: '/back/dashboard',
        children: [
            {
                path: 'article',
                redirect: '/back/knowledge'
            },
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/views/dashboard.vue'),
                meta: {
                    title: '数据分析',
                    icon: 'PieChart'
                }
            },
            {
                path: 'knowledge',
                name: 'knowledge',
                component: () => import('@/views/knowledge.vue'),
                meta: {
                    title: '知识文章',
                    icon: 'ChatLineSquare'
                }
            },
            {
                path: 'consultations',
                name: 'consultations',
                component: () => import('@/views/consultations.vue'),
                meta: {
                    title: '咨询记录',
                    icon: 'Message'
                }
            },
            {
                path: 'emotional',
                name: 'emotional',
                component: () => import('@/views/emotional.vue'),
                meta: {
                    title: '情绪日志',
                    icon: 'Avatar'
                }
            }
        ]
    }
]

//用户前台路由配置
const frontendRoutes = [
    {
        path: '/front',
        name: 'front',
        component: FrontendLayout,
        redirect: '/front/home',
        children: [
            {
                path: 'home',
                name: 'home',
                component: () => import('@/views/front/home.vue'),
                meta: {
                    title: '首页',
                    icon: 'House'
                }
            },
            {
                path: 'chat',
                name: 'chat',
                component: () => import('@/views/front/chat.vue'),
                meta: {
                    title: 'AI咨询',
                    icon: 'ChatLineSquare'
                }
            },
            {
                path: '',
                name: 'feemotional',
                component: () => import('@/views/front/emotional.vue'),
                meta: {
                    title: '情绪日记',
                    icon: 'Avatar'
                }
            },
            {
                path: 'feknowledge',
                name: 'feknowledge',
                component: () => import('@/views/front/knowledge.vue'),
                meta: {
                    title: '知识库',
                    icon: 'ChatLineSquare'
                }
            },
            {
                path: 'article/:id',
                name: 'article',
                component: () => import('@/views/front/article.vue'),
                meta: {
                    title: '文章详情',
                    icon: 'Document'
                }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/front/home'
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/Login.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/Register.vue')
        },
        ...frontendRoutes,
        ...backendRoutes
    ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (token) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        console.log('userInfo.userType=' + userInfo.userType)
        console.log('to.path=' + to.path)
        console.log('to.path startsWith /back:', to.path.startsWith('/back'))

        //后台用户
        if (userInfo.userType === 2) {
            if (to.path.startsWith('/back')) {
                console.log('后台用户访问后台路由，允许访问')
                next()
            } else {
                console.log('后台用户访问前台路由，重定向到后台首页')
                // 如果后台用户访问前台路由，重定向到后台首页
                next('/back/dashboard')
            }
        } else if (userInfo.userType === 1) {//前台用户 只能访问前台的路由
            if (to.path.startsWith('/back')) {
                console.log('前台用户访问后台路由，重定向到前台首页')
                // 如果前台用户访问后台路由，重定向到前台首页
                next('/front/home')
            } else {
                console.log('前台用户访问前台路由，允许访问')
                next()
            }
        } else {
            console.log('未知用户类型，重定向到登录页')
            // 未知用户类型，重定向到登录页
            next('/auth/login')
        }
    } else {
        if (to.path.startsWith('/back')) {
            next('/auth/login')
        } else {
            next()
        }
    }
})

export default router;