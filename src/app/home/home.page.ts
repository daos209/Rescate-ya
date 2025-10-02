import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { GeolocationService } from '../services/geolocation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HomePage {

  constructor(
    private geolocationService: GeolocationService,
    private alertController: AlertController
  ) {}

  async sendSOS() {
    try {
      const position = await this.geolocationService.getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log('Ubicación enviada al servidor:', lat, lng);

      const alert = await this.alertController.create({
        header: ' Ubicación enviada',
        message: `Ubicación (${lat}, ${lng})`,
        buttons: ['OK']
      });
      await alert.present();

    } catch (error) {
      console.error('Error al enviar ubicación:', error);

      const alert = await this.alertController.create({
        header: ' Error',
        message: 'Erro al obterner ubicación.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
