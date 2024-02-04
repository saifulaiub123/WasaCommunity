// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { BaseLog } from './base-log.model';

export class FrontendErrorLog extends BaseLog {

    constructor(public originalMessage?: string) {
        super();
     }
}
