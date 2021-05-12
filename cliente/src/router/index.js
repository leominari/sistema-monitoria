import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login/Login'
import DashboardAluno from "../views/DashboardAluno/DashboardAluno";
import Template from "../views/DashboardAluno/TemplateAluno";
import SettingsAluno from "../views/DashboardAluno/SettingsAluno";
import Logout from "../views/Logout";
import MonitoriaDetalhes from "@/views/DashboardAluno/MonitoriaDetalhes";
import Monitoria from "@/views/DashboardAluno/Monitoria";
import Monitor from "@/views/DashboardAluno/Monitor";
import MonitorDetalhes from "@/views/DashboardAluno/MonitorDetalhes";
import AlunoMonitoria from "../views/DashboardAluno/AlunoMonitoria";


Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Dashboard',
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/',
        name: 'Template',
        component: Template,
        children: [
            {
                path: '/dashboard',
                name: 'DashboardAluno',
                component: DashboardAluno,
            },
            {
                path: '/settings',
                name: 'SettingsAluno',
                component: SettingsAluno,
            },
            {
                path: '/monitoria',
                name: 'MonitoriaDashboard',
                component: Monitoria,
            },
            {
                path: '/monitoria/detalhes',
                name: 'MonitoriaDetalhes',
                component: MonitoriaDetalhes,
            },
            {
                path: '/monitor',
                name: 'MonitorDashboard',
                component: Monitor,
            },
            {
                path: '/monitor/detalhes',
                name: 'MonitorDetalhes',
                component: MonitorDetalhes,
            },
            {
                path: '/alunomonitoria',
                name: 'AlunoMonitoria',
                component: AlunoMonitoria,
            },
        ]
    },
    {
        path: '/logout',
        name: 'Logout',
        component: Logout,
    },
    // {
    //     path: '/aluno/cadastro',
    //     name: 'Login',
    //     component: Login,
    // },
]

const router = new VueRouter({
    mode: 'history',
    routes
});

export default router
