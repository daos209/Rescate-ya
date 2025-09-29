import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SqliteDbService, User } from '../services/sqlite-db.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage {
  user: User = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    medicalData: ''
  };
  errorMessage: string = '';

  constructor(private dbService: SqliteDbService, private router: Router) {}

  async register() {
    try {
      // Validaciones básicas
      if (!this.user.name || !this.user.email || !this.user.password || !this.user.phone) {
        this.errorMessage = 'Por favor completa todos los campos obligatorios.';
        return;
      }

      // Revisar si el correo ya existe
      const existingUser = await this.dbService.getUserByEmail(this.user.email);
      if (existingUser) {
        this.errorMessage = 'El correo ya está registrado.';
        return;
      }

      // Crear usuario
      const newId = await this.dbService.createUser(this.user);
      localStorage.setItem('loggedUserId', newId.toString());

      // Redirigir al home
      this.router.navigate(['/home']);
    } catch (err: any) {
      this.errorMessage = 'Error al registrar usuario: ' + (err?.message || err);
      console.error(err);
    }
  }
}
