import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { OrderService } from '../../Services/order-service';
import { AuthService } from '../../Services/auth-service';

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
export class OrderHistoryComponent implements AfterViewInit, OnDestroy, OnInit {
  orders:any[] = [];

  private lenis: Lenis | null = null;
  private rafId: number | null = null;
  quantityOfItems: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
  private orderService: OrderService,
  private authService: AuthService
) { }

  ngOnInit(): void {
    this.orderService.getOrderHistory(this.authService.getCurrentUserId() || 0).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (err) => {
        console.error('Error fetching order history:', err);
        alert('An error occurred while fetching your order history. Please try again later.');
      }
    });
  }

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
  getquantityOfItems(order: any): number {
    let total = 0;
    if (order.orderItems && Array.isArray(order.orderItems)) {
      order.orderItems.forEach((item: any) => {
        if (item.quantity) {
          total += item.quantity;
        }
      });
    }
    return total;
  }
}
  