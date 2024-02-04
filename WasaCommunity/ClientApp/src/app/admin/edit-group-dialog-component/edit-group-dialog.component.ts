import { OnInit, OnDestroy, HostListener } from '@angular/core';
// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { UsersService } from '../../services/users/users.service';
import { Permission } from '../../models/permission.model';

import { GroupEditorComponent } from '../group-editor-component/group-editor.component';
import { Group } from 'src/app/models/group.model';
import { User } from 'src/app/models/user.model';
import { ThemeManager } from 'src/app/shared/theme-manager';

@Component({
    selector: 'edit-group-dialog',
    templateUrl: 'edit-group-dialog.component.html',
    styleUrls: ['edit-group-dialog.component.scss']
})
export class EditGroupDialogComponent implements OnInit, OnDestroy {
    @ViewChild(GroupEditorComponent)
    groupEditor: GroupEditorComponent;
    themeManagerSubscription: any;
    isDarkTheme: boolean;

    get groupName(): any {
        return this.data.group ? { name: this.data.group.name } : null;
    }

    constructor(
        public themeManager: ThemeManager,
        public dialogRef: MatDialogRef<GroupEditorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { group: Group, users: User[] },
        private usersService: UsersService
    ) {
    }

    ngOnInit() {
        this.subscribeToDarkTheme();
    }

    ngAfterViewInit() {
        this.groupEditor.groupSaved$.subscribe(group => this.dialogRef.close(group));
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

    get canManageGroups() {
        return this.usersService.userHasPermission(Permission.manageGroupsPermission);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        if (this.themeManagerSubscription) {
            this.themeManagerSubscription.unsubscribe();
        }
    }
}
