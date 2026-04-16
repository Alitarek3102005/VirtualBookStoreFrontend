import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  Renderer2,
  Inject,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-athena-archive',
  templateUrl: './athena-archive-component.html',
  styleUrls: ['./athena-archive-component.css'],
  standalone: true,
  encapsulation: ViewEncapsulation.None, // Required for global styles like cursor
})
export class AthenaArchiveComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroEyebrow') heroEyebrow!: ElementRef;
  @ViewChild('splitText') splitText!: ElementRef;
  @ViewChild('heroSubtitle') heroSubtitle!: ElementRef;
  @ViewChild('heroScrollHint') heroScrollHint!: ElementRef;
  @ViewChild('loaderBar') loaderBar!: ElementRef;
  @ViewChild('preloader') preloader!: ElementRef;
  @ViewChild('loaderPct') loaderPct!: ElementRef;
  @ViewChild('marqueeTrack') marqueeTrack!: ElementRef;
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('realmSection') realmSection!: ElementRef;
  @ViewChild('catTrack') catTrack!: ElementRef;
  @ViewChild('catTrackWrap') catTrackWrap!: ElementRef;
  @ViewChildren('counter') counters!: QueryList<ElementRef>;
  @ViewChild('nlSubmit') nlSubmit!: ElementRef;
  @ViewChild('cursorDot') cursorDot!: ElementRef;
  @ViewChild('cursorRing') cursorRing!: ElementRef;

  // Marquee items
  marqueeItems: string[] = [
    'Literary Fiction', 'Philosophy', 'Science & Cosmos', 'Poetry',
    'History', 'Technology', 'Art & Aesthetics', 'Biography',
    'Architecture', 'Anthropology', 'Mythology', 'Semiotics'
  ];

  // Reliable placeholder images (Picsum) – replace with your own if needed
  carouselImages: string[] = [
    'https://picsum.photos/id/1001/600/800', // Landscape
    'https://picsum.photos/id/1002/600/800', // Camera
    'https://picsum.photos/id/1003/600/800', // Deer
    'https://picsum.photos/id/1004/600/800', // Lake
    'https://picsum.photos/id/1005/600/800', // Mountain
    'https://picsum.photos/id/1006/600/800', // Forest
  ];

  private lenis!: Lenis;
  private rafId: number | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private ringX = 0;
  private ringY = 0;
  private cursorAnimationFrame: number | null = null;
  private rotationY = 0;
  private targetRotationY = 0;
  private isDragging = false;
  private startX = 0;
  private carouselRadius = 500;
  private catDragging = false;
  private catStartX = 0;
  private catScrollLeft = 0;
  private catAutoX = 0;
  private scrollTriggers: ScrollTrigger[] = [];

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initLenis();
      this.initCursor();
      this.initTextSplit();
      this.initPreloader();
      this.initMarquee();
      // Small delay ensures DOM is fully ready for 3D calculations
      setTimeout(() => this.initCarousel(), 50);
      this.initScrollAnimations();
      this.initCounters();
      this.initCategoryDragScroll();
      this.initNewsletter();
      this.handleResize();
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.cursorAnimationFrame) cancelAnimationFrame(this.cursorAnimationFrame);
    if (this.lenis) this.lenis.destroy();
    this.scrollTriggers.forEach(st => st.kill());
    ScrollTrigger.getAll().forEach(st => st.kill());
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private initLenis(): void {
    this.lenis = new Lenis({
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    } as any); // Bypass TypeScript error

    // Sync with ScrollTrigger
    this.lenis.on('scroll', () => ScrollTrigger.update());

    const raf = (time: number) => {
      this.lenis.raf(time);
      this.rafId = requestAnimationFrame(raf);
    };
    this.rafId = requestAnimationFrame(raf);
  }

  private initCursor(): void {
    const dot = this.cursorDot.nativeElement;
    const ring = this.cursorRing.nativeElement;
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.ringX = this.mouseX;
    this.ringY = this.mouseY;

    const animateCursor = () => {
      this.ringX += (this.mouseX - this.ringX) * 0.12;
      this.ringY += (this.mouseY - this.ringY) * 0.12;
      dot.style.transform = `translate(${this.mouseX}px, ${this.mouseY}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${this.ringX}px, ${this.ringY}px) translate(-50%, -50%)`;
      this.cursorAnimationFrame = requestAnimationFrame(animateCursor);
    };
    this.cursorAnimationFrame = requestAnimationFrame(animateCursor);

    window.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    const hoverElements = document.querySelectorAll('a, button, .category-card, .stat-card, .tag');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }

  private initTextSplit(): void {
    const element = this.splitText.nativeElement;
    const text = element.innerText;
    element.innerHTML = '';
    text.split('').forEach((char: string) => {
      const span = this.renderer.createElement('span');
      this.renderer.addClass(span, 'char');
      this.renderer.setProperty(span, 'innerText', char);
      this.renderer.appendChild(element, span);
    });
  }

  private initPreloader(): void {
    const pctEl = this.loaderPct.nativeElement;
    let pct = 0;
    const interval = setInterval(() => {
      pct = Math.min(pct + Math.floor(Math.random() * 8) + 1, 100);
      pctEl.textContent = String(pct).padStart(3, '0');
      if (pct >= 100) clearInterval(interval);
    }, 30);

    const tl = gsap.timeline();
    tl.to(this.loaderBar.nativeElement, {
      width: '100%',
      duration: 2.2,
      ease: 'power4.inOut'
    })
    .to(this.preloader.nativeElement, {
      yPercent: -100,
      duration: 1.5,
      ease: 'expo.inOut'
    }, '+=0.3')
    .to(this.heroEyebrow.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.8')
    .to('.char', {
      y: 0,
      rotationX: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.05,
      ease: 'back.out(1.7)'
    }, '-=0.6')
    .fromTo(this.heroSubtitle.nativeElement,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1 },
      '-=0.5'
    )
    .fromTo(this.heroScrollHint.nativeElement,
      { opacity: 0 },
      { opacity: 0.4, duration: 0.8 },
      '-=0.3'
    );
  }

  private initMarquee(): void {
    const track = this.marqueeTrack.nativeElement;
    [...this.marqueeItems, ...this.marqueeItems].forEach(item => {
      const div = this.renderer.createElement('div');
      this.renderer.addClass(div, 'marquee-item');
      div.innerHTML = `${item}<span class="dot"></span>`;
      this.renderer.appendChild(track, div);
    });
  }

  private initCarousel(): void {
    const carousel = this.carousel.nativeElement;
    const realm = this.realmSection.nativeElement;
    const numBooks = this.carouselImages.length;
    this.carouselRadius = window.innerWidth < 768 ? 250 : 500;
    const theta = 360 / numBooks;

    // Clear any existing children (safety)
    carousel.innerHTML = '';

    this.carouselImages.forEach((imgSrc, index) => {
      const book = this.renderer.createElement('div');
      this.renderer.addClass(book, 'book-3d');
      this.renderer.setStyle(book, 'transform', `rotateY(${index * theta}deg) translateZ(${this.carouselRadius}px)`);
      book.innerHTML = `
        <div class="book-cover" style="background-image: url('${imgSrc}')"></div>
        <div class="book-spine"></div>
        <div class="book-back"></div>
      `;
      this.renderer.appendChild(carousel, book);
    });

    // Drag events
    realm.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      this.startX = e.clientX;
      document.body.classList.add('dragging');
    });
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      document.body.classList.remove('dragging');
    });
    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      this.targetRotationY += (e.clientX - this.startX) * 0.2;
      this.startX = e.clientX;
    });
    realm.addEventListener('touchstart', (e: TouchEvent) => {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
    });
    window.addEventListener('touchend', () => { this.isDragging = false; });
    window.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.isDragging) return;
      this.targetRotationY += (e.touches[0].clientX - this.startX) * 0.3;
      this.startX = e.touches[0].clientX;
    });

    const render3D = () => {
      this.rotationY += (this.targetRotationY - this.rotationY) * 0.05;
      const scrollTilt = (window.scrollY / window.innerHeight) * -10;
      carousel.style.transform = `rotateX(${scrollTilt}deg) rotateY(${this.rotationY}deg)`;
      requestAnimationFrame(render3D);
    };
    render3D();

    // Pin realm section
    const st = ScrollTrigger.create({
      trigger: realm,
      start: 'top top',
      end: '+=1000',
      pin: true,
      onUpdate: (self) => {
        if (!this.isDragging) {
          this.targetRotationY -= self.getVelocity() * 0.05;
        }
      }
    });
    this.scrollTriggers.push(st);
  }

  private initScrollAnimations(): void {
    gsap.to('.parallax-img', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.editorial',
        scrub: true
      }
    });

    gsap.from('.gsap-slide', {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.editorial',
        start: 'top 70%'
      }
    });

    document.querySelectorAll('.reveal').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        }
      });
    });
  }

  private initCounters(): void {
    this.counters.forEach(counterRef => {
      const el = counterRef.nativeElement;
      const target = parseInt(el.dataset.target, 10);
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 2,
            ease: 'power3.out',
            onUpdate: function() {
              el.textContent = Math.floor(this['targets']()[0].val).toLocaleString();
            }
          });
        }
      });
      this.scrollTriggers.push(st);
    });
  }

  private initCategoryDragScroll(): void {
    const track = this.catTrack.nativeElement;
    const wrap = this.catTrackWrap.nativeElement;
    wrap.style.overflow = 'hidden';
    wrap.style.cursor = 'grab';

    wrap.addEventListener('mousedown', (e: MouseEvent) => {
      this.catDragging = true;
      this.catStartX = e.pageX;
      const transform = track.style.transform;
      this.catScrollLeft = transform ? parseInt(transform.replace('translateX(', ''), 10) || 0 : 0;
      wrap.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
      this.catDragging = false;
      wrap.style.cursor = 'grab';
    });
    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.catDragging) return;
      const walk = e.pageX - this.catStartX;
      const maxScroll = -(track.scrollWidth - wrap.clientWidth + 80);
      const newX = Math.min(0, Math.max(maxScroll, this.catScrollLeft + walk));
      track.style.transform = `translateX(${newX}px)`;
    });

    const st = ScrollTrigger.create({
      trigger: '.categories-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        if (!this.catDragging) {
          const maxScroll = -(track.scrollWidth - wrap.clientWidth + 80);
          this.catAutoX = maxScroll * self.progress;
          track.style.transform = `translateX(${this.catAutoX}px)`;
        }
      }
    });
    this.scrollTriggers.push(st);
  }

  private initNewsletter(): void {
    const btn = this.nlSubmit.nativeElement;
    btn.addEventListener('click', () => {
      btn.innerHTML = '<span>Thank you — Welcome to the Archive</span>';
      btn.style.borderColor = 'rgba(176,30,35,0.5)';
    });
  }

  private handleResize(): void {
    this.carouselRadius = window.innerWidth < 768 ? 250 : 500;
    const carousel = this.carousel?.nativeElement;
    if (!carousel) return;
    const books = carousel.children;
    const numBooks = books.length;
    const theta = 360 / numBooks;
    for (let i = 0; i < books.length; i++) {
      books[i].style.transform = `rotateY(${i * theta}deg) translateZ(${this.carouselRadius}px)`;
    }
  }
}