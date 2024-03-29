import { ThemeManager } from 'src/app/shared/theme-manager';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, ViewChild, Inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';

import { UserEditorComponent } from '../user-editor-component/user-editor.component';

@Component({
    selector: 'app-edit-user-dialog',
    templateUrl: 'edit-user-dialog.component.html',
    styleUrls: ['edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit, OnDestroy {
    @ViewChild(UserEditorComponent)
    editUser: UserEditorComponent;
    themeManagerSubscription: any;
    isDarkTheme: boolean;

    get userName(): any {
        return this.data.user ? { name: this.data.user.userName } : null;
    }

    constructor(
        public themeManager: ThemeManager,
        public dialogRef: MatDialogRef<EditUserDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { user: User, roles: Role[] }) {
    }

    ngOnInit() {
        this.subscribeToDarkTheme();
    }

    ngAfterViewInit() {
        this.editUser.userSaved$.subscribe(user => this.dialogRef.close(user));
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

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }
}
