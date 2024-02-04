// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { BaseLog } from './base-log.model';

export class PerformanceLog extends BaseLog {

    constructor(public elapsedMilliseconds?: number) {
        super();
     }
}
