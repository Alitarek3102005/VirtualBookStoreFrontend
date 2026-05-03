import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { BookService } from '../../Services/book-service';
import { Book } from '../../Models/book';
import { CategoryService } from '../../Services/category-service';
import { Category } from '../../Models/category';
import { CartService } from '../../Services/cart-service';
import { AuthService } from '../../Services/auth-service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './library-component.html',
  styleUrls: ['./library-component.css']
})
export class LibraryComponent implements AfterViewInit, OnDestroy, OnInit {
  private lenis: Lenis | null = null;
  private rafId: number | null = null;
  public categories: Category[] = [];
  public booksByCategory: { [key: number]: Book[] } = {};
  userId!: number | null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookService: BookService,
    private _router: Router,
    private categoryService: CategoryService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
      
      this.categories.forEach(category => {
        this.bookService.getBookByCategory(category.id).subscribe(books => {
          this.booksByCategory[category.id] = books;
        });
      });
    });
    this.userId = this.authService.getCurrentUserId();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initAnimations();
    }
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.lenis) this.lenis.destroy();
  }

  viewDetails(bookId: number): void {
    this._router.navigateByUrl(`/product-details/${bookId}`);
  }
  private initSmoothScroll(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      this.lenis = new Lenis({
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
      } as any);
      const raf = (time: number) => {
        this.lenis!.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };
      this.rafId = requestAnimationFrame(raf);
    }
  }

  private initAnimations(): void {
    gsap.from('.gsap-reveal', {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.utils.toArray('.gsap-fade').forEach((section: any) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 90%'
        }
      });
    });

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch && window.innerWidth > 768) {
      gsap.to('.parallax-track-1', {
        x: -120,
        ease: 'none',
        scrollTrigger: {
          trigger: '.library-container',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }
  }
  trackByUniqueBookId(index: number, book: Book): number {
    return book.id;
  }
  trackByUniqueCategoryId(index: number, category: Category): number {
    return category.id;
  }
  addToCart(bookId: number, quantity: number): void {
    this.cartService.addItemToCart(this.userId, bookId, quantity).subscribe(
      () => {
        alert(`Book with ID ${bookId} added to cart with quantity ${quantity}`);
      },
      (error) => {
        console.error('Error adding book to cart:', error);
          alert('Please log in to add items to your cart.');
          this._router.navigate(['/login']);
        
        });
      }
}