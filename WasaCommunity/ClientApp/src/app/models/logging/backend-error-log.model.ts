// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { BaseLog } from './base-log.model';

export class BackendErrorLog extends BaseLog {

    constructor(public customException?: string) {
        super();
     }
}
