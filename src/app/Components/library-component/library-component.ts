import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImage: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './library-component.html',
  styleUrls: ['./library-component.css']
})
export class LibraryComponent implements AfterViewInit, OnDestroy {
  dramaBooks: Book[] = [
    {
      id: 1,
      title: 'The Silent Echo',
      author: 'Elena Rostov',
      price: 24.00,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 2,
      title: 'Fading Light',
      author: 'Marcus Chen',
      price: 18.50,
      coverImage: 'https://images.unsplash.com/photo-1629196914561-bd804b49463e?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 3,
      title: 'Autumn Leaves',
      author: 'Sarah Jenkins',
      price: 21.00,
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 4,
      title: 'The Glass Mind',
      author: 'David Alistair',
      price: 29.99,
      coverImage: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=600'
    }
  ];

  designBooks: Book[] = [
    {
      id: 5,
      title: 'Brutalist Forms',
      author: 'Institute of Design',
      price: 65.00,
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 6,
      title: 'Spatial Dynamics',
      author: 'Thomas Wright',
      price: 45.00,
      coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 7,
      title: 'Modern Typography',
      author: 'Elena Rostov',
      price: 35.00,
      coverImage: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 8,
      title: 'Design Systems',
      author: 'Marcus Chen',
      price: 50.00,
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'
    }
  ];

  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initSmoothScroll();
      this.initAnimations();
    }
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.lenis) this.lenis.destroy();
  }

  private initSmoothScroll(): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      this.lenis = new Lenis({
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
      } as any);
      const raf = (time: number) => {
        this.lenis!.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };
      this.rafId = requestAnimationFrame(raf);
    }
  }

  private initAnimations(): void {
    gsap.from('.gsap-reveal', {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.utils.toArray('.gsap-fade').forEach((section: any) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 90%'
        }
      });
    });

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch && window.innerWidth > 768) {
      gsap.to('.parallax-track-1', {
        x: -120,
        ease: 'none',
        scrollTrigger: {
          trigger: '.library-container',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
      gsap.to('.parallax-track-2', {
        x: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: '.library-container',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }
  }

  addToCart(book: Book): void {
    console.log(`Added to cart: ${book.title}`);
    // TODO: Implement actual cart service
  }
}