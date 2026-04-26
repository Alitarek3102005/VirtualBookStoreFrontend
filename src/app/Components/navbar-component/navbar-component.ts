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
  public isLoggedIn: boolean = false;
  constructor(private authService: AuthService) { 
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoggedIn']) {
      this.isLoggedIn = changes['isLoggedIn'].currentValue;
    }
  }
  ngOnInit(): void {
    this.isLoggedIn=this.authService.isLoggedIn();
  }
  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
  }
}