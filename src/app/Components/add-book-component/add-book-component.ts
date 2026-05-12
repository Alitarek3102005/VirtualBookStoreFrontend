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
      category!: number;
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
      publisher_id: ['', Validators.required], 
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      coverImage: [null]
    });
    this.authService.getPublisherUsers().subscribe(users => {
      this.publisherUsers = users;
    });
    this.categoryService.getCategories().subscribe(categories => {
      this.Categories = categories;
    });
    
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.bookForm.patchValue({ coverImage: file });
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

    // Grab the actual file object from the form
    const coverFile: File = this.bookForm.value.coverImage;

    if (coverFile) {
      // Step 1: Get the Pre-signed URL from Spring Boot
      this.bookService.getUploadUrl(coverFile.name, coverFile.type).subscribe({
        next: (presignedUrl) => {
          
          // Step 2: Upload directly to S3
          this.bookService.uploadDirectToS3(presignedUrl, coverFile).subscribe({
            next: () => {
              // Step 3: Construct the public URL 
              // IMPORTANT: Replace 'virtual-bookstore-media-123' and 'eu-north-1' with your actual bucket name and region!
              const publicImageUrl = `https://virtual-bookstore-media-123.s3.eu-north-1.amazonaws.com/${coverFile.name}`;
              
              // Step 4: Save the book with the image URL
              this.saveBookData(publicImageUrl);
            },
            error: (err) => {
              console.error('S3 Upload Failed:', err);
              alert('Failed to upload the cover image to AWS.');
              this.isSubmitting = false;
            }
          });
        },
        error: (err) => {
          console.error('Failed to get Presigned URL from backend:', err);
          alert('Could not securely connect to AWS. Check backend logs.');
          this.isSubmitting = false;
        }
      });
    } else {
      // If the user didn't select an image, just save the book normally with an empty image string
      this.saveBookData(''); 
    }
  }

  // Helper method to keep things clean
  saveBookData(imageUrl: string): void {
    this.submitedData = {
      title: this.bookForm.value.title,
      author: this.bookForm.value.author,
      publisher_id: this.bookForm.value.publisher_id,
      category: this.bookForm.value.category,
      price: this.bookForm.value.price,
      quantity: this.bookForm.value.quantity,
      description: this.bookForm.value.description,
      imageUrl: imageUrl // Make sure your SubmitBook model has this property!
    } as any; // Temporary cast in case your interface isn't updated yet

    this.bookService.addBook(this.submitedData).subscribe({
      next: (response) => {
        console.log('Book added successfully:', response);
        alert('Volume successfully committed to the database!');
        this.bookForm.reset();
        this.coverImagePreview = null;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error adding book:', error);
        alert('An error occurred while adding the book. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
}