import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  headerTitle = 'Inicio';
  isMenuOpen = false;
  user: { name?: string } | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    this.authService.getUser().subscribe((user) => {
      this.user = user;
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateHeaderTitle(event.urlAfterRedirects);
      }
    });
  }

  updateHeaderTitle(url: string) {
    const routeTitles: Record<string, string> = {
      '/home': 'Bienvenido a TrendIfy',
      '/login': 'Inicia Sesión en TrendIfy',
      '/registro': 'Únete a TrendIfy',
      '/user-info':'Información de Perfil',
    };

    this.headerTitle = routeTitles[url] || this.user?.name || 'Inicio';
  }

  async logout() {
    try {
      await this.authService.removeUser();
      this.user = null;
      this.headerTitle = 'Inicio';
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  goToUserInfo() {
    this.router.navigate(['/user-info']);
  }

  onMenuOpen() {
    this.isMenuOpen = true;
  
    const firstMenuElement = document.querySelector('ion-menu ion-item');
    if (firstMenuElement) {
      (firstMenuElement as HTMLElement).focus();
    }
  }
  
  onMenuClose() {
    this.isMenuOpen = false;
  
    
    const menuButton = document.querySelector('ion-menu-button');
    if (menuButton) {
      (menuButton as HTMLElement).focus();
    }
  }
  
}
