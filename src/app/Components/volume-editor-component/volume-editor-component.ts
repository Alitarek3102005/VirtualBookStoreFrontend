import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf, NgFor, CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

interface VolumeFormData {
  title: string;
  author: string;
  publisher: string;
  genre: string;
  price: number | null;
  quantity: number | null;
  description: string;
  coverImage?: File | null;
}

@Component({
  selector: 'app-volume-editor',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './volume-editor-component.html',
  styleUrls: ['./volume-editor-component.css']
})
export class VolumeEditorComponent implements AfterViewInit {
  @ViewChild('form') form!: NgForm;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('previewImage') previewImage!: ElementRef<HTMLImageElement>;
  @ViewChild('uploadContent') uploadContent!: ElementRef<HTMLElement>;
  @ViewChild('dropZone') dropZone!: ElementRef<HTMLElement>;
  @ViewChild('saveBtn') saveBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnText') btnText!: ElementRef<HTMLElement>;
  @ViewChild('spinner') spinner!: ElementRef<HTMLElement>;

  formData: VolumeFormData = {
    title: '',
    author: '',
    publisher: '',
    genre: '',
    price: null,
    quantity: null,
    description: '',
    coverImage: null
  };

  publishers = [
    { value: 'PUB-001', label: 'Orbit Books Ltd.' },
    { value: 'PUB-002', label: 'Penguin Random House' },
    { value: 'PUB-003', label: 'Institute of Design Press' },
    { value: 'PUB-004', label: 'Independent Publish' }
  ];

  genres = [
    { value: 'sci-fi', label: 'Science Fiction & Fantasy' },
    { value: 'architecture', label: 'Architecture & Design' },
    { value: 'fiction', label: 'Literary Fiction' },
    { value: 'biography', label: 'Biography & History' },
    { value: 'tech', label: 'Technology & Computing' }
  ];

  isSaving = false;
  toastMessage: string | null = null;
  toastVisible = false;

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initDragDrop();
      this.initMagneticButton();
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

  private initDragDrop(): void {
    const dropZone = this.dropZone.nativeElement;
    const fileInput = this.fileInput.nativeElement;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'));
    });

    dropZone.addEventListener('drop', (e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (files && files[0]) {
        this.handleFile(files[0]);
        fileInput.files = files;
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) this.handleFile(file);
    });
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    this.formData.coverImage = file;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = this.previewImage.nativeElement;
      img.src = e.target?.result as string;
      img.style.display = 'block';
      this.uploadContent.nativeElement.style.opacity = '0';
    };
    reader.readAsDataURL(file);
  }

  private initMagneticButton(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      const btn = this.saveBtn.nativeElement;
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        if (this.isSaving) return;
        const pos = btn.getBoundingClientRect();
        const mx = e.clientX - pos.left - pos.width / 2;
        const my = e.clientY - pos.top - pos.height / 2;
        gsap.to(btn, { x: mx * 0.1, y: my * 0.1, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      });
    }
  }

  private initEntryAnimations(): void {
    gsap.from('.gsap-fade', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: 0.1 });
    gsap.from('.gsap-slide', { opacity: 0, y: 40, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.3 });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;
    this.btnText.nativeElement.innerText = 'Encrypting...';
    this.spinner.nativeElement.style.display = 'block';

    // Simulate network request
    setTimeout(() => {
      this.isSaving = false;
      this.btnText.nativeElement.innerText = 'Save to Archive';
      this.spinner.nativeElement.style.display = 'none';

      const title = this.formData.title;
      this.showToast(`"${title}" successfully committed to database.`);

      this.resetForm();
    }, 1800);
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;

    gsap.to('.toast', { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });

    setTimeout(() => {
      gsap.to('.toast', { x: 120, opacity: 0, duration: 0.4, ease: 'power3.in', onComplete: () => {
        this.toastVisible = false;
        this.toastMessage = null;
      }});
    }, 3500);
  }

  private resetForm(): void {
    this.form.resetForm();
    this.formData = {
      title: '',
      author: '',
      publisher: '',
      genre: '',
      price: null,
      quantity: null,
      description: '',
      coverImage: null
    };
    this.previewImage.nativeElement.style.display = 'none';
    this.uploadContent.nativeElement.style.opacity = '1';
    this.fileInput.nativeElement.value = '';
  }

  discard(): void {
    if (confirm('Are you sure you want to discard changes?')) {
      this.resetForm();
      // Navigate back or close
    }
  }
}