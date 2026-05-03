import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth-service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar-component.html',
  styleUrls: ['./navbar-component.css']
})
export class NavbarComponent implements OnInit,OnChanges {
  public isLoggedIn: any
  private isAdmin: any
  constructor(private authService: AuthService) { 
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoggedIn']) {
      this.isLoggedIn = changes['isLoggedIn'].currentValue;
    }
  }
  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
    this.authService.isAdmin().subscribe((admin) => {
      this.isAdmin = admin;
    });
  }
  logout(): void {
    this.authService.logout();
  }
  get IsAdmin(): boolean {
    return this.isAdmin;
  }
}