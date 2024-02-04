import { OnDestroy, OnInit, HostListener } from '@angular/core';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { UsersService } from '../../services/users/users.service';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';

import { RoleEditorComponent } from '../role-editor-component/role-editor.component';
import { ThemeManager } from 'src/app/shared/theme-manager';

@Component({
    selector: 'app-edit-user-dialog',
    templateUrl: 'edit-role-dialog.component.html',
    styleUrls: ['edit-role-dialog.component.scss']
})
export class EditRoleDialogComponent implements OnInit, OnDestroy {
    @ViewChild(RoleEditorComponent)
    roleEditor: RoleEditorComponent;
    themeManagerSubscription: any;
    isDarkTheme: boolean;

    get roleName(): any {
        return this.data.role ? { name: this.data.role.name } : null;
    }

    constructor(
        public themeManager: ThemeManager,
        public dialogRef: MatDialogRef<RoleEditorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { role: Role, allPermissions: Permission[] },
        private usersService: UsersService
    ) {
    }

    ngOnInit() {
        this.subscribeToDarkTheme();
    }

    ngAfterViewInit() {
        this.roleEditor.roleSaved$.subscribe(role => this.dialogRef.close(role));
    }

    private subscribeToDarkTheme() {
        this.themeManagerSubscription = this.themeManager._darkTheme.subscribe(isDarkTheme => {
            if (isDarkTheme === true) {
                this.isDarkTheme = true;
            } else {
                this.isDarkTheme = false;
            }
        });
    }

    cancel(): void {
        this.dialogRef.close(null);
    }

    get canManageRoles() {
        return this.usersService.userHasPermission(Permission.manageRolesPermission);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }
}
