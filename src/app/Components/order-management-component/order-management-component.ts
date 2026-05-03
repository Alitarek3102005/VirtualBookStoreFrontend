import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, TitleCasePipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import { BookService } from '../../Services/book-service';
import { Book } from '../../Models/book';
import { OrderService } from '../../Services/order-service';
import { Order } from '../../Models/order';
@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, DecimalPipe, TitleCasePipe, FormsModule, DatePipe],
  templateUrl: './order-management-component.html',
  styleUrls: ['./order-management-component.css']
})
export class OrderManagementComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('globalSearch') globalSearch!: ElementRef<HTMLInputElement>;
  @ViewChild('slideBackdrop') slideBackdrop!: ElementRef<HTMLElement>;
  @ViewChild('slidePanel') slidePanel!: ElementRef<HTMLElement>;
  statusFilter: string = 'All Statuses';
  dateFilter: string = 'Last 30 Days';
  orders: Order[] = [];
  
  loadedBooks: { [bookId: number]: Book } = {};

  slideOverVisible = false;
  selectedOrder: Order | null = null;
  newStatus: string = '';

  toastMessage: string | null = null;
  toastSuccess = true;
  toastVisible = false;

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private orderService: OrderService,
    private bookService: BookService 
  ) {}

  ngOnInit(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => this.orders = data,
      error: (err) => console.error(err)
    });
  }

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
    gsap.from('.gsap-slide', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.1 });
    gsap.from('.gsap-fade', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 });
  }

  private showToast(message: string, success = true): void {
    this.toastMessage = message;
    this.toastSuccess = success;
    this.toastVisible = true;

    gsap.to('.toast', { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });

    setTimeout(() => {
      gsap.to('.toast', {
        x: 120, opacity: 0, duration: 0.4, ease: 'power3.in',
        onComplete: () => {
          this.toastVisible = false;
          this.toastMessage = null;
        }
      });
    }, 3500);
  }

  get pendingCount(): number {
    return this.orders.filter(o => o.status === 'PENDING').length;
  }

  get filteredOrders(): Order[] {
    return this.orders.filter(order => {
      if (this.statusFilter !== 'All Statuses' && order.status !== this.statusFilter) return false;
      return true;
    });
  }
  openOrderManifest(order: Order): void {
    this.selectedOrder = { ...order };
    this.newStatus = order.status;
    this.slideOverVisible = true;
    this.selectedOrder.orderItems.forEach(item => {
      if (!this.loadedBooks[item.bookId]) {
        this.bookService.getBooksById(item.bookId).subscribe({
          next: (book) => {
            this.loadedBooks[item.bookId] = book;
          },
          error: (err) => console.error(`Failed to load book ID ${item.bookId}`, err)
        });
      }
    });
  }

  closeSlideOver(): void {
    this.slideOverVisible = false;
    this.selectedOrder = null;
  }
  saveOrderStatus(): void {
    if (!this.selectedOrder || !this.newStatus) return;
    const orderId = this.selectedOrder.id;
    const newStatus = this.newStatus;
    setTimeout(() => {
      const index = this.orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        this.orders[index].status = newStatus;
        this.orders[index].updatedAt = new Date().toISOString(); 
      }

      this.showToast(`Logistics status for ORD-00${orderId} updated to ${newStatus}.`);
      this.closeSlideOver();
    }, 800);
  }
  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-Failed';
      case 'PAID': return 'status-Paid';
      case 'CANCELLED': return 'status-Cancelled';
      default: return '';
    }
  }
  exportManifests(): void {
    this.showToast('Manifests exported successfully.', true);
  }
  updateOrderStatus(orderId: number, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.showToast(`Order status updated to ${newStatus}.`, true);
      },
      error: (err) => {
        console.error('Failed to update order status:', err);
        this.showToast('Failed to update order status.', false);
      }
    });
  }
}