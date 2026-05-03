import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderService } from '../../Services/order-service';
import { BookService } from '../../Services/book-service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../Services/auth-service';
import { Book } from '../../Models/book';
import { PaymentService } from '../../Services/payment-service';

export interface OrderItem {
  id: number;
  bookId: number;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  id: number;
  readerId: number;
  cartId: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

@Component({
  selector: 'app-order-info',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe], 
  templateUrl: './order-info-component.html',
  styleUrls: ['./order-info-component.css']
})
export class OrderInfoComponent implements OnInit {
  order!: OrderResponse;
  books: Book[] = [];

  isPrinting = false;
  UserId: number | null = null;

  constructor(
    private orderService: OrderService,
    private bookService: BookService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.UserId = this.authService.getCurrentUserId();
    
    if(this.UserId) {
      this.orderService.getOrderById(this.UserId, orderId).subscribe({
        next: (order) => {
          this.order = order;
          this.order.orderItems.forEach(item => {
            this.bookService.getBooksById(item.bookId).subscribe({
              next: (book) => {
                this.books.push(book);
              },
              error: (err) => {
                console.error('Error fetching book details:', err);
              }
            });
          });
        },
        error: (err) => {
          console.error('Error fetching order details:', err);
          alert('An error occurred while fetching order details. Please try again later.');
        }
      });
    }
  }
  getBookDetails(bookId: number): Book | undefined {
    return this.books.find(b => b.id === bookId);
  }

  triggerPrint(): void {
    this.isPrinting = true;
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
    }, 800);
  }
  processPayment(): void {
    this.paymentService.checkoutWithStripe(this.order.id,this.order.totalPrice, this.getBookDetails(this.order.orderItems[0].bookId)?.title || 'Order Payment').subscribe({
      next: (response) => {
        if (response.status === 'SUCCESS' && response.sessionUrl) {
          window.location.href = response.sessionUrl; 
        } else {
          alert("Something went wrong creating the checkout session.");
        }
      },
      error: (err) => {
        console.error("Failed to initialize payment", err);
        alert("Could not connect to payment server.");
      }
    });
  }
}