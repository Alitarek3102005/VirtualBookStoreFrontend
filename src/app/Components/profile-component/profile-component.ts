import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

interface RecentOrder {
  id: string;
  date: string;
  itemCount: number;
  total: number;
  status: 'shipped' | 'pending';
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  memberSince: string;
  ordersPlaced: number;
  reviewsPublished: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, DecimalPipe, FormsModule],
  templateUrl: './profile-component.html',
  styleUrls: ['./profile-component.css']
})
export class ProfileComponent implements AfterViewInit, OnDestroy {
  user: UserProfile = {
    firstName: 'Marcus',
    lastName: 'Chen',
    email: 'marcus.chen@example.com',
    avatar: 'MC',
    memberSince: '2024',
    ordersPlaced: 12,
    reviewsPublished: 4
  };

  newPassword = '';

  recentOrders: RecentOrder[] = [
    { id: 'ORD-88492A', date: 'October 12, 2025', itemCount: 2, total: 42.50, status: 'shipped' },
    { id: 'ORD-88310B', date: 'September 28, 2025', itemCount: 1, total: 29.99, status: 'pending' }
  ];

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initMagneticButtons();
      this.initEntryAnimations();
    }
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.lenis) this.lenis.destroy();
  }

  private initSmoothScroll(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      this.lenis = new Lenis({ duration: 1.2, smooth: true } as any);
      const raf = (time: number) => {
        this.lenis!.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };
      this.rafId = requestAnimationFrame(raf);
    }
  }

  private initMagneticButtons(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      document.querySelectorAll('.magnetic').forEach(elem => {
        elem.addEventListener('mousemove', (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const pos = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const mx = mouseEvent.clientX - pos.left - pos.width / 2;
          const my = mouseEvent.clientY - pos.top - pos.height / 2;
          gsap.to(e.currentTarget, { x: mx * 0.15, y: my * 0.15, duration: 0.3, ease: 'power2.out' });
        });
        elem.addEventListener('mouseleave', (e: Event) => {
          gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
        });
      });
    }
  }

  private initEntryAnimations(): void {
    gsap.from('.gsap-slide', {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.gsap-fade', {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.4
    });
  }

  updateProfile(): void {
    console.log('Updating profile:', this.user);
    if (this.newPassword) {
      console.log('Password changed');
    }
    // Implement actual update logic
  }
}