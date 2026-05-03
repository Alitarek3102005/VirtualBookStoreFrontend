import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import { BookService } from '../../Services/book-service';
import { Book } from '../../Models/book';

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, DecimalPipe, FormsModule],
  templateUrl: './catalog-management-component.html',
  styleUrls: ['./catalog-management-component.css']
})
export class CatalogManagementComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('globalSearch') globalSearch!: ElementRef<HTMLInputElement>;

  books: Book[] = [];
  searchTerm: string = '';
  categoryFilter: string = 'All Categories';
  availableCategories: string[] = [];

  toastMessage: string | null = null;
  toastType: 'success' | 'danger' | 'warning' = 'success';
  toastVisible = false;

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.availableCategories = [...new Set(data.map(b => b.categoryName))].sort();
      },
      error: (err) => {
        console.error('Failed to load catalog:', err);
        this.showToast('Database connection error while loading catalog.', 'danger');
      }
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
  get filteredBooks(): Book[] {
    return this.books.filter(book => {
      if (this.categoryFilter !== 'All Categories' && book.categoryName !== this.categoryFilter) {
        return false;
      }
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const matchTitle = book.title.toLowerCase().includes(term);
        const matchAuthor = book.author.toLowerCase().includes(term);
        const matchPublisher = book.publisherName.toLowerCase().includes(term);
        
        if (!matchTitle && !matchAuthor && !matchPublisher) return false;
      }
      
      return true;
    });
  }

  get totalInventoryValue(): number {
    return this.books.reduce((sum, book) => sum + (book.price * book.quantity), 0);
  }

  get lowStockCount(): number {
    return this.books.filter(b => b.quantity < 10).length;
  }

  editBook(bookId: number): void {
    // Navigate to your existing edit book component
    this.router.navigate(['/edit-book', bookId]);
  }

  deleteBook(bookId: number, bookTitle: string): void {
    if (confirm(`CRITICAL WARNING: Are you sure you want to permanently delete "${bookTitle}"? This action cannot be undone.`)) {
      this.bookService.deleteBook(bookId).subscribe({
        next: () => {
          this.showToast(`Volume "${bookTitle}" has been purged from the database.`, 'success');
          this.books = this.books.filter(b => b.id !== bookId);
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.showToast(`Failed to delete "${bookTitle}". Server rejected request.`, 'danger');
        }
      });
    }
  }
  private showToast(message: string, type: 'success' | 'danger' | 'warning' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
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

  getToastIcon(): string {
    switch (this.toastType) {
      case 'success': return '✓';
      case 'danger': return '⚠';
      case 'warning': return '!';
      default: return '✓';
    }
  }

  getToastColor(): string {
    switch (this.toastType) {
      case 'success': return 'var(--success)';
      case 'danger': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      default: return 'var(--success)';
    }
  }
}