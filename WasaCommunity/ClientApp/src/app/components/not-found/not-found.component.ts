// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Component } from '@angular/core';
import { fadeInOut } from '../../shared/animations';

@Component({
    selector: 'not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    animations: [fadeInOut]
})
export class NotFoundComponent {
}
