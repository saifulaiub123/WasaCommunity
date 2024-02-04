// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Permission } from './permission.model';


export class Role {

    constructor(public name?: string, public description?: string,
                public permissions?: Permission[]) {

    }

    public id: string;
    public usersCount: number;
}
