
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login/login.component';
import { DashboardPageComponent } from './components/dashboard/dashboard-page/dashboard-page.component';
import { SettingsComponent } from './settings/settings-component/settings.component';
import { AboutComponent } from './components/about/about.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AuthService } from './services/general/auth.service';
import { AuthGuard } from './services/general/auth-guard.service';
import { PeopleComponent } from './components/people/people.component';
import { ChatPageComponent } from './components/chat/chat-page/chat-page.component';
import { AlertsPageComponent } from './components/alerts/alerts-page/alerts-page.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: '', component: DashboardPageComponent, canActivate: [AuthGuard], data: { title: 'Dashboard' } },
            { path: 'login', component: LoginComponent, data: { title: 'Login' } },
            { path: 'people', component: PeopleComponent, canActivate: [AuthGuard], data: { title: 'People' } },
            { path: 'chat', component: ChatPageComponent, canActivate: [AuthGuard], data: { title: 'Chat' } },
            { path: 'chat/:id', component: ChatPageComponent, canActivate: [AuthGuard], data: { title: 'Chat' } },
            { path: 'alerts', component: AlertsPageComponent, canActivate: [AuthGuard], data: { title: 'Alerts' } },
            { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { title: 'Settings' } },
            { path: 'about', component: AboutComponent, data: { title: 'About Us' } },
            { path: 'dashboard', redirectTo: '/', pathMatch: 'full' },
            { path: '**', component: NotFoundComponent, data: { title: 'Page Not Found' } },
        ])
    ],
    exports: [
        RouterModule
    ],
    providers: [
        AuthService, AuthGuard
    ]
})
export class AppRoutingModule { }
