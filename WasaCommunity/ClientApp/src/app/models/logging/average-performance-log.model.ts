// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { PerformanceLog } from './performance-log.model';

export class AveragePerformanceLog {

    constructor(public message?: string, public averageMilliseconds?: number, public performanceLogs?: PerformanceLog[]) {
    }
}
