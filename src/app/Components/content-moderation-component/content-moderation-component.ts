import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import { AuthService } from '../../Services/auth-service';
import { ReviewsService } from '../../Services/reviews-service';
import { Reviews } from '../../Models/reviews';
import { StarsPipe } from '../../Pipes/stars-pipe';

@Component({
  selector: 'app-content-moderation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, DecimalPipe, FormsModule,StarsPipe],
  templateUrl: './content-moderation-component.html',
  styleUrls: ['./content-moderation-component.css']
})
export class ContentModerationComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('globalSearch') globalSearch!: ElementRef<HTMLInputElement>;

  ratingFilter: string = 'All Ratings';

  // Strictly using your backend interface
  reviews: Reviews[] = [];

  slideOverVisible = false;
  selectedReview: Reviews | null = null;

  toastMessage: string | null = null;
  toastType: 'success' | 'danger' | 'warning' = 'success';
  toastVisible = false;

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit(): void {
    this.reviewsService.getAllReviews().subscribe({
      next: (data: Reviews[]) => {
        this.reviews = data; // Directly assigning backend data
      },
      error: (err) => console.error('Failed to load reviews:', err)
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

  // --- Adjusted Metrics for pure review data ---
  get totalReviews(): number { return this.reviews.length; }
  get fiveStarCount(): number { return this.reviews.filter(r => r.rating === 5).length; }
  get criticalCount(): number { return this.reviews.filter(r => r.rating === 1).length; }

  get avgRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / this.reviews.length;
  }

  get filteredReviews(): Reviews[] {
    return this.reviews.filter(review => {
      if (this.ratingFilter !== 'All Ratings') {
        if (this.ratingFilter === '1 Star (Critical)' && review.rating !== 1) return false;
        if (this.ratingFilter === '2-4 Stars' && (review.rating < 2 || review.rating > 4)) return false;
        if (this.ratingFilter === '5 Stars' && review.rating !== 5) return false;
      }
      return true;
    });
  }

  openModerationPanel(review: Reviews): void {
    this.selectedReview = { ...review };
    this.slideOverVisible = true;
  }

  closeSlideOver(): void {
    this.slideOverVisible = false;
    this.selectedReview = null;
  }
  deleteReview(): void {
    if (!this.selectedReview) return;
    
    const reviewId = this.selectedReview.id;
    this.reviewsService.deleteReview(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== reviewId);
        this.showToast('Content successfully deleted from the database.', 'danger');
        this.closeSlideOver();
      },
      error: (err) => {
        console.error('Failed to delete review:', err);
        this.showToast('Failed to delete content.', 'danger');
      }
    });
  }

  keepReview(): void {
    this.showToast('Review marked as clear.', 'success');
    this.closeSlideOver();
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