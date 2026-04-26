import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../Models/book';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private cachedBooks: Book[] = [];
  private cachedCategoryBooks: { [key: number]: Book[] } = {};

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    if (this.cachedBooks.length > 0) {
      console.log("Serving all books from cache! 🚀");
      return of(this.cachedBooks);
    }

    console.log("Fetching all books from Database... 🐢");
    return this.http.get<Book[]>(`${environment.apiUrl}/book`).pipe(
      tap((books) => {
        this.cachedBooks = books;
      })
    );
  }

  getBookByCategory(categoryId: number): Observable<Book[]> {
    if (this.cachedCategoryBooks[categoryId]) {
      console.log(`Serving category ${categoryId} from cache! 🚀`);
      return of(this.cachedCategoryBooks[categoryId]);
    }

    console.log(`Fetching category ${categoryId} from Database... 🐢`);
    return this.http.get<Book[]>(`${environment.apiUrl}/book/category/${categoryId}`).pipe(
      tap((books) => {
        this.cachedCategoryBooks[categoryId] = books; 
      })
    );
  }

  getBooksById(id: number): Observable<Book> {
    return this.http.get<Book>(`${environment.apiUrl}/book/${id}`);
  }

  clearCache(): void {
    console.log("Cache completely cleared!");
    this.cachedBooks = [];
    this.cachedCategoryBooks = {};
  }
  addBook(bookData: any): Observable<Book> {
    return this.http.post<Book>(`${environment.apiUrl}/book`, bookData).pipe(
      tap(() => {
        console.log("New book added! Wiping cache to fetch fresh data.");
        this.clearCache(); 
      })
    );
  }

  deleteBook(bookId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/book/${bookId}`).pipe(
      tap(() => {
        console.log("Book deleted! Wiping cache.");
        this.clearCache(); 
      })
    );
  }
}