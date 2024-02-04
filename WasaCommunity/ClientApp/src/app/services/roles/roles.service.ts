// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';
import { Observable, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Role } from '../../models/role.model';
import { RolesEndpoint } from './roles-endpoint.service';
import { Permission } from '../../models/permission.model';
import { UsersEndpoint } from '../users/users-endpoint.service';

export type RolesChangedOperation = 'add' | 'delete' | 'modify';
export interface RolesChangedEventArg { roles: Role[] | string[]; operation: RolesChangedOperation; }

@Injectable()
export class RolesService {
  public static readonly roleAddedOperation: RolesChangedOperation = 'add';
  public static readonly roleDeletedOperation: RolesChangedOperation = 'delete';
  public static readonly roleModifiedOperation: RolesChangedOperation = 'modify';

  private _rolesChanged = new Subject<RolesChangedEventArg>();

  constructor(
    private rolesEndpoint: RolesEndpoint, private usersEndpoint: UsersEndpoint) { }


  getRoles(page?: number, pageSize?: number) {

    return this.rolesEndpoint.getRolesEndpoint<Role[]>(page, pageSize);
  }

  getRolesAndPermissions(page?: number, pageSize?: number) {

    return forkJoin(
      this.rolesEndpoint.getRolesEndpoint<Role[]>(page, pageSize),
      this.usersEndpoint.getPermissionsEndpoint<Permission[]>());
  }

  updateRole(role: Role) {
    if (role.id) {
      return this.rolesEndpoint.getUpdateRoleEndpoint(role, role.id).pipe(
        tap(() => this.onRolesChanged([role], RolesService.roleModifiedOperation)));
    } else {
      return this.rolesEndpoint.getRoleByRoleNameEndpoint<Role>(role.name).pipe(
        mergeMap(foundRole => {
          role.id = foundRole.id;
          return this.rolesEndpoint.getUpdateRoleEndpoint(role, role.id);
        }),
        tap(() => this.onRolesChanged([role], RolesService.roleModifiedOperation)));
    }
  }

  newRole(role: Role) {
    return this.rolesEndpoint.getNewRoleEndpoint<Role>(role).pipe<Role>(
      tap(() => this.onRolesChanged([role], RolesService.roleAddedOperation)));
  }

  deleteRole(roleOrRoleId: string | Role): Observable<Role> {

    if (typeof roleOrRoleId === 'string' || roleOrRoleId instanceof String) {
      return this.rolesEndpoint.getDeleteRoleEndpoint<Role>(<string>roleOrRoleId).pipe<Role>(
        tap(data => this.onRolesChanged([data], RolesService.roleDeletedOperation)));
    } else {

      if (roleOrRoleId.id) {
        return this.deleteRole(roleOrRoleId.id);
      } else {
        return this.rolesEndpoint.getRoleByRoleNameEndpoint<Role>(roleOrRoleId.name).pipe<Role>(
          mergeMap(role => this.deleteRole(role.id)));
      }
    }
  }

  private onRolesChanged(roles: Role[] | string[], op: RolesChangedOperation) {
    this._rolesChanged.next({ roles: roles, operation: op });
  }

  onRolesUserCountChanged(roles: Role[] | string[]) {
    return this.onRolesChanged(roles, RolesService.roleModifiedOperation);
  }

  getRolesChangedEvent(): Observable<RolesChangedEventArg> {
    return this._rolesChanged.asObservable();
  }
}
