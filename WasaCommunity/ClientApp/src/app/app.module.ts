// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { AlertMessagesService } from './services/alerts/alert-messages.service';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ToastaModule } from 'ngx-toasta';
import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppErrorHandler } from './app-error.handler';

import { SharedModule } from './shared/shared.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { FooterModule } from './shared/footer-component/footer.component';
import { ThemePickerModule } from './shared/theme-picker-component/theme-picker.component';

import { AppTitleService } from './services/general/app-title.service';
import { AppTranslationService, TranslateLanguageLoader } from './services/general/app-translation.service';
import { ConfigurationService } from './services/general/configuration.service';
import { NotificationMessagesService } from './services/notification/notification-messages.service';
import { LocalStoreManager } from './services/general/local-store-manager.service';
import { EndpointFactory } from './services/general/endpoint-factory.service';
import { NotificationService } from './services/notification/notification.service';
import { NotificationEndpoint } from './services/notification/notification-endpoint.service';
import { UsersService } from './services/users/users.service';
import { UsersEndpoint } from './services/users/users-endpoint.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login/login.component';
import { LoginControlComponent } from './components/login/login-control/login-control.component';
import { LoginDialogComponent } from './components/login/login-dialog/login-dialog.component';
import { DashboardPageComponent } from './components/dashboard/dashboard-page/dashboard-page.component';
import { AboutComponent } from './components/about/about.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PeopleComponent } from './components/people/people.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UsersFilterPipe } from './pipes/users-filter.pipe';
import { FromNowPipe } from './pipes/from-now.pipe';

import { DxPopoverModule, DxButtonModule, DxPopupModule, DxTemplateModule, DxSchedulerModule, DxChartModule, DxCalendarModule, DxDateBoxModule } from 'devextreme-angular';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { ChatMessagesService } from './services/chat/chat-messages.service';
import { ChatThreadsService } from './services/chat/chat-threads.service';

import { ChatService } from './services/chat/chat.service';
import { ChatThreadComponent } from './components/chat/chat-thread/chat-thread.component';
import { ChatWindowComponent } from './components/chat/chat-window/chat-window.component';
import { ChatThreadsComponent } from './components/chat/chat-threads/chat-threads.component';
import { ChatPageComponent } from './components/chat/chat-page/chat-page.component';
import { ChatMessageComponent } from './components/chat/chat-message/chat-message.component';

import { EllipsisModule } from '@thisissoon/angular-ellipsis';
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';

import { AlertsPageComponent } from './components/alerts/alerts-page/alerts-page.component';
import { AlertComponent } from './components//alerts/alert/alert.component';
import { AlertsService } from './services/alerts/alerts.service';
import { AlertDetailsComponent } from './components/alerts/alert-details/alert-details.component';
import { AlertCreateComponent } from './components/alerts/alert-create/alert-create.component';
import { GroupsEndpoint } from './services/group/groups-endpoint.service';

import { GroupsService } from './services/group/groups.service';
import { SignalRService } from './services/general/signal-r.service';
import { AlertsFilterPipe } from './pipes/alerts-filter.pipe';
import { InvoicedChartComponent } from './components/dashboard/invoiced-chart/invoiced-chart.component';

import { DashboardService } from './services/dashboard/dashboard.service';
import { DashboardEndpoint } from './services/dashboard/dashboard-endpoint.service';

import { RolesService } from 'src/app/services/roles/roles.service';
import { RolesEndpoint } from './services/roles/roles-endpoint.service';
import { OrderstockChartComponent } from './components/dashboard/orderstock-chart/orderstock-chart.component';
import { OrdersByPersonChartComponent } from './components/dashboard/ordersbyperson-chart/ordersbyperson-chart.component';
import { OrderDetailsComponent } from './components/dashboard/order-details/order-details.component';

