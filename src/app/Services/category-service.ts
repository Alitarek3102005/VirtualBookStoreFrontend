import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../Models/category';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  constructor(private httpclient: HttpClient) {}
  getCategories():Observable<Category[]> {
    return this.httpclient.get<Category[]>(`${environment.apiUrl}/category`);
  }
  getCategoryById(id: number): Observable<Category> {
    return this.httpclient.get<Category>(`${environment.apiUrl}/category/${id}`);
  }
}
