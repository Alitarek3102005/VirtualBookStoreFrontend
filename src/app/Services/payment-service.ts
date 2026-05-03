import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient) { }
  checkoutWithStripe(orderId: number, amount: number, bookName: string): Observable<any> {
      const paymentRequest = {
        amount: amount * 100,
        quantity: 1,
        name: bookName,
        currency: 'usd',
        orderId: orderId
      };
      return this.http.post(`${environment.apiUrl}/payment/pay`, paymentRequest);
    }
}
