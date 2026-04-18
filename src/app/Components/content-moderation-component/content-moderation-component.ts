// content-moderation.component.ts
import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

interface Review {
  id: string;
  book: string;
  author: string;
  email: string;
  rating: number;
  text: string;
  snippet: string;
  status: 'Published' | 'Pending' | 'Flagged' | 'Removed';
  date: string;
}

@Component({
  selector: 'app-content-moderation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,CommonModule, DecimalPipe, FormsModule],
  templateUrl: './content-moderation-component.html',
  styleUrls: ['./content-moderation-component.css']
})
export class ContentModerationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('globalSearch') globalSearch!: ElementRef<HTMLInputElement>;

  // Filters
  statusFilter: string = 'All Statuses';
  ratingFilter: string = 'All Ratings';

  // Reviews data
  reviews: Review[] = [
    {
      id: 'RV001',
      book: 'Brutalist Forms',
      author: 'John Doe',
      email: 'j.doe@spam.com',
      rating: 1,
      text: 'This book is absolute garbage. The author has no idea what they are talking about and the print quality is a joke. I demand a refund immediately before I report this site.',
      snippet: '"This book is absolute garbage. The author has no idea what they are talking about and the print quality is a joke..."',
      status: 'Flagged',
      date: 'Oct 18, 2025'
    },
    {
      id: 'RV002',
      book: 'The Silent Echo',
      author: 'Sarah Jenkins',
      email: 's.jenkins@domain.com',
      rating: 5,
      text: 'An absolute masterpiece of modern science fiction. Rostov perfectly balances hard scientific concepts with deep, emotional character development. I couldn\'t put it down once the relay went offline.',
      snippet: '"An absolute masterpiece of modern science fiction. Rostov perfectly balances hard scientific concepts with deep..."',
      status: 'Pending',
      date: 'Oct 18, 2025'
    },
    {
      id: 'RV003',
      book: 'Design Systems',
      author: 'Marcus Chen',
      email: 'marcus.c@example.com',
      rating: 4,
      text: 'Very solid reference material. I keep it on my desk while working. The only issue is that chapter 3 feels a bit rushed compared to the rest of the volume. Otherwise, excellent resource.',
      snippet: '"Very solid reference material. I keep it on my desk while working. The only issue is that chapter 3 feels a bit..."',
      status: 'Published',
      date: 'Oct 15, 2025'
    }
  ];

  // Slide-over state
  slideOverVisible = false;
  selectedReview: Review | null = null;

  // Toast
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' | 'warning' = 'success';
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

  private showToast(message: string, type: 'success' | 'danger' | 'warning' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
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

  // Computed properties for metrics
  get pendingCount(): number {
    return this.reviews.filter(r => r.status === 'Pending').length;
  }

  get flaggedCount(): number {
    return this.reviews.filter(r => r.status === 'Flagged').length;
  }

  get publishedCount(): number {
    return this.reviews.filter(r => r.status === 'Published').length;
  }

  get avgRating(): number {
    const published = this.reviews.filter(r => r.status === 'Published');
    if (published.length === 0) return 0;
    const sum = published.reduce((acc, r) => acc + r.rating, 0);
    return sum / published.length;
  }

  get alertCount(): number {
    return this.pendingCount + this.flaggedCount;
  }

  // Filtered reviews based on dropdowns
  get filteredReviews(): Review[] {
    return this.reviews.filter(review => {
      // Status filter
      if (this.statusFilter !== 'All Statuses' && review.status !== this.statusFilter) {
        return false;
      }
      // Rating filter (simplified)
      if (this.ratingFilter !== 'All Ratings') {
        if (this.ratingFilter === '1 Star (Critical)' && review.rating !== 1) return false;
        if (this.ratingFilter === '2-4 Stars' && (review.rating < 2 || review.rating > 4)) return false;
        if (this.ratingFilter === '5 Stars' && review.rating !== 5) return false;
      }
      return true;
    });
  }

  openModerationPanel(review: Review): void {
    this.selectedReview = { ...review };
    this.slideOverVisible = true;
  }

  closeSlideOver(): void {
    this.slideOverVisible = false;
    this.selectedReview = null;
  }

  updateReviewStatus(newStatus: Review['status']): void {
    if (!this.selectedReview) return;

    const reviewId = this.selectedReview.id;
    const index = this.reviews.findIndex(r => r.id === reviewId);
    if (index === -1) return;

    // Simulate network delay
    setTimeout(() => {
      this.reviews[index].status = newStatus;

      let toastMsg = '';
      let toastType: 'success' | 'danger' | 'warning' = 'success';

      switch (newStatus) {
        case 'Published':
          toastMsg = 'Review approved and published to the catalog.';
          break;
        case 'Flagged':
          toastMsg = 'Review flagged for secondary supervisor audit.';
          toastType = 'warning';
          break;
        case 'Removed':
          toastMsg = 'Content deleted. Policy violation logged on user profile.';
          toastType = 'danger';
          break;
        default:
          toastMsg = `Review status updated to ${newStatus}.`;
      }

      this.showToast(toastMsg, toastType);
      this.closeSlideOver();
    }, 300);
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Published': return 'status-published';
      case 'Pending': return 'status-pending';
      case 'Flagged': return 'status-flagged';
      case 'Removed': return 'status-removed';
      default: return '';
    }
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