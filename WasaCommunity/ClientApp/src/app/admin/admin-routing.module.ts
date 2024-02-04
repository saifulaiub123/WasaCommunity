import { ApplicationInsightsComponent } from './../components/application-insights/application-insights-page/application-insights.component';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin-component/admin.component';
import { RoleListComponent } from './role-list-component/role-list.component';
import { UserListComponent } from './user-list-component/user-list.component';
import { AuthService } from '../services/general/auth.service';
import { AuthGuard } from '../services/general/auth-guard.service';
import { GroupListComponent } from './group-list-component/group-list.component';

const adminRoutes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        children: [
            { path: 'users', component: UserListComponent, canActivate: [AuthGuard], data: { title: 'Admin | Users' } },
            { path: 'roles', component: RoleListComponent, canActivate: [AuthGuard], data: { title: 'Admin | Roles' } },
            { path: 'groups', component: GroupListComponent, canActivate: [AuthGuard], data: { title: 'Admin | Groups' } },
            { path: 'application-insights', component: ApplicationInsightsComponent, canActivate: [AuthGuard], data: { title: 'Admin | Application Insights' } }

        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(adminRoutes)
    ],
    exports: [
        RouterModule
    ],
    providers: [
        AuthService, AuthGuard
    ]
})
export class AdminRoutingModule { }
