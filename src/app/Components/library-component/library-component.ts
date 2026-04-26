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
  
  // 1. The Dictionary that the HTML reads from
  public booksByCategory: { [key: number]: Book[] } = {};

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookService: BookService,
    private _router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // 2. Load all categories first
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
      
      // 3. Loop through every category and fill the shelves!
      this.categories.forEach(category => {
        this.bookService.getBookByCategory(category.id).subscribe(books => {
          // Assign the books to the correct shelf ID in the dictionary
          this.booksByCategory[category.id] = books;
        });
      });
    });
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

  // ==========================================
  // BUTTON ACTIONS
  // ==========================================

  addToCart(book: Book): void {
    console.log(`Added to cart: ${book.title}`);
  }

  viewDetails(bookId: number): void {
    this._router.navigateByUrl(`/product-details/${bookId}`);
  }

  // ==========================================
  // ANIMATION & SCROLL METHODS (No changes needed here!)
  // ==========================================

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
}