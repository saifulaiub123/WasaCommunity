// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { BackendErrorLog } from './backend-error-log.model';

export class BackendErrorsByLocation {

    constructor(public location?: string, public amountOfErrors?: number, public amountOfUsersAffected?: number,
                public errors?: BackendErrorLog[]) {
     }
}
