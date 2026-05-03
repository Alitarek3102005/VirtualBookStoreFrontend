import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../Models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private HttpClient: HttpClient){}
  CheckOut(userId: number): Observable<any> {
    return this.HttpClient.post(`${environment.apiUrl}/order/checkout/${userId}`,null);
  }
  getOrderHistory(userId: number): Observable<any> {
    return this.HttpClient.get(`${environment.apiUrl}/order/history/${userId}`);
  }
  getOrderById(userId: number, orderId: number): Observable<any> {
    return this.HttpClient.get(`${environment.apiUrl}/order/${userId}/${orderId}`);
  }
  getAllOrders(): Observable<Order[]> {
    return this.HttpClient.get<Order[]>(`${environment.apiUrl}/order`);
  }
  updateOrderStatus(orderId: number, newStatus: string): Observable<Order> {
    let queryParams = new HttpParams().set('orderStatus', newStatus);
    return this.HttpClient.put<Order>(`${environment.apiUrl}/order/${orderId}/updateStatus`, null, { params: queryParams });
  }
}
