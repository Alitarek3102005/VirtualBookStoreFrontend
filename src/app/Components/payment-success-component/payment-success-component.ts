import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success-component.html',
  styleUrls: ['./payment-success-component.css']
})
export class PaymentSuccessComponent implements AfterViewInit {
  
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

    // 1. Fade in ambient background lights
    gsap.to('.ambient-orb', { 
      opacity: 0.6, duration: 2, stagger: 0.5, ease: 'power2.inOut' 
    });

    // 2. Cinematic card entrance
    tl.from('.premium-glass-card', { 
      opacity: 0, y: 50, scale: 0.98, duration: 1.2, ease: 'expo.out' 
    })
      
    // 3. The Icon bloom
    .from('.icon-glow-wrapper', { 
      scale: 0.5, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.5)' 
    }, '-=0.8')
    .from('.svg-check-path', { 
      strokeDashoffset: 100, duration: 0.8, ease: 'power3.out' 
    }, '-=0.6')
      
    // 4. Staggered text and button reveal
    .from('.reveal-item', { 
      y: 20, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' 
    }, '-=0.4');

    // Continuous floating animation for the background orbs
    gsap.to('.orb-1', { y: -30, x: 20, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.orb-2', { y: 40, x: -30, duration: 8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  continueBrowsing(): void {
    // Add a quick exit animation before routing
    gsap.to('.premium-glass-card', {
      opacity: 0, scale: 0.95, y: -20, duration: 0.4, ease: 'power2.in',
      onComplete: () => this.router.navigate(['/catalog'])
    });
  }
}