import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

interface OrderItem {
  title: string;
  author: string;
  price: number;
  quantity: number;
  coverImage: string;
}

interface TimelineStep {
  title: string;
  date: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-order-manifest',
  standalone: true,
  imports: [RouterLink, CommonModule, DecimalPipe],
  templateUrl: './order-manifest-component.html',
  styleUrls: ['./order-manifest-component.css']
})
export class OrderManifestComponent implements AfterViewInit, OnDestroy {
  orderId = 'ORD-88492A';
  orderDate = 'October 12, 2025';
  status = 'shipped' as 'shipped' | 'pending';

  orderItems: OrderItem[] = [
    {
      title: 'The Silent Echo',
      author: 'Elena Rostov',
      price: 24.0,
      quantity: 1,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'Fading Light',
      author: 'Marcus Chen',
      price: 18.5,
      quantity: 1,
      coverImage: 'https://images.unsplash.com/photo-1629196914561-bd804b49463e?auto=format&fit=crop&q=80&w=400'
    }
  ];

  timelineSteps: TimelineStep[] = [
    { title: 'Order Initialized', date: 'Oct 12, 2025 - 14:32 EST', completed: true, active: false },
    { title: 'Payment Confirmed', date: 'Oct 12, 2025 - 14:35 EST', completed: true, active: false },
    { title: 'Manifest Prepared', date: 'Oct 13, 2025 - 09:15 EST', completed: true, active: false },
    { title: 'Dispatched (Shipped)', date: 'Oct 14, 2025 - 08:00 EST', completed: false, active: true },
    { title: 'Delivery Pending', date: 'Estimated: Oct 18, 2025', completed: false, active: false }
  ];

  shippingInfo = {
    name: 'Marcus Chen',
    address: '1042 Quantum Avenue, Suite 300',
    city: 'Neo-Tokyo',
    state: 'NY',
    zip: '10001',
    country: 'United States'
  };

  paymentInfo = {
    processor: 'Stripe',
    cardBrand: 'Visa',
    last4: '4242'
  };

  shippingCost = 5.0;
  taxRate = 0.08;

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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
          gsap.to(e.currentTarget, { x: mx * 0.1, y: my * 0.1, duration: 0.3, ease: 'power2.out' });
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
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.4
    });
  }

  get subtotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get tax(): number {
    return this.subtotal * this.taxRate;
  }

  get grandTotal(): number {
    return this.subtotal + this.shippingCost + this.tax;
  }

  get statusClass(): string {
    return this.status === 'shipped' ? 'status-shipped' : 'status-pending';
  }

  get statusText(): string {
    return this.status === 'shipped' ? 'Status: Shipped' : 'Status: Pending';
  }

  printManifest(): void {
    window.print();
  }
}