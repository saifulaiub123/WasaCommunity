// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { AdminRoutingModule } from './admin-routing.module';

import { AdminComponent } from './admin-component/admin.component';
import { RoleListComponent } from './role-list-component/role-list.component';
import { EditRoleDialogComponent } from './edit-role-dialog-component/edit-role-dialog.component';
import { RoleEditorComponent } from './role-editor-component/role-editor.component';
import { UserListComponent } from './user-list-component/user-list.component';
import { EditUserDialogComponent } from './edit-user-dialog-component/edit-user-dialog.component';
import { GroupListComponent } from './group-list-component/group-list.component';
import { EditGroupDialogComponent } from './edit-group-dialog-component/edit-group-dialog.component';
import { GroupEditorComponent } from './group-editor-component/group-editor.component';


@NgModule({
    imports: [
        SharedModule,
        AdminRoutingModule
    ],
    declarations: [
        AdminComponent,
        RoleListComponent,
        EditRoleDialogComponent,
        RoleEditorComponent,
        UserListComponent,
        EditUserDialogComponent,
        GroupListComponent,
        EditGroupDialogComponent,
        GroupEditorComponent,
    ],
    entryComponents: [
        EditUserDialogComponent,
        EditRoleDialogComponent,
        EditGroupDialogComponent
    ]
})
export class AdminModule {

}
