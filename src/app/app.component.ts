import { Component, OnInit } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  template: `
<ion-app>
  <!-- Menú lateral -->
  <ion-menu *ngIf="showMenu" side="start" menuId="main-menu" contentId="main-content">
    <ion-header>
      <ion-toolbar color="danger">
        <ion-avatar class="avatar">
          <img src="assets/rescateya.png" alt="RescateYa Logo" />
        </ion-avatar>
        <ion-title>RescateYa</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list lines="none">
        <ion-menu-toggle>
          <ion-item button (click)="navigateTo('/home')">
            <ion-icon name="home-outline" slot="start"></ion-icon>
            Home
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle>
          <ion-item button (click)="navigateTo('/profile')">
            <ion-icon name="person-outline" slot="start"></ion-icon>
            Perfil
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle>
          <ion-item button (click)="navigateTo('/panel-operador')">
            <ion-icon name="settings-outline" slot="start"></ion-icon>
            Panel de Operador
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>

  <!-- Contenido principal -->
  <ion-router-outlet id="main-content"></ion-router-outlet>
</ion-app>
  `,
  styles: [`
.avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 60px;
  margin-right: 10px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
  `]
})
export class AppComponent implements OnInit {
  showMenu = false;

  constructor(private router: Router, private menu: MenuController) {}

  ngOnInit() {
    // Detectar cambios de ruta para mostrar/ocultar menú
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showMenu = !!localStorage.getItem('loggedUserId') &&
                        !['/login', '/register'].includes(event.urlAfterRedirects);
      }
    });

    // Redirección según sesión
    setTimeout(() => {
      const loggedUserId = localStorage.getItem('loggedUserId');
      const currentUrl = this.router.url;

      if (!loggedUserId && !['/login', '/register'].includes(currentUrl)) {
        this.router.navigate(['/login']);
      } else if (loggedUserId && currentUrl === '/') {
        this.router.navigate(['/home']);
      }
    }, 0);
  }

  navigateTo(path: string) {
    this.router.navigate([path]).then(() => this.menu.close('main-menu'));
  }
}
