import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout-component.html',
  styleUrls: ['./checkout-component.css']
})
export class CheckoutComponent implements OnInit {
  paymentForm!: FormGroup;
  isProcessing = false;
  paymentComplete = false;
  
  // Controls the 3D flip state of the card
  isCardFlipped = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      cardName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.maxLength(16)]],
      expiryMonth: ['', [Validators.required, Validators.maxLength(2)]],
      expiryYear: ['', [Validators.required, Validators.maxLength(2)]],
      cvv: ['', [Validators.required, Validators.maxLength(4)]]
    });
  }

  // Focus handlers for the 3D Flip effect
  onCvvFocus(): void {
    this.isCardFlipped = true;
  }

  onCvvBlur(): void {
    this.isCardFlipped = false;
  }

  // Formatters for the visual card UI
  get displayCardNumber(): string {
    const num = this.paymentForm.get('cardNumber')?.value || '';
    const padded = num.padEnd(16, '•');
    // Format into groups of 4: •••• •••• •••• ••••
    return padded.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
  }

  get displayExpiry(): string {
    const mm = this.paymentForm.get('expiryMonth')?.value || 'MM';
    const yy = this.paymentForm.get('expiryYear')?.value || 'YY';
    return `${mm}/${yy}`;
  }

  get displayCardName(): string {
    return this.paymentForm.get('cardName')?.value || 'YOUR NAME';
  }

  get displayCvv(): string {
    return this.paymentForm.get('cvv')?.value || '';
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;

    // Simulate Payment Gateway processing
    setTimeout(() => {
      this.isProcessing = false;
      this.paymentComplete = true;
    }, 2000);
  }
}