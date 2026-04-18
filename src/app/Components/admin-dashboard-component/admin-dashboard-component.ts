import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import Chart from 'chart.js/auto';

interface InventoryItem {
  id: string;
  title: string;
  author: string;
  stock: number;
  status: 'critical' | 'warning' | 'normal';
}

interface OrderItem {
  id: string;
  date: string;
  customer: string;
  paymentMethod: string;
  status: 'pending' | 'shipped' | 'delivered';
  amount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, DecimalPipe, FormsModule],
  templateUrl: './admin-dashboard-component.html',
  styleUrls: ['./admin-dashboard-component.css']
})
export class AdminDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('globalSearch') globalSearch!: ElementRef<HTMLInputElement>;
  @ViewChild('exportBtn') exportBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnText') btnText!: ElementRef<HTMLElement>;
  @ViewChild('spinner') spinner!: ElementRef<HTMLElement>;
  @ViewChild('mainChartCanvas') mainChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('genreChartCanvas') genreChartCanvas!: ElementRef<HTMLCanvasElement>;

  private mainChart: Chart | null = null;
  private genreChart: Chart | null = null;

  // Slide-over state
  slideOverVisible = false;
  slideOverData: any = null;
  slideOverType: 'restock' | 'order' = 'restock';
  restockQuantity = 1;

  // Toast
  toastMessage: string | null = null;
  toastSuccess = true;
  toastVisible = false;

  // KPI data
  kpis = {
    grossVolume: 42850,
    transactions: 1204,
    avgOrderValue: 35.58,
    inventoryAlerts: 4
  };

  // Inventory data
  inventoryItems: InventoryItem[] = [
    { id: 'BK-109', title: 'The Silent Echo', author: 'Elena Rostov', stock: 2, status: 'critical' },
    { id: 'BK-204', title: 'Fading Light', author: 'Marcus Chen', stock: 0, status: 'critical' },
    { id: 'BK-088', title: 'Design Systems', author: 'Marcus Chen', stock: 8, status: 'warning' }
  ];

  // Order feed data
  orderItems: OrderItem[] = [
    { id: 'ORD-88492A', date: 'Oct 18, 14:32:01', customer: 'M. Chen', paymentMethod: 'Stripe •••• 4242', status: 'pending', amount: 50.90 },
    { id: 'ORD-88491B', date: 'Oct 18, 14:15:22', customer: 'S. Jenkins', paymentMethod: 'PayPal', status: 'shipped', amount: 24.00 },
    { id: 'ORD-88490C', date: 'Oct 18, 13:58:10', customer: 'E. Rostov', paymentMethod: 'Stripe •••• 1111', status: 'shipped', amount: 125.50 }
  ];

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initKeyboardShortcuts();
      this.initCharts();
      this.initEntryAnimations();
    }
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.lenis) this.lenis.destroy();
    if (this.mainChart) this.mainChart.destroy();
    if (this.genreChart) this.genreChart.destroy();
  }

  private initSmoothScroll(): void {
    this.lenis = new Lenis({ duration: 1.2, smooth: true } as any);
    const raf = (time: number) => {
      this.lenis!.raf(time);
      this.rafId = requestAnimationFrame(raf);
    };
    this.rafId = requestAnimationFrame(raf);
  }

  private initKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.globalSearch.nativeElement.focus();
      }
    });
  }

  private initCharts(): void {
    // Main line chart
    const mainCtx = this.mainChartCanvas.nativeElement.getContext('2d')!;
    const gradient = mainCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(176, 30, 35, 0.4)');
    gradient.addColorStop(1, 'rgba(176, 30, 35, 0)');

    this.mainChart = new Chart(mainCtx, {
      type: 'line',
      data: {
        labels: ['Oct 12', 'Oct 13', 'Oct 14', 'Oct 15', 'Oct 16', 'Oct 17', 'Oct 18'],
        datasets: [{
          label: 'Gross Revenue ($)',
          data: [4200, 5100, 4800, 6200, 5900, 7500, 8150],
          borderColor: '#B01E23',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#000',
          pointBorderColor: '#B01E23',
          pointRadius: 4,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111',
            titleColor: '#EDEDED',
            bodyColor: '#B01E23',
            padding: 12,
            displayColors: false
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });

    // Genre doughnut chart
    const genreCtx = this.genreChartCanvas.nativeElement.getContext('2d')!;
    this.genreChart = new Chart(genreCtx, {
      type: 'doughnut',
      data: {
        labels: ['Sci-Fi', 'Design', 'Fiction', 'Bio'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: ['#B01E23', '#EDEDED', '#555555', '#222222'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#888888'
            }
          }
        }
      }
    });
  }

  private initEntryAnimations(): void {
    gsap.from('.gsap-fade', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.2
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

  triggerExport(): void {
    const btn = this.exportBtn.nativeElement;
    const text = this.btnText.nativeElement;
    const spinner = this.spinner.nativeElement;

    btn.disabled = true;
    text.innerText = 'Compiling...';
    spinner.style.display = 'block';

    setTimeout(() => {
      btn.disabled = false;
      text.innerText = 'Export CSV';
      spinner.style.display = 'none';
      this.showToast('data_export_101825.csv downloaded successfully.', true);
    }, 1500);
  }

  openRestock(item: InventoryItem): void {
    this.slideOverType = 'restock';
    this.slideOverData = item;
    this.restockQuantity = 1;
    this.slideOverVisible = true;
  }

  openOrder(order: OrderItem): void {
    this.slideOverType = 'order';
    this.slideOverData = order;
    this.slideOverVisible = true;
  }

  closeSlideOver(): void {
    this.slideOverVisible = false;
    this.slideOverData = null;
  }

  submitRestock(): void {
    if (!this.restockQuantity || this.restockQuantity < 1) return;

    const item = this.slideOverData as InventoryItem;
    // Simulate saving
    setTimeout(() => {
      this.closeSlideOver();
      this.showToast(`${this.restockQuantity} units added to ${item.id} inventory.`);

      const index = this.inventoryItems.findIndex(i => i.id === item.id);
      if (index !== -1) {
        this.inventoryItems[index].stock = this.restockQuantity;
        this.inventoryItems[index].status = this.restockQuantity > 10 ? 'normal' : (this.restockQuantity > 5 ? 'warning' : 'critical');
      }
    }, 800);
  }

  submitFulfill(): void {
    const order = this.slideOverData as OrderItem;
    setTimeout(() => {
      this.closeSlideOver();
      this.showToast(`Order ${order.id} marked as Shipped.`);

      const index = this.orderItems.findIndex(o => o.id === order.id);
      if (index !== -1) {
        this.orderItems[index].status = 'shipped';
      }
    }, 1000);
  }

  getStockStatusClass(stock: number): string {
    if (stock <= 2) return 'status-danger';
    if (stock <= 8) return 'status-warning';
    return 'status-success';
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-warning';
      case 'shipped': return 'status-success';
      case 'delivered': return 'status-success';
      default: return '';
    }
  }
  
}