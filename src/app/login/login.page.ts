import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SqliteDbService, User } from '../services/sqlite-db.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  highContrastMode: boolean = false;

  constructor(private dbService: SqliteDbService, private router: Router) {}

  toggleAccessibility() {
    this.highContrastMode = !this.highContrastMode;
  }

  async login() {
    try {
      if (!this.email || !this.password) {
        this.errorMessage = 'Ingresa correo y contraseña.';
        return;
      }

      const user: User | null = await this.dbService.validateLogin(this.email, this.password);
      if (user) {
        localStorage.setItem('loggedUserId', user.id!.toString());
        this.errorMessage = '';
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Correo o contraseña incorrectos.';
      }
    } catch (err: any) {
      console.error(err);
      this.errorMessage = 'Error al iniciar sesión: ' + (err?.message || err);
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
