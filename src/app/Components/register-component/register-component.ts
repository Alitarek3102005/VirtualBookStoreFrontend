import { Component, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import gsap from 'gsap';
import { AuthService } from '../../Services/auth-service';
import { FormsModule } from '@angular/forms';
import { Registercred } from '../../Models/registercred';
import { Role } from '../../Models/role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink,FormsModule],


templateUrl: './register-component.html',
  styleUrls: ['./register-component.css']
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('gsapImg') gsapImg!: ElementRef<HTMLImageElement>;
  @ViewChild('magneticBtn') magneticBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('registerForm') registerForm!: ElementRef<HTMLFormElement>;
  username: string = '';
  email: string = '';
  password: string = '';
  fullName: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
  private authService: AuthService,
  private _router: Router
) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
    }
  }

  private initAnimations(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouch && this.magneticBtn) {
      const btn = this.magneticBtn.nativeElement;
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const pos = btn.getBoundingClientRect();
        const mx = e.clientX - pos.left - pos.width / 2;
        const my = e.clientY - pos.top - pos.height / 2;
        gsap.to(btn, { x: mx * 0.2, y: my * 0.2, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      });
    }

    const tl = gsap.timeline();
    tl.from(this.gsapImg.nativeElement, {
      scale: 1.15,
      duration: 2,
      ease: 'power3.out'
    }).from('.gsap-slide', {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out'
    }, '-=1.5');
  }
  register(){
    const role="USER";
     const credentials:Registercred = { email: this.email, password: this.password, fullName: this.fullName, username: this.username, role };
    this.authService.register(credentials).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this._router.navigate(['/']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
      }
    });
  }

  }
