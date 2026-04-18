// order-management.component.ts
import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, TitleCasePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

interface Order {
  id: string;
  timestamp: string;
  timeCode: string;
  customerName: string;
  customerEmail: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: string[];
}

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, DecimalPipe, TitleCasePipe, FormsModule],
  templateUrl: './order-management-component.html',
  styleUrls: ['./order-management-component.css']
})
export class OrderManagementComponent implements AfterViewInit, OnDestroy {
  @ViewChild('globalSearch') globalSearch!: ElementRef<HTMLInputElement>;
  @ViewChild('slideBackdrop') slideBackdrop!: ElementRef<HTMLElement>;
  @ViewChild('slidePanel') slidePanel!: ElementRef<HTMLElement>;
  @ViewChild('statusSelect') statusSelect!: ElementRef<HTMLSelectElement>;

  // Filters
  statusFilter: string = 'All Statuses';
  dateFilter: string = 'Last 30 Days';

  // Orders data
  orders: Order[] = [
    {
      id: 'ORD-88492A',
      timestamp: 'Oct 18, 2025',
      timeCode: '14:32:01 EST',
      customerName: 'Marcus Chen',
      customerEmail: 'marcus.c@example.com',
      status: 'Pending',
      total: 50.90,
      items: ['The Silent Echo (x1)', 'Brutalist Forms (x1)']
    },
    {
      id: 'ORD-88491B',
      timestamp: 'Oct 18, 2025',
      timeCode: '14:15:22 EST',
      customerName: 'Sarah Jenkins',
      customerEmail: 's.jenkins@domain.com',
      status: 'Shipped',
      total: 24.00,
      items: ['Design Systems (x1)']
    },
    {
      id: 'ORD-88490C',
      timestamp: 'Oct 15, 2025',
      timeCode: '09:12:44 EST',
      customerName: 'Elena Rostov',
      customerEmail: 'elena.r@studio.net',
      status: 'Delivered',
      total: 125.50,
      items: ['Fading Light (x2)', 'Modern Typography (x1)']
    },
    {
      id: 'ORD-88489D',
      timestamp: 'Oct 14, 2025',
      timeCode: '18:40:05 EST',
      customerName: 'David Alistair',
      customerEmail: 'david.a@mail.com',
      status: 'Cancelled',
      total: 65.00,
      items: ['Brutalist Forms (x1)']
    }
  ];

  // Slide-over state
  slideOverVisible = false;
  selectedOrder: Order | null = null;
  newStatus: string = '';

  // Toast
  toastMessage: string | null = null;
  toastSuccess = true;
  toastVisible = false;

  // Smooth scroll
  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initKeyboardShortcuts();
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

  private initKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.globalSearch.nativeElement.focus();
      }
    });
  }

  private initEntryAnimations(): void {
    gsap.from('.gsap-slide', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.1
    });
    gsap.from('.gsap-fade', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.3
    });
  }

  private showToast(message: string, success = true): void {
    this.toastMessage = message;
    this.toastSuccess = success;
    this.toastVisible = true;

    gsap.to('.toast', { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });

    setTimeout(() => {
      gsap.to('.toast', {
        x: 120,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => {
          this.toastVisible = false;
          this.toastMessage = null;
        }
      });
    }, 3500);
  }

  get pendingCount(): number {
    return this.orders.filter(o => o.status === 'Pending').length;
  }

  get filteredOrders(): Order[] {
    return this.orders.filter(order => {
      if (this.statusFilter !== 'All Statuses' && order.status !== this.statusFilter) {
        return false;
      }
      // Date filter logic could be implemented here
      return true;
    });
  }

  openOrderManifest(order: Order): void {
    this.selectedOrder = { ...order };
    this.newStatus = order.status;
    this.slideOverVisible = true;
  }

  closeSlideOver(): void {
    this.slideOverVisible = false;
    this.selectedOrder = null;
  }

  saveOrderStatus(): void {
    if (!this.selectedOrder || !this.newStatus) return;

    const orderId = this.selectedOrder.id;
    const newStatus = this.newStatus as Order['status'];

    // Simulate network delay
    setTimeout(() => {
      // Update the order in the array
      const index = this.orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        this.orders[index].status = newStatus;
      }

      this.showToast(`Logistics status for ${orderId} updated to ${newStatus}.`);
      this.closeSlideOver();
    }, 800);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  exportManifests(): void {
    this.showToast('Manifests exported successfully.', true);
  }
  
}