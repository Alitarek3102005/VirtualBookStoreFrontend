import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

interface CartItem {
  id: number;
  title: string;
  author: string;
  format: string;
  price: number;
  image: string;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, DecimalPipe],
  templateUrl: './cart-component.html',
  styleUrls: ['./cart-component.css']
})
export class CartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('magneticBtn') magneticBtn!: ElementRef<HTMLAnchorElement>;

  cartItems: CartItem[] = [
    {
      id: 1,
      title: 'The Silent Echo',
      author: 'Elena Rostov',
      format: 'Hardcover',
      price: 24.00,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      quantity: 1
    },
    {
      id: 2,
      title: 'Brutalist Forms',
      author: 'Institute of Design',
      format: 'Digital Edition',
      price: 65.00,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400',
      quantity: 1
    }
  ];

  private lenis!: Lenis;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initMagneticButton();
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
        this.lenis.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };
      this.rafId = requestAnimationFrame(raf);
    }
  }

  private initMagneticButton(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch && this.magneticBtn) {
      const btn = this.magneticBtn.nativeElement;
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const pos = btn.getBoundingClientRect();
        const mx = e.clientX - pos.left - pos.width / 2;
        const my = e.clientY - pos.top - pos.height / 2;
        gsap.to(btn, { x: mx * 0.15, y: my * 0.15, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      });
    }
  }

  private initEntryAnimations(): void {
    gsap.from('.gsap-slide', {
      y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2
    });
    gsap.from('.gsap-fade', {
      y: 40, opacity: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.4
    });
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get taxes(): number {
    return this.subtotal * 0.08;
  }

  get grandTotal(): number {
    return this.subtotal + this.taxes;
  }

  increaseQuantity(item: CartItem): void {
    item.quantity++;
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) item.quantity--;
  }

  removeItem(item: CartItem, elementRef: HTMLElement): void {
    const index = this.cartItems.findIndex(i => i.id === item.id);
    if (index === -1) return;

    gsap.to(elementRef, {
      opacity: 0,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: 0,
      marginBottom: 0,
      duration: 0.4,
      onComplete: () => {
        this.cartItems.splice(index, 1);
      }
    });
  }

  trackById(index: number, item: CartItem): number {
    return item.id;
  }
}