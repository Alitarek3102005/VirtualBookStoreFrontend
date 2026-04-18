import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

interface Order {
  id: string;
  date: string;
  itemCount: number;
  total: number;
  status: 'shipped' | 'pending' | 'delivered';
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, CommonModule, DecimalPipe],
  templateUrl: './order-history-component.html',
  styleUrls: ['./order-history-component.css']
})
export class OrderHistoryComponent implements AfterViewInit, OnDestroy {
  orders: Order[] = [
    { id: 'ORD-88492A', date: 'Oct 12, 2025', itemCount: 2, total: 50.90, status: 'shipped' },
    { id: 'ORD-88310B', date: 'Sep 28, 2025', itemCount: 1, total: 29.99, status: 'pending' },
    { id: 'ORD-87104C', date: 'Aug 04, 2025', itemCount: 4, total: 145.00, status: 'delivered' },
    { id: 'ORD-86992D', date: 'Jul 15, 2025', itemCount: 1, total: 18.50, status: 'delivered' },
    { id: 'ORD-85221E', date: 'May 22, 2025', itemCount: 3, total: 84.00, status: 'delivered' }
  ];

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
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
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.4
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'shipped': return 'status-shipped';
      case 'pending': return 'status-pending';
      case 'delivered': return 'status-delivered';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  trackById(index: number, order: Order): string {
    return order.id;
  }
}