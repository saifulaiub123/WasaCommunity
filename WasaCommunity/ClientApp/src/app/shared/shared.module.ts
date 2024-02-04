import { CurrencyPipe } from '@angular/common';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { WasaCommunityMaterialModule } from '../modules/material.module';

import { PageHeaderComponent } from './page-header-component/page-header.component';
import { UserEditorComponent } from '../admin/user-editor-component/user-editor.component';
import { AppDialogComponent } from './app-dialog-component/app-dialog.component';

import { GroupByPipe } from '../pipes/group-by.pipe';
import { SplitPipe } from './../pipes/split.pipe';

@NgModule({
    imports: [
        FlexLayoutModule,
        FormsModule, ReactiveFormsModule,
        BrowserModule, BrowserAnimationsModule,
        WasaCommunityMaterialModule,
        TranslateModule
    ],
    exports: [
        FlexLayoutModule,
        FormsModule, ReactiveFormsModule,
        BrowserModule, BrowserAnimationsModule,
        WasaCommunityMaterialModule,
        TranslateModule,
        PageHeaderComponent,
        GroupByPipe,
        UserEditorComponent,
        AppDialogComponent,
        SplitPipe
    ],
    declarations: [
        PageHeaderComponent,
        GroupByPipe,
        UserEditorComponent,
        AppDialogComponent,
        SplitPipe,
    ],
    entryComponents: [
        AppDialogComponent
    ]
})
export class SharedModule {

}
