// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { slide } from '../animations';
import { Component, NgModule, Input } from '@angular/core';

@Component({
    selector: 'app-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss'],
    animations: [
        slide
    ]
})
export class PageHeaderComponent {
    @Input()
    title: string;

    @Input()
    icon: string;
}