import { LoggingService } from './services/general/logging.service';
import { CurrencyPipe } from '@angular/common';
import { LoggingEndpointService } from './services/general/logging-endpoint.service';
import { ApplicationInsightsComponent } from './components/application-insights/application-insights-page/application-insights.component';
import { ActiveUsersComponent } from './components/application-insights/active-users/active-users.component';
import { MostUsedFeaturesComponent } from './components/application-insights/most-used-features/most-used-features.component';
import { AveragePerformanceComponent } from './components/application-insights/average-performance/average-performance.component';
import { FrontendErrorsComponent } from './components/application-insights/frontend-errors/frontend-errors.component';
import { BackendErrorsComponent } from './components/application-insights/backend-errors/backend-errors.component';
import { FrontendErrorDetailsComponent } from './components/application-insights/frontend-errors/frontend-error-details/frontend-error-details.component';
import { BackendErrorDetailsComponent } from './components/application-insights/backend-errors/backend-error-details/backend-error-details.component';
import { BackendExceptionDetailsComponent } from './components/application-insights/backend-errors/backend-exception-details/backend-exception-details.component';
import { AveragePerformanceDetailsComponent } from './components/application-insights/average-performance/average-performance-details/average-performance-details.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ChatNotificationComponent } from './components/chat/chat-notification/chat-notification.component';
import { AlertNotificationComponent } from './components/alerts/alert-notification/alert-notification.component';
import { PushNotificationService } from './services/notification/push-notification.service';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
  };



@NgModule({
    imports: [
        SharedModule,
        FooterModule,
        ThemePickerModule,
        HttpClientModule,
        AdminModule,
        SettingsModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: TranslateLanguageLoader
            }
        }),
        ToastaModule.forRoot(),
        ChartsModule,
        NgbModule.forRoot(),
        DxButtonModule,
        DxPopupModule,
        DxPopoverModule,
        DxTemplateModule,
        DxSchedulerModule,
        DxChartModule,
        DxCalendarModule,
        DxDateBoxModule,
        EllipsisModule,
        PerfectScrollbarModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    declarations: [
        AppComponent,
        LoginComponent, LoginControlComponent, LoginDialogComponent,
        DashboardPageComponent,
        AboutComponent,
        NotFoundComponent,
        PeopleComponent,
        UsersFilterPipe,
        AlertsFilterPipe,
        FromNowPipe,
        SchedulerComponent,
        ChatPageComponent,
        ChatThreadsComponent,
        ChatThreadComponent,
        ChatWindowComponent,
        ChatMessageComponent,
        AlertsPageComponent,
        AlertComponent,
        AlertDetailsComponent,
        AlertCreateComponent,
        InvoicedChartComponent,
        OrderstockChartComponent,
        OrdersByPersonChartComponent,
        OrderDetailsComponent,
        ApplicationInsightsComponent,
        ActiveUsersComponent,
        MostUsedFeaturesComponent,
        AveragePerformanceComponent,
        FrontendErrorsComponent,
        BackendErrorsComponent,
        FrontendErrorDetailsComponent,
        BackendErrorDetailsComponent,
        BackendExceptionDetailsComponent,
        AveragePerformanceDetailsComponent,
        ChatNotificationComponent,
        AlertNotificationComponent,
    ],
    providers: [
        { provide: 'BASE_URL', useFactory: getBaseUrl },
        { provide: ErrorHandler, useClass: AppErrorHandler },
        { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
        NotificationMessagesService,
        ConfigurationService,
        AppTitleService,
        AppTranslationService,
        NotificationService,
        NotificationEndpoint,
        UsersService,
        UsersEndpoint,
        RolesService,
        RolesEndpoint,
        ChatService,
        LocalStoreManager,
        EndpointFactory,
        DatePipe,
        CurrencyPipe,
        ChatMessagesService,
        ChatThreadsService,
        AlertsService,
        AlertMessagesService,
        GroupsEndpoint,
        GroupsService,
        SignalRService,
        DashboardEndpoint,
        DashboardService,
        LoggingService,
        LoggingEndpointService,
        PushNotificationService
    ],
    entryComponents: [
        LoginDialogComponent,
        AlertDetailsComponent,
        AlertCreateComponent,
        SchedulerComponent,
        OrderDetailsComponent,
        FrontendErrorDetailsComponent,
        BackendErrorDetailsComponent,
        BackendExceptionDetailsComponent,
        AveragePerformanceDetailsComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}
