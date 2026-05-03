import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { BookService } from '../../Services/book-service';
import { Book } from '../../Models/book';
import { AuthService } from '../../Services/auth-service';
import { ReviewsService } from '../../Services/reviews-service';
import { Reviews } from '../../Models/reviews';
import { StarsPipe } from '../../Pipes/stars-pipe';
import { UserResponseForPublishers } from '../../Models/user-response-for-publishers';
import { CartService } from '../../Services/cart-service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, CommonModule, StarsPipe, FormsModule],
  templateUrl: './product-detail-component.html',
  styleUrls: ['./product-detail-component.css']
})
export class ProductDetailComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('magneticBtn') magneticBtn!: ElementRef<HTMLButtonElement>;
  quantity = 1;

  private lenis!: Lenis;
  private rafId: number | null = null;
  private bookID: number = 0;
  public book!: Book;
  public reviews: Reviews[] = [];
  isAdmin: boolean = false;
  user!: UserResponseForPublishers | null;
  userId: number | null = null;
  username!: string;

  showReviewPopup: boolean = false;
  newReviewComment: string = '';
  newReviewRating: number = 0;
  hoverRating: number = 0;

  showEditReviewPopup: boolean = false;
  editReviewId: number = 0;
  editReviewComment: string = '';
  editReviewRating: number = 0;
  editHoverRating: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private bookService: BookService,
    private _ActivatedRoute: ActivatedRoute,
    private _router: Router,
    private authservice: AuthService,
    private reviewsservice: ReviewsService,
    private cartService: CartService
  ) { }

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
    this.getreviewsByBookId();
    this.getisAdmin();
    this.userId = this.authservice.getCurrentUserId();
    this.getUserData();
  }

  getUserData(): void {
    this.authservice.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        if (this.user) {
          this.username = this.user.username;
        }
      }
    });
  }

  goBack(): void {
    this._router.navigate(['/library']);
  }

  deleteBook(): void {
    if (!this.authservice.isAdmin()) return;
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      this.bookService.deleteBook(this.bookID).subscribe({
        next: () => {
          alert('Book deleted successfully.');
          this._router.navigate(['/library']);
        },
        error: (err) => alert('An error occurred while deleting the book.')
      });
    }
  }

  getisAdmin() {
    return this.authservice.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  getreviewsByBookId() {
    return this.reviewsservice.getReviewsForBook(this.bookID).subscribe(
      review => {
        this.reviews = review;
      }
    )
  }

  editBook(): void {
    if (!this.authservice.isAdmin()) return;
    this._router.navigate(['/edit-book', this.bookID]);
  }
  openReviewPopup(): void {
    this.showReviewPopup = true;
    this.newReviewComment = '';
    this.newReviewRating = 0;
  }

  closeReviewPopup(): void {
    this.showReviewPopup = false;
  }

  setRating(stars: number): void {
    this.newReviewRating = stars;
  }

  submitReview(): void {
    if (this.newReviewRating === 0 || this.newReviewComment.trim() === '') {
      alert('Please provide both a star rating and a comment.');
      return;
    }
    this.reviewsservice.submitReview(this.bookID, this.newReviewRating, this.newReviewComment, this.username).subscribe({
      next: () => {
        alert('Review submitted successfully!');
        this.closeReviewPopup();
        this.getreviewsByBookId();
      },
      error: (err) => alert('An error occurred while submitting the review.')
    });
  }
  openEditReviewPopup(review: Reviews): void {
    this.showEditReviewPopup = true;
    this.editReviewId = review.id;
    this.editReviewComment = review.comment;
    this.editReviewRating = review.rating;
    this.editHoverRating = 0;
  }

  closeEditReviewPopup(): void {
    this.showEditReviewPopup = false;
  }

  setEditRating(stars: number): void {
    this.editReviewRating = stars;
  }

  submitEditReview(): void {
    if (this.editReviewRating === 0 || this.editReviewComment.trim() === '') {
      alert('Please provide both a star rating and a comment.');
      return;
    }
    
    this.reviewsservice.updateReview(this.editReviewId, this.editReviewRating, this.editReviewComment).subscribe({
      next: () => {
        alert('Review updated successfully!');
        this.closeEditReviewPopup();
        this.getreviewsByBookId();
      },
      error: (err) => alert('An error occurred while updating the review.')
    });
  }
  deleteReview(reviewId: number): void {
    if (!this.isAdmin && this.username !== this.reviews.find(r => r.id === reviewId)?.userName) {
      alert('You do not have permission to delete this review.');
      return;
    }
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      this.reviewsservice.deleteReview(reviewId).subscribe({
        next: () => {
          alert('Review deleted successfully.');
          this.getreviewsByBookId();
        },
        error: (err) => alert('An error occurred while deleting the review.')
      });
    }
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