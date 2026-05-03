import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private http: HttpClient) {}
  GetUserCart(userId: number | null): Observable<any> {
    return this.http.get(`${environment.apiUrl}/cart/${userId}`);
  }
  RemoveItemFromCart(userId: number | null, bookId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/cart/${userId}/remove/${bookId}`);
  }
  // UpdateCartItemQuantity(cartItemId: number | null, quantity: number): Observable<any> {
  //   return this.http.put(`${environment.apiUrl}/cart/item/${cartItemId}`, { quantity });
  // }
  addItemToCart(userId: number | null, bookId: number, quantity: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/cart/${userId}/add`, { bookId, quantity });
  }
 clearCart(userId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/cart/${userId}/clear`, { 
      responseType: 'text'
    });
  }
  updateCartItemQuantity(userId: number,bookId: number, quantity: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/cart/${userId}/update`, { bookId, quantity });
  }
  
}
