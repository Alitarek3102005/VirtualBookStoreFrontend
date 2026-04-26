import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './Components/navbar-component/navbar-component';
import { CommonModule } from '@angular/common';

import { AthenaArchiveComponent } from './Components/athena-archive-component/athena-archive-component';
import { FooterComponent } from './Components/footer-component/footer-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule,FooterComponent,
    
   ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('VirtualBookStore');
}
