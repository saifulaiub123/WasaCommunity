// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { SettingsComponent } from './settings-component/settings.component';
import { UserPreferencesComponent } from './user-preferences-component/user-preferences.component';

@NgModule({
    imports: [
        SharedModule
    ],
    exports: [
        SettingsComponent
    ],
    declarations: [
        SettingsComponent,
        UserPreferencesComponent
    ]
})
export class SettingsModule { }
