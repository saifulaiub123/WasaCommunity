// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

export type PermissionNames =
    'View Users' | 'Manage Users' |
    'View Roles' | 'Manage Roles' | 'Assign Roles' |
    'View Groups' | 'Manage Groups' |
    'View Application Insights';

export type PermissionValues =
    'users.view' | 'users.manage' |
    'roles.view' | 'roles.manage' | 'roles.assign' |
    'groups.view' | 'groups.manage' |
    'applicationInsights.view';

export class Permission {

    public static readonly viewUsersPermission: PermissionValues = 'users.view';
    public static readonly manageUsersPermission: PermissionValues = 'users.manage';

    public static readonly viewRolesPermission: PermissionValues = 'roles.view';
    public static readonly manageRolesPermission: PermissionValues = 'roles.manage';
    public static readonly assignRolesPermission: PermissionValues = 'roles.assign';

    public static readonly viewGroupsPermission: PermissionValues = 'groups.view';
    public static readonly manageGroupsPermission: PermissionValues = 'groups.manage';

    public static readonly viewApplicationInsightsPermission: PermissionValues = 'applicationInsights.view';


    constructor(name?: PermissionNames, value?: PermissionValues, groupName?: string, description?: string) {
        this.name = name;
        this.value = value;
        this.groupName = groupName;
        this.description = description;
    }

    public name: PermissionNames;
    public value: PermissionValues;
    public groupName: string;
    public description: string;
}
