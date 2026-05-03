import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-failed-component.html',
  styleUrls: ['./payment-failed-component.css']
})
export class PaymentFailedComponent implements AfterViewInit {
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
    }
  }

  private initAnimations(): void {
    const tl = gsap.timeline();

    // 1. Fade in crimson ambient background lights
    gsap.to('.ambient-orb', { 
      opacity: 0.7, duration: 2, stagger: 0.5, ease: 'power2.inOut' 
    });

    // 2. Cinematic card entrance
    tl.from('.premium-glass-card', { 
      opacity: 0, y: 50, scale: 0.98, duration: 1.2, ease: 'expo.out' 
    })
      
    // 3. The Icon bloom (Slightly more aggressive curve for an error state)
    .from('.icon-glow-wrapper', { 
      scale: 0.5, opacity: 0, duration: 0.8, ease: 'back.out(2)' 
    }, '-=0.8')
    .from('.svg-cross-path', { 
      strokeDashoffset: 100, duration: 0.6, ease: 'power4.out' 
    }, '-=0.6')
      
    // 4. Staggered text and button reveal
    .from('.reveal-item', { 
      y: 20, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' 
    }, '-=0.4');

    // Continuous floating animation for the background orbs
    gsap.to('.orb-1', { y: -30, x: 20, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.orb-2', { y: 40, x: -30, duration: 8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  retryPayment(): void {
    // Smooth exit animation before routing back to checkout
    gsap.to('.premium-glass-card', {
      opacity: 0, scale: 0.95, y: 20, duration: 0.4, ease: 'power2.in',
      onComplete: () => this.router.navigate(['/checkout']) // Adjust to your checkout route
    });
  }

  returnToCart(): void {
    gsap.to('.premium-glass-card', {
      opacity: 0, scale: 0.95, y: 20, duration: 0.4, ease: 'power2.in',
      onComplete: () => this.router.navigate(['/cart']) // Adjust to your cart route
    });
  }
}