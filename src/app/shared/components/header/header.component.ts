import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
