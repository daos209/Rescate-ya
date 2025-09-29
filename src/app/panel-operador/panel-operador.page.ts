import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';

interface Alerta {
  id: number;
  usuario: string;
  ubicacion: string;
  descripcion: string;
  fecha: Date;
  estado: 'Pendiente' | 'Atendida';
}

@Component({
  selector: 'app-panel-operador',
  standalone: true,
  imports: [IonicModule, CommonModule, NgIf, NgFor],
  providers: [DatePipe],
  templateUrl: './panel-operador.page.html',
  styleUrls: ['./panel-operador.page.scss']
})
export class PanelOperadorPage {
  alertas: Alerta[] = [
    {
      id: 1,
      usuario: 'Juan Pérez',
      ubicacion: 'Av. Central 123',
      descripcion: 'Accidente de tránsito',
      fecha: new Date(),
      estado: 'Pendiente'
    },
    {
      id: 2,
      usuario: 'María López',
      ubicacion: 'Calle Falsa 456',
      descripcion: 'Incendio en vivienda',
      fecha: new Date(),
      estado: 'Pendiente'
    }
  ];

  marcarAtendida(alerta: Alerta) {
    alerta.estado = 'Atendida';
  }
}
