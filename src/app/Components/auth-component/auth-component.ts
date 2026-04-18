import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './auth-component.html',
  styleUrls: ['./auth-component.css']
})
export class AuthComponent implements AfterViewInit {
  @ViewChild('gsapImg') gsapImg!: ElementRef<HTMLImageElement>;
  @ViewChild('magneticBtn') magneticBtn!: ElementRef<HTMLButtonElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
    }
  }

  private initAnimations(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouch && this.magneticBtn) {
      const btn = this.magneticBtn.nativeElement;
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const pos = btn.getBoundingClientRect();
        const mx = e.clientX - pos.left - pos.width / 2;
        const my = e.clientY - pos.top - pos.height / 2;
        gsap.to(btn, { x: mx * 0.2, y: my * 0.2, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      });
    }

    const tl = gsap.timeline();
    tl.from(this.gsapImg.nativeElement, {
      scale: 1.15,
      duration: 2,
      ease: 'power3.out'
    }).from('.gsap-slide', {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out'
    }, '-=1.5');
  }
}