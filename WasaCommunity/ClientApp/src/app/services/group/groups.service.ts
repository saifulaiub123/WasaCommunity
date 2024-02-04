// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { AuthService } from '../general/auth.service';
import { UsersEndpoint } from '../users/users-endpoint.service';
import { Injectable } from '@angular/core';
import { GroupsEndpoint } from './groups-endpoint.service';
import { Group } from '../../models/group.model';
import { tap, mergeMap } from 'rxjs/operators';
import { Subject, Observable, forkJoin } from 'rxjs';
import { PermissionValues, Permission } from '../../models/permission.model';
import { User } from '../../models/user.model';


export type GroupsChangedOperation = 'add' | 'delete' | 'modify';
export interface GroupsChangedEventArg { groups: Group[] | string[]; operation: GroupsChangedOperation; }

@Injectable()
export class GroupsService {
    public static readonly groupAddedOperation: GroupsChangedOperation = 'add';
    public static readonly groupDeletedOperation: GroupsChangedOperation = 'delete';
    public static readonly groupModifiedOperation: GroupsChangedOperation = 'modify';

    private _groupsChanged = new Subject<GroupsChangedEventArg>();

    constructor(private groupEndpoint: GroupsEndpoint, private usersEndpoint: UsersEndpoint,
                private authService: AuthService) {
    }

    getGroups(page?: number, pageSize?: number) {

        return this.groupEndpoint.getGroupsEndpoint<Group[]>(page, pageSize);
    }

    getGroupsAndUsers() {
        return forkJoin(
            this.groupEndpoint.getGroupsEndpoint<Group[]>(),
            this.usersEndpoint.getUsersEndpoint<User[]>()
        );
    }

    updateGroup(group: Group) {
        if (group.id) {
            return this.groupEndpoint.getUpdateGroupEndpoint(group, group.id).pipe(
                tap(data => this.onGroupsChanged([group], GroupsService.groupModifiedOperation)));
        } else {
            return this.groupEndpoint.getGroupByGroupNameEndpoint<Group>(group.name).pipe(
                mergeMap(foundGroup => {
                    group.id = foundGroup.id;
                    return this.groupEndpoint.getUpdateGroupEndpoint(group, group.id);
                }),
                tap(data => this.onGroupsChanged([group], GroupsService.groupModifiedOperation)));
        }
    }

    newGroup(group: Group) {
        return this.groupEndpoint.getNewGroupEndpoint<Group>(group).pipe<Group>(
            tap(data => this.onGroupsChanged([group], GroupsService.groupAddedOperation)));
    }

    deleteGroup(groupOrGroupId: string | Group): Observable<Group> {

        if (typeof groupOrGroupId === 'string' || groupOrGroupId instanceof String) {
            return this.groupEndpoint.getDeleteGroupEndpoint<Group>(<string>groupOrGroupId).pipe<Group>(
                tap(data => this.onGroupsChanged([data], GroupsService.groupDeletedOperation)));
        } else {

            if (groupOrGroupId.id) {
                return this.deleteGroup(groupOrGroupId.id);
            } else {
                return this.groupEndpoint.getGroupByGroupNameEndpoint<Group>(groupOrGroupId.name).pipe<Group>(
                    mergeMap(group => this.deleteGroup(group.id)));
            }
        }
    }

    getMembersForGroup(group: Group) {
        return this.groupEndpoint.getMembersForGroupEndpoint<User[]>(group.id);
    }

    private onGroupsChanged(groups: Group[] | string[], op: GroupsChangedOperation) {
        this._groupsChanged.next({ groups: groups, operation: op });
    }

    getPermissions() {
        return this.usersEndpoint.getPermissionsEndpoint<Permission[]>();
    }

    userHasPermission(permissionValue: PermissionValues): boolean {
        return this.permissions.some(p => p === permissionValue);
    }

    get permissions(): PermissionValues[] {
        return this.authService.userPermissions;
    }
}

