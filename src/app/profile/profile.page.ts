import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SqliteDbService, User, EmergencyContact } from '../services/sqlite-db.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  user: User = { name: '', email: '', password: '', phone: '', address: '', medicalData: '' };
  emergencyContacts: EmergencyContact[] = [];
  successMessage = '';

  constructor(
    private dbService: SqliteDbService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() { 
    await this.loadUser(); 
  }

  async loadUser() {
    const userId = Number(localStorage.getItem('loggedUserId'));
    if (!userId) { 
      this.router.navigate(['/login']); 
      return; 
    }

    const userData = await this.dbService.getUserById(userId);
    if (userData) {
      this.user = userData;
      this.emergencyContacts = await this.dbService.getEmergencyContacts(userId);
    } else {
      this.router.navigate(['/login']);
    }
  }

  addContact() {
    const userId = Number(localStorage.getItem('loggedUserId'));
    this.emergencyContacts.push({ id: undefined, userId, name: '', phone: '' });
  }

  removeContact(index: number) { 
    this.emergencyContacts.splice(index, 1); 
  }

  async saveProfile() {
    try {
      const userId = Number(localStorage.getItem('loggedUserId'));
      if (!userId) return;

      await this.dbService.updateUser(userId, this.user);
      await this.dbService.updateEmergencyContacts(
        userId,
        this.emergencyContacts.map(c => ({ name: c.name, phone: c.phone }))
      );

      this.successMessage = 'Perfil guardado correctamente';
      setTimeout(() => this.successMessage = '', 3000);
    } catch (err) {
      console.error('Error guardando perfil:', err);
    }
  }

  logout() {
    localStorage.removeItem('loggedUserId');
    this.router.navigate(['/login']);
  }

  async deleteAccount() {
    const confirm = await this.alertController.create({
      header: 'Eliminar cuenta',
      message: '¿Estás seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              const userId = Number(localStorage.getItem('loggedUserId'));
              if (!userId) return;
              await this.dbService.deleteUser(userId);
              localStorage.removeItem('loggedUserId');
              this.router.navigate(['/login']);
            } catch (err) {
              console.error('Error eliminando usuario:', err);
            }
          }
        }
      ]
    });
    await confirm.present();
  }
}
