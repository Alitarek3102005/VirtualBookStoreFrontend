import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../../Services/book-service';
import { UserResponseForPublishers } from '../../Models/user-response-for-publishers';
import { AuthService } from '../../Services/auth-service';
import { CategoryService } from '../../Services/category-service';
import { Category } from '../../Models/category';
import { SubmitBook } from '../../Models/submit-book';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
templateUrl: './add-book-component.html',
  styleUrls: ['./add-book-component.css']
})
export class AddBookComponent implements OnInit {
  bookForm!: FormGroup;
  isSubmitting = false;
  coverImagePreview: string | ArrayBuffer | null = null;
  publisherUsers: UserResponseForPublishers[] = [];
  Categories:Category[] = [];
      title: string = '';
      author:string = '';
      publisher_id!:number;
      genre!: number;
      price: number = 0;
      quantity: number = 0; 
      description: string = '';
      submitedData!:SubmitBook;


  constructor(private fb: FormBuilder,
    private bookService: BookService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      author: ['', Validators.required],
      publisher_id: ['', Validators.required], // Foreign Key
      genre: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ['', [Validators.required, Validators.min(0)]], // Maps to Inventory
      description: ['', Validators.required],
      coverImage: [null]
    });
    this.authService.getPublisherUsers().subscribe(users => {
      this.publisherUsers = users;
    });
    // console.log("Fetched publisher users:", this.publisherUsers);
    this.categoryService.getCategories().subscribe(categories => {
      this.Categories = categories;
    });
    
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.bookForm.patchValue({ coverImage: file });
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => this.coverImagePreview = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }


    this.isSubmitting = true;

    this.submitedData = {
      title: this.bookForm.value.title,
      author: this.bookForm.value.author,
      publisher_id: this.bookForm.value.publisher_id,
      genre: this.bookForm.value.genre,
      price: this.bookForm.value.price,
      quantity: this.bookForm.value.quantity,
      description: this.bookForm.value.description
    };

    this.bookService.addBook(this.submitedData).subscribe({
      next: (response) => {
        console.log('Book added successfully:', response);
        alert('Volume successfully committed to the database!');
        this.bookForm.reset();
        this.coverImagePreview = null;
      },
      error: (error) => {
        console.error('Error adding book:', error);
        alert('An error occurred while adding the book. Please try again.');
      }
    });
    
  }
}