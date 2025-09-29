import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { GeolocationService } from '../services/geolocation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  currentLocation: string | null = null;

  constructor(private geoService: GeolocationService) {}

  async getLocation() {
    try {
      const permission = await this.geoService.checkPermissions();
      if (permission.location !== 'granted') {
        await this.geoService.requestPermissions();
      }

      const position = await this.geoService.getCurrentPosition();
      this.currentLocation = `Lat: ${position.coords.latitude.toFixed(5)}, Lon: ${position.coords.longitude.toFixed(5)}`;
    } catch (err) {
      console.error('Error obteniendo ubicación', err);
      this.currentLocation = 'No se pudo obtener la ubicación';
    }
  }

  sendEmergency() {
    alert('Se ha solicitado ayuda(demo)');
  }
}
