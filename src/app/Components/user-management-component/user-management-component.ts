// user-management.component.ts
import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Customer' | 'Publisher' | 'Admin';
  status: 'Active' | 'Suspended';
  ordersPlaced: number;
  reviewsWritten: number;
  registrationDate: string;
  avatarInitials: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, DecimalPipe, FormsModule],
  templateUrl: './user-management-component.html',
  styleUrls: ['./user-management-component.css']
})
export class UserManagementComponent implements AfterViewInit, OnDestroy {
  @ViewChild('globalSearch') globalSearch!: ElementRef<HTMLInputElement>;

  users: User[] = [
    {
      id: 'UID1042',
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'marcus.c@example.com',
      role: 'Customer',
      status: 'Active',
      ordersPlaced: 12,
      reviewsWritten: 4,
      registrationDate: 'Jan 14, 2024',
      avatarInitials: 'MC'
    },
    {
      id: 'UID1043',
      firstName: 'Elena',
      lastName: 'Rostov',
      email: 'elena.r@studio.net',
      role: 'Publisher',
      status: 'Active',
      ordersPlaced: 45,
      reviewsWritten: 12,
      registrationDate: 'Nov 02, 2023',
      avatarInitials: 'ER'
    },
    {
      id: 'UID1044',
      firstName: 'David',
      lastName: 'Alistair',
      email: 'david.a@mail.com',
      role: 'Customer',
      status: 'Suspended',
      ordersPlaced: 0,
      reviewsWritten: 0,
      registrationDate: 'Oct 10, 2025',
      avatarInitials: 'DA'
    },
    {
      id: 'UID0001',
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@athena.io',
      role: 'Admin',
      status: 'Active',
      ordersPlaced: 0,
      reviewsWritten: 0,
      registrationDate: 'Jan 01, 2023',
      avatarInitials: 'SA'
    }
  ];

  // Slide-over state
  slideOverVisible = false;
  selectedUser: User | null = null;
  newRole: User['role'] = 'Customer';

  // Toast
  toastMessage: string | null = null;
  toastType: 'success' | 'danger' | 'info' = 'success';
  toastVisible = false;

  // Smooth scroll
  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initKeyboardShortcuts();
      this.initEntryAnimations();
    }
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.lenis) this.lenis.destroy();
  }

  private initSmoothScroll(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      this.lenis = new Lenis({ duration: 1.2, smooth: true } as any);
      const raf = (time: number) => {
        this.lenis!.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };
      this.rafId = requestAnimationFrame(raf);
    }
  }

  private initKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.globalSearch.nativeElement.focus();
      }
    });
  }

  private initEntryAnimations(): void {
    gsap.from('.gsap-slide', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.1
    });
    gsap.from('.gsap-fade', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.3
    });
  }

  private showToast(message: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    gsap.to('.toast', { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });

    setTimeout(() => {
      gsap.to('.toast', {
        x: 120,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => {
          this.toastVisible = false;
          this.toastMessage = null;
        }
      });
    }, 3500);
  }

  // Metrics
  get totalRegistered(): number {
    return this.users.length + 3488; // base mockup number
  }

  get activeUsers(): number {
    return this.users.filter(u => u.status === 'Active').length;
  }

  get publisherCount(): number {
    return this.users.filter(u => u.role === 'Publisher').length;
  }

  get suspendedCount(): number {
    return this.users.filter(u => u.status === 'Suspended').length + 11; // matching mockup
  }

  openUserPanel(user: User): void {
    this.selectedUser = { ...user };
    this.newRole = user.role;
    this.slideOverVisible = true;
  }

  closeSlideOver(): void {
    this.slideOverVisible = false;
    this.selectedUser = null;
  }

  onRoleChange(): void {
    if (!this.selectedUser) return;
    const userId = this.selectedUser.id;
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index].role = this.newRole;
    }
    this.showToast(`Role permissions for ${userId} updated to ${this.newRole}.`, 'info');
  }

  toggleAccountAccess(): void {
    if (!this.selectedUser) return;
    const user = this.selectedUser;
    if (user.role === 'Admin') return;

    const index = this.users.findIndex(u => u.id === user.id);
    if (index === -1) return;

    const newStatus: User['status'] = user.status === 'Active' ? 'Suspended' : 'Active';
    this.users[index].status = newStatus;

    const message = newStatus === 'Active'
      ? `Access restored for user ${user.id}.`
      : `Account ${user.id} has been suspended.`;

    this.showToast(message, newStatus === 'Active' ? 'success' : 'danger');
    this.closeSlideOver();
  }

  canToggleAccess(): boolean {
    return this.selectedUser?.role !== 'Admin';
  }

  getToggleButtonText(): string {
    if (!this.selectedUser) return '';
    if (this.selectedUser.role === 'Admin') return 'System Lock (Immutable)';
    return this.selectedUser.status === 'Active' ? 'Suspend Account' : 'Reactivate Account';
  }

  getToggleButtonClass(): string {
    if (!this.selectedUser) return 'btn';
    if (this.selectedUser.role === 'Admin') return 'btn';
    return this.selectedUser.status === 'Active' ? 'btn btn-danger' : 'btn btn-success';
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'Admin': return 'role-badge role-admin';
      case 'Publisher': return 'role-badge role-publisher';
      default: return 'role-badge';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'status-badge status-active';
      case 'Suspended': return 'status-badge status-suspended';
      default: return 'status-badge';
    }
  }

  getToastIcon(): string {
    switch (this.toastType) {
      case 'success': return '✓';
      case 'danger': return '⚠';
      case 'info': return 'ℹ';
      default: return '✓';
    }
  }

  getToastColor(): string {
    switch (this.toastType) {
      case 'success': return 'var(--success)';
      case 'danger': return 'var(--danger)';
      case 'info': return 'var(--info)';
      default: return 'var(--success)';
    }
  }
}