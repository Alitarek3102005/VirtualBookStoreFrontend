import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, OnDestroy, OnInit } from '@angular/core';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { BookService } from '../../Services/book-service';
import { Book } from '../../Models/book';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-detail-component.html',
  styleUrls: ['./product-detail-component.css']
})
export class ProductDetailComponent implements AfterViewInit, OnDestroy,OnInit {
  @ViewChild('magneticBtn') magneticBtn!: ElementRef<HTMLButtonElement>;
  quantity = 1;

  private lenis!: Lenis;
  private rafId: number | null = null;
  private bookID: number = 0;
  public book!: Book;
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
  private bookService: BookService,
  private _ActivatedRoute:ActivatedRoute,
  private _router: Router
) {}
  

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initAnimations();
    }
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

  private initAnimations(): void {
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

    gsap.from('.gsap-fade', { opacity: 0, y: 40, duration: 1.5, ease: 'power3.out', delay: 0.2 });
    gsap.from('.gsap-slide', { y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.4 });
  }

  increaseQuantity(): void {
    if (this.quantity < 10) this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.lenis) this.lenis.destroy();
  }
  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe(paramMap => {
      const bookId = Number(paramMap.get('id'));
      this.bookID = bookId;
    });
    this.bookService.getBooksById(this.bookID).subscribe(book => {
      this.book = book;
    });
  }
}
