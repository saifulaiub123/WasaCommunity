/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { WasaCommunityMaterialModule } from './modules/material.module';
import { FooterModule } from './shared/footer-component/footer.component';
import { ThemePickerModule } from './shared/theme-picker-component/theme-picker.component';

import { AppComponent } from './app.component';
import { LoginControlComponent } from './components/login/login-control/login-control.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ToastaModule } from 'ngx-toasta';

import { AuthService } from './services/general/auth.service';
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

describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                FormsModule, ReactiveFormsModule,
                BrowserAnimationsModule,
                RouterTestingModule,
                WasaCommunityMaterialModule,
                FooterModule,
                ThemePickerModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateLanguageLoader
                    }
                }),
                ToastaModule.forRoot(),
            ],
            declarations: [
                AppComponent,
                LoginControlComponent,
            ],
            providers: [
                AuthService,
                NotificationMessagesService,
                ConfigurationService,
                AppTitleService,
                AppTranslationService,
                NotificationService,
                NotificationEndpoint,
                UsersService,
                UsersEndpoint,
                LocalStoreManager,
                EndpointFactory
            ]
        }).compileComponents();
    }));
});
