import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';

@Component({
  selector: 'app-submit-review',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './submit-review-component.html',
  styleUrls: ['./submit-review-component.css']
})
export class SubmitReviewComponent implements AfterViewInit {
  @ViewChild('magneticBtn') magneticBtn!: ElementRef<HTMLButtonElement>;

  rating = '5';
  comment = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMagneticButton();
      this.initEntryAnimations();
    }
  }

  private initMagneticButton(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch && this.magneticBtn) {
      const btn = this.magneticBtn.nativeElement;
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const pos = btn.getBoundingClientRect();
        const mx = e.clientX - pos.left - pos.width / 2;
        const my = e.clientY - pos.top - pos.height / 2;
        gsap.to(btn, { x: mx * 0.15, y: my * 0.15, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      });
    }
  }

  private initEntryAnimations(): void {
    gsap.from('.gsap-fade', {
      opacity: 0,
      scale: 0.9,
      duration: 1.5,
      ease: 'power3.out'
    });
    gsap.from('.gsap-slide', {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.2
    });
  }

  submitReview(): void {
    console.log('Review submitted:', { rating: this.rating, comment: this.comment });
    // Implement actual submission logic
  }
}