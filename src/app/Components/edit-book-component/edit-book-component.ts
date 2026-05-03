import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../../Services/book-service';
import { Book } from '../../Models/book';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../Services/category-service';
import { Category } from '../../Models/category';
import { EditBook } from '../../Models/edit-book';

// interface BookData {
//   id: string;
//   title: string;
//   author: string;
//   publisher: string;
//   description: string;
//   coverUrl: string;
// }

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
templateUrl: './edit-book-component.html',
  styleUrls: ['./edit-book-component.css']
})
export class EditBookComponent implements OnInit {
  editForm!: FormGroup;
  isUpdating = false;

  // Mock Data: The existing book fetched from your database
  // book: BookData = {
  //   id: 'BK-109',
  //   title: 'The Silent Echo',
  //   author: 'Elena Rostov',
  //   publisher: 'Orbit Books Ltd.',
  //   description: 'An absolute masterpiece of modern science fiction detailing the collapse of the outer rim communication relays.',
  //   coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
  // };
  book!:Book;
  bookID: number = 0;
  categories:Category [] = [];
  


  constructor(private fb: FormBuilder,
    private bookService: BookService,
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private router: Router 
  ) {}

  ngOnInit(): void {

    // We only create form controls for the fields the admin is allowed to edit
    this.editForm = this.fb.group({
      category: ['sci-fi', Validators.required], // Pre-filled with existing data
      price: [24.0, [Validators.min(0.01)]],
      quantity: [12, [Validators.min(0)]]
    });
    this.activatedRoute.params.subscribe(params => {
      this.bookID = +params['id'];
    });
    this.bookService.getBooksById(this.bookID).subscribe(
      (data) => {
        this.book = data;
        this.editForm.patchValue({

          category: this.book.categoryName,
          price: this.book.price,
          quantity: this.book.stockQuantity
        });
      },
      (error) => {
        console.error('Error fetching book details:', error);
        alert('Failed to load book details. Please try again later.');
        this.editForm.disable(); 
      });
      this.categoryService.getCategories().subscribe(
        (data) => {
          this.categories = data;
        },
        (error) => {
          console.error('Error fetching categories:', error);
          alert('Failed to load categories. Please try again later.');
        });
  }

  onSubmit(): void {
    const editBook: EditBook = {
      categoryId: this.editForm.value.category,
      price: this.editForm.value.price,
      quantity: this.editForm.value.quantity
    };
    this.bookService.editBook(this.bookID, editBook).subscribe({
      next: (updatedBook) => {
        this.router.navigate(['/product-details', updatedBook.id]);
      },
      error: (err) => {
        console.error('Failed to update book:', err);
        alert('An error occurred while updating the book. Please try again later.');
      }
    });
     if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isUpdating = true;

    // Simulate API Update Call
    const updatedData = {
      id: this.book.id,
      ...this.editForm.value
    };
    
    console.log('Sending patch request to backend:', updatedData);

    setTimeout(() => {
      this.isUpdating = false;
      alert(`Volume ${this.book.id} successfully updated!`);
    }, 1200);
  }
  getCategoryByName(name: string): void {
    
  }
}