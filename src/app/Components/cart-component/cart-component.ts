import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID, OnInit, NgZone } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { CartService } from '../../Services/cart-service';
import { BookService } from '../../Services/book-service';
import { AuthService } from '../../Services/auth-service';
import { Cart } from '../../Models/cart';
import { Book } from '../../Models/book';
import { CartItem } from '../../Models/cart-item';
import { OrderService } from '../../Services/order-service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, DecimalPipe,RouterLink],
templateUrl: './cart-component.html',
  styleUrls: ['./cart-component.css']
})
export class CartComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('magneticBtn') magneticBtn!: ElementRef<HTMLAnchorElement>;
  userId: number | null = null;
  Cart!:Cart;
  Books: Book[] = [];
  public cartDisplayItems: any[] = []; 
  public cartTotalPrice: number = 0;
  trackByCartItemId(item: CartItem): number {
    return item.id;
  }

  private lenis!: Lenis;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
  private cartService: CartService,
  private bookService: BookService,
  private authService: AuthService,
  private orderService: OrderService,
  private router: Router,
) {}


  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    this.cartService.GetUserCart(this.userId || 0).subscribe({
      next: (cart) => {
        this.Cart = cart;
        if (this.Cart && this.Cart.items) {
          this.Cart.items.forEach((item) => {
            this.bookService.getBooksById(item.bookId).subscribe({
              next: (book) => {
                this.cartDisplayItems.push({
                  cartItemId: item.id,       
                  quantity: item.quantity,  
                  bookDetails: book    
                });
                this.cartTotalPrice += (item.quantity * book.price);
              }
            });
          });
        }
      }
    });
  }
  getBookFromCartItem(cartItem: CartItem): Book | undefined {
    return this.Books.find(book => book.id === cartItem.id);
  }

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
    return this.cartDisplayItems.reduce((sum, item) => sum + item.bookDetails.price * item.quantity, 0);
  }

  get grandTotal(): number {
    return this.subtotal ;
  }
  increaseQuantity(item: any): void {
    item.quantity++;
    this.updateQuantity(item.bookDetails.id, item.quantity); 
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateQuantity(item.bookDetails.id, item.quantity);
    }
  }
  updateQuantity(bookId: number, quantity: number): void {
    this.cartService.updateCartItemQuantity(this.userId || 0, bookId, quantity).subscribe({
      next: () => {
        console.log('Cart item quantity updated successfully');
      },
      error: (err) => {
        console.error('Error updating cart item quantity:', err);
      }
    });
  }

  removeItem(item: CartItem, elementRef: HTMLElement): void {
    const index = this.cartDisplayItems.findIndex(i => i.cartItemId === item.id);
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
        this.cartDisplayItems.splice(index, 1);
      }
    });
  }
  trackByUniqueCartItem(index: number, item: any): number {
    return item.cartItemId;
  }
  
  removeFromCart(cartItemId: number, elementRef: HTMLElement): void {
    const index = this.cartDisplayItems.findIndex((i) => i.cartItemId === cartItemId);
    const item = this.cartDisplayItems[index];
    if (!item || index === -1) return;
    this.cartService.RemoveItemFromCart(this.userId || 0, item.bookDetails.id).subscribe({
      next: () => {
        this.executeRemoveAnimation(index, elementRef);
      },
      error: (err) => {
        console.warn('Backend threw an error, but forcing UI update anyway.', err);
        this.executeRemoveAnimation(index, elementRef);
      }
    });
  }

  private executeRemoveAnimation(index: number, elementRef: HTMLElement): void {
    gsap.to(elementRef, {
      opacity: 0,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: 0,
      marginBottom: 0,
      duration: 0.4,
      onComplete: () => {
        gsap.set(elementRef, { clearProps: 'all' });
        this.cartDisplayItems.splice(index, 1);
      }
    });
  }
  addToCart(bookId: number, quantity: number): void {
    this.cartService.addItemToCart(this.userId || 0, bookId, quantity).subscribe(
      {
        next: () => {
          console.log('Item added to cart successfully');
        },
        error: (err) => {
          console.error('Error adding item to cart:', err);
        }
      }
    );
  }
  clearCart(): void {
    this.cartService.clearCart(this.userId || 0).subscribe({
      next: () => {
        const allCartItems = document.querySelectorAll('.cart-item');
        gsap.to(allCartItems, {
          opacity: 0,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0,
          duration: 0.4,
          stagger: 0.1,
          onComplete: () => {
            gsap.set(allCartItems, { clearProps: 'all' });
            this.cartDisplayItems = [];
            console.log('Cart cleared successfully');
          }
        });
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
      }
    });
  }
  checkout(): void {
    if (!this.userId) {
      alert('Please log in to proceed with checkout.');
      return;
    }
    this.orderService.CheckOut(this.userId).subscribe({
      next: () => {
        alert('Checkout successful! Your order is being processed.');
        this.router.navigate(['/order-history']);
      },
      error: (err) => {
        console.error('Error during checkout:', err);
        alert('An error occurred during checkout. Please try again later.');
      }
    });
  }
}