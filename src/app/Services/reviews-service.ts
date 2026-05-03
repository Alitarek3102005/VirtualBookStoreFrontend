import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reviews } from '../Models/reviews';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  constructor(private httpClient: HttpClient) {}

  getReviewsForBook(bookId: number) :Observable<Reviews[]> {
    return this.httpClient.get<Reviews[]>(`${environment.apiUrl}/reviews/book/${bookId}`);
  }
  public submitReview(bookId: number, rating: number, comment: string, userName: string): Observable<any> {
    const reviewData = {
      bookId,
      rating,
      comment,
      userName,
    };
    return this.httpClient.post<any>(`${environment.apiUrl}/reviews`, reviewData);
  }
  getAllReviews(): Observable<Reviews[]> {
    return this.httpClient.get<Reviews[]>(`${environment.apiUrl}/reviews`);
  }
  deleteReview(reviewId: number): Observable<void> {
    return this.httpClient.delete<void>(`${environment.apiUrl}/reviews/${reviewId}`);
  }
  updateReview(reviewId: number, rating: number, comment: string): Observable<void> {
    const reviewData = {
      rating,
      comment,
    };
    return this.httpClient.put<void>(`${environment.apiUrl}/reviews/${reviewId}`, reviewData);
  }
}
