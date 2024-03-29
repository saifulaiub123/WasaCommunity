// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer, FooterModule } from './footer.component';

describe('Footer', () => {
    let fixture: ComponentFixture<Footer>;
    let component: Footer;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FooterModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Footer);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should have a link to author', () => {
        const link = fixture
            .nativeElement
            .querySelector('.app-footer-link a');
        const href = link.getAttribute('href');
        const text = link.textContent;
        expect(href).toContain('https://www.wasasweden.se');
        expect(text).toContain('www.wasasweden.se');
    });
});
