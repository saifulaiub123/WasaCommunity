// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { FrontendErrorLog } from './frontend-error-log.model';

export class FrontendErrorsByLocation {

    constructor(public location?: string, public amountOfErrors?: number, public amountOfUsersAffected?: number,
                public errors?: FrontendErrorLog[]) {
     }
}
