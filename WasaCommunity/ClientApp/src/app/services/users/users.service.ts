// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';
import { Observable, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { UsersEndpoint } from './users-endpoint.service';
import { AuthService } from '../general/auth.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { PermissionValues, Permission } from '../../models/permission.model';
import { UserEdit } from '../../models/user-edit.model';
import { RolesEndpoint } from '../roles/roles-endpoint.service';
import { RolesService } from 'src/app/services/roles/roles.service';


export type RolesChangedOperation = 'add' | 'delete' | 'modify';
export interface RolesChangedEventArg { roles: Role[] | string[]; operation: RolesChangedOperation; }

@Injectable()
export class UsersService {

    public static readonly roleAddedOperation: RolesChangedOperation = 'add';
    public static readonly roleDeletedOperation: RolesChangedOperation = 'delete';
    public static readonly roleModifiedOperation: RolesChangedOperation = 'modify';

    private _rolesChanged = new Subject<RolesChangedEventArg>();

    constructor(
        private authService: AuthService,
        private usersEndpoint: UsersEndpoint,
        private rolesEndpoint: RolesEndpoint) { }

    getUser(userId?: string): Observable<User> {
        return this.usersEndpoint.getUserEndpoint<User>(userId);
    }

    getUserAndRoles(userId?: string) {

        return forkJoin(
            this.usersEndpoint.getUserEndpoint<User>(userId),
            this.rolesEndpoint.getRolesEndpoint<Role[]>());
    }

    getUsers(page?: number, pageSize?: number) {

        return this.usersEndpoint.getUsersEndpoint<User[]>(page, pageSize);
    }

    getUsersAndRoles(page?: number, pageSize?: number) {

        return forkJoin(
            this.usersEndpoint.getUsersEndpoint<User[]>(page, pageSize),
            this.rolesEndpoint.getRolesEndpoint<Role[]>());
    }


    updateUser(user: UserEdit) {
        if (user.id) {
            return this.usersEndpoint.getUpdateUserEndpoint(user, user.id);
        } else {
            return this.usersEndpoint.getUserByUserNameEndpoint<User>(user.userName).pipe<User>(
                mergeMap(foundUser => {
                    user.id = foundUser.id;
                    return this.usersEndpoint.getUpdateUserEndpoint(user, user.id);
                }));
        }
    }

    newUser(user: UserEdit) {
        return this.usersEndpoint.getNewUserEndpoint<User>(user);
    }

    getUserPreferences() {
        return this.usersEndpoint.getUserPreferencesEndpoint<string>();
    }

    updateUserPreferences(configuration: string) {
        return this.usersEndpoint.getUpdateUserPreferencesEndpoint(configuration);
    }

    deleteUser(userOrUserId: string | User): Observable<User> {
        if (typeof userOrUserId === 'string' || userOrUserId instanceof String) {
            return this.usersEndpoint.getDeleteUserEndpoint<User>(<string>userOrUserId).pipe<User>(
                tap(data => this.onRolesUserCountChanged(data.roles)));
        } else {
            if (userOrUserId.id) {
                return this.deleteUser(userOrUserId.id);
            } else {
                return this.usersEndpoint.getUserByUserNameEndpoint<User>(userOrUserId.userName).pipe<User>(
                    mergeMap(user => this.deleteUser(user.id)));
            }
        }
    }

    unblockUser(userId: string) {
        return this.usersEndpoint.getUnblockUserEndpoint(userId);
    }

    userHasPermission(permissionValue: PermissionValues): boolean {
        return this.permissions.some(p => p === permissionValue);
    }

    refreshLoggedInUser() {
        return this.authService.refreshLogin();
    }

    private onRolesChanged(roles: Role[] | string[], op: RolesChangedOperation) {
        this._rolesChanged.next({ roles: roles, operation: op });
    }

    onRolesUserCountChanged(roles: Role[] | string[]) {
        return this.onRolesChanged(roles, RolesService.roleModifiedOperation);
    }

    getPermissions() {

        return this.usersEndpoint.getPermissionsEndpoint<Permission[]>();
    }

    get permissions(): PermissionValues[] {
        return this.authService.userPermissions;
    }

    get currentUser() {
        return this.authService.currentUser;
    }
}
