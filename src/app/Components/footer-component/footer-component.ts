import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="footer-grid">
        <div class="footer-brand">
          <p class="footer-logo">ATHENA</p>
          <p class="footer-tagline">An architectural approach to digital literature. Built for the devoted reader.</p>
        </div>
        <div>
          <p class="footer-col-title">Archive</p>
          <ul class="footer-links">
            <li><a routerLink="/new-arrivals">New Arrivals</a></li>
            <li><a routerLink="/editors-picks">Editor's Picks</a></li>
            <li><a routerLink="/classics">Classic Works</a></li>
            <li><a routerLink="/rare">Rare Editions</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-col-title">Company</p>
          <ul class="footer-links">
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/team">Editorial Team</a></li>
            <li><a routerLink="/careers">Careers</a></li>
            <li><a routerLink="/press">Press</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-col-title">Support</p>
          <ul class="footer-links">
            <li><a routerLink="/contact">Contact</a></li>
            <li><a routerLink="/faq">FAQ</a></li>
            <li><a routerLink="/privacy">Privacy Policy</a></li>
            <li><a routerLink="/terms">Terms of Use</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© MMXXIV ATHENA — All Rights Reserved</p>
        <div class="footer-socials">
          <a href="#">Instagram</a>
          <a href="#">Twitter</a>
          <a href="#">Substack</a>
          <a href="#">Goodreads</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      padding: 6rem 5% 4rem;
      background: #000;
      border-top: 1px solid rgba(255,255,255,0.06);
      color: var(--text, #E5E5E5);
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 4rem;
      padding-bottom: 5rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .footer-logo {
      font-family: var(--font-display, 'Oswald', sans-serif);
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 8px;
    }
    .footer-tagline {
      font-family: var(--font-serif, 'Cormorant Garamond', serif);
      font-size: 1rem;
      font-style: italic;
      color: rgba(255,255,255,0.3);
      margin-top: 1rem;
      line-height: 1.6;
      max-width: 260px;
    }
    .footer-col-title {
      font-family: var(--font-mono, 'Space Grotesk', sans-serif);
      font-size: 0.65rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: var(--accent, #B01E23);
      margin-bottom: 1.5rem;
    }
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0;
    }
    .footer-links a {
      font-family: var(--font-mono, 'Space Grotesk', sans-serif);
      font-size: 0.8rem;
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      letter-spacing: 1px;
      transition: color 0.3s;
    }
    .footer-links a:hover {
      color: var(--text, #E5E5E5);
    }
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 3rem;
    }
    .footer-copy {
      font-family: var(--font-mono, 'Space Grotesk', sans-serif);
      font-size: 0.65rem;
      color: rgba(255,255,255,0.2);
      letter-spacing: 2px;
    }
    .footer-socials {
      display: flex;
      gap: 2rem;
    }
    .footer-socials a {
      font-family: var(--font-mono, 'Space Grotesk', sans-serif);
      font-size: 0.65rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.25);
      text-decoration: none;
      transition: color 0.3s;
    }
    .footer-socials a:hover {
      color: var(--accent, #B01E23);
    }
    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
      }
    }
  `]
})
export class FooterComponent {}