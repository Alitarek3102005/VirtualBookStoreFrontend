import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav>
      <div class="logo">ATHENA</div>
      <ul class="nav-links">
        <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Archive</a></li>
        <li><a routerLink="/collections" routerLinkActive="active">Collections</a></li>
        <li><a routerLink="/editorial" routerLinkActive="active">Editorial</a></li>
        <li><a routerLink="/about" routerLinkActive="active">About</a></li>
      </ul>
      <div class="nav-meta">Vol. 01 — The Infinite Archive</div>
    </nav>
  `,
  styles: [`
    nav {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      padding: 2rem 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
      mix-blend-mode: difference;
      pointer-events: none; /* Allow clicking through to content, but links remain clickable */
    }
    nav a, .nav-links li {
      pointer-events: auto;
    }
    .logo {
      font-family: var(--font-display, 'Oswald', sans-serif);
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: 6px;
    }
    .nav-links {
      display: flex;
      gap: 3rem;
      list-style: none;
    }
    .nav-links a {
      font-family: var(--font-mono, 'Space Grotesk', sans-serif);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: var(--text, #E5E5E5);
      text-decoration: none;
      opacity: 0.6;
      transition: opacity 0.3s;
    }
    .nav-links a:hover,
    .nav-links a.active {
      opacity: 1;
    }
    .nav-meta {
      font-family: var(--font-mono, 'Space Grotesk', sans-serif);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.5;
    }
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {}